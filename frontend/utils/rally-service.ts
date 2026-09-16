import { createClient } from './supabase/client'
import { Equipo, Station, EquipoEstacion, TeamStationProgress, LeaderboardEntry } from '../types/rally'

export const START_QR_CODE = 'InicioAWS_Quest2026_7A3nM_1'
export const FINISH_QR_CODE = 'FinAWS_Quest2026_7shnM_1'

/**
 * 1. CREAR EQUIPO
 * Solo requiere el nombre del equipo.
 */
export async function createTeam(nombre: string): Promise<{ success: boolean; equipo?: Equipo; error?: string }> {
  if (!nombre || !nombre.trim()) {
    return { success: false, error: 'El nombre del equipo es obligatorio' }
  }

  const cleanName = nombre.trim()

  try {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: cleanName })
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'Error al crear equipo' }
    }

    const equipo = data.equipo as Equipo

    // Guardar en almacenamiento local para sesión persistente
    if (typeof window !== 'undefined') {
      localStorage.setItem('rally_current_team_id', equipo.equipo_id)
      localStorage.setItem('rally_current_team_name', equipo.nombre)
      localStorage.setItem('rally_team_session', JSON.stringify(equipo))
    }

    return { success: true, equipo }
  } catch (err) {
    console.error('Error general creando equipo:', err)
    return { success: false, error: 'Error de red al crear equipo' }
  }
}

/**
 * 2. OBTENER INFORMACIÓN DEL EQUIPO
 */
export async function getTeam(equipoId: string): Promise<Equipo | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('equipo_id', equipoId)
      .maybeSingle()

    if (!error && data) {
      return data as Equipo
    }
  } catch (err) {
    console.warn('Error al obtener equipo de Supabase:', err)
  }

  // Fallback de localStorage
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('rally_team_session')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed.equipo_id === equipoId) return parsed
      } catch {
        // ignore
      }
    }
  }
  return null
}

/**
 * 3. OBTENER ESTACIONES (1 a 4)
 * Solo se obtienen las estaciones desde la base de datos (no hay fallback).
 */
export async function getStations(): Promise<Station[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('estacion_id', { ascending: true })

    if (!error && data && data.length > 0) {
      return data as Station[]
    }
  } catch (err) {
    console.warn('Error cargando estaciones desde Supabase:', err)
  }

  return []
}

/**
 * 4. OBTENER PROGRESO DE ESTACIONES DEL EQUIPO (Estaciones 1 a 4)
 */
export async function getTeamStationsProgress(equipoId: string): Promise<TeamStationProgress[]> {
  const stations = await getStations()
  let records: EquipoEstacion[] = []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('equipo_estaciones')
      .select('*')
      .eq('equipo_id', equipoId)

    if (!error && data) {
      records = data as EquipoEstacion[]
    }
  } catch (err) {
    console.warn('Error cargando equipo_estaciones:', err)
  }

  // Fallback si no hay registros o offline
  if (records.length === 0 && typeof window !== 'undefined') {
    const cached = localStorage.getItem(`rally_progress_${equipoId}`)
    if (cached) {
      try {
        records = JSON.parse(cached)
      } catch {
        // ignore
      }
    }
  }

  // Mapear cada estación
  return stations.map((st) => {
    const record = records.find((r) => r.estacion_id === st.estacion_id)
    return {
      station: st,
      completado: record ? Boolean(record.completado) : false,
      puntos_ganados: record ? Number(record.puntos_ganados || 0) : 0
    }
  })
}

/**
 * 5. VALIDAR Y ESCANEAR QR DE INICIO (Comienza cronómetro)
 */
export async function startTeamTimer(
  equipoId: string,
  qrCode: string
): Promise<{ success: boolean; error?: string; timestamp?: string }> {
  const trimmed = qrCode.trim().toUpperCase()
  const validCodes = [START_QR_CODE.toUpperCase(), 'RALLY_START', 'START', 'INICIO']

  if (!validCodes.some(c => trimmed.includes(c))) {
    return { success: false, error: 'Código QR de inicio no válido. Asegúrate de escanear el QR oficial de arranque del Rally.' }
  }

  const nowIso = new Date().toISOString()
  let savedTimestamp = nowIso

  try {
    const response = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipo_id: equipoId, action: 'start', timestamp: nowIso })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'El cronómetro ya fue iniciado para este equipo.' }
    }
    savedTimestamp = data.timestamp || nowIso
  } catch (err) {
    console.error('Error en API de inicio del cronómetro:', err)
    return { success: false, error: 'No se pudo iniciar el cronómetro. Comprueba la conexión.' }
  }

  // Actualizar sesión local
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('rally_team_session')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        parsed.tiempo_inicio = savedTimestamp
        localStorage.setItem('rally_team_session', JSON.stringify(parsed))
      } catch {
        // ignore
      }
    }
  }

  return { success: true, timestamp: savedTimestamp }
}

/**
 * 6. VALIDAR Y ESCANEAR QR DE FINALIZACIÓN (Detiene cronómetro)
 */
export async function stopTeamTimer(
  equipoId: string,
  qrCode: string
): Promise<{ success: boolean; error?: string; timestamp?: string }> {
  const trimmed = qrCode.trim().toUpperCase()
  const validCodes = [FINISH_QR_CODE.toUpperCase(), 'RALLY_FINISH', 'FINISH', 'FINAL', 'FIN']

  if (!validCodes.some(c => trimmed.includes(c))) {
    return { success: false, error: 'Código QR de finalización no válido. Asegúrate de escanear el QR oficial de cierre del Rally.' }
  }

  const nowIso = new Date().toISOString()
  let savedTimestamp = nowIso

  try {
    const response = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipo_id: equipoId, action: 'finish', timestamp: nowIso })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'El cronómetro ya fue detenido para este equipo.' }
    }
    savedTimestamp = data.timestamp || nowIso
  } catch (err) {
    console.error('Error en API de finalización del cronómetro:', err)
    return { success: false, error: 'No se pudo detener el cronómetro. Comprueba la conexión.' }
  }

  // Actualizar sesión local
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('rally_team_session')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        parsed.tiempo_final = savedTimestamp
        localStorage.setItem('rally_team_session', JSON.stringify(parsed))
      } catch {
        // ignore
      }
    }
  }

  return { success: true, timestamp: savedTimestamp }
}

/**
 * 7. ASIGNAR PUNTOS POR ESTACIÓN (ADMINISTRADOR)
 */
export async function assignStationPoints(
  equipoId: string,
  estacionId: number,
  puntos: number,
  completado: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // 1. Upsert en equipo_estaciones
    const { error: upsertError } = await supabase
      .from('equipo_estaciones')
      .upsert(
        {
          equipo_id: equipoId,
          estacion_id: estacionId,
          puntos_ganados: Math.max(0, puntos),
          completado: completado
        },
        { onConflict: 'equipo_id,estacion_id' }
      )

    if (upsertError) {
      console.warn('Error al hacer upsert en equipo_estaciones:', upsertError.message)
    }

    // 2. Recalcular suma de puntos para el equipo
    const { data: allPoints } = await supabase
      .from('equipo_estaciones')
      .select('puntos_ganados')
      .eq('equipo_id', equipoId)

    let totalPuntos = 0
    if (allPoints && allPoints.length > 0) {
      totalPuntos = allPoints.reduce((acc, row) => acc + (row.puntos_ganados || 0), 0)
    } else {
      totalPuntos = puntos
    }

    // 3. Actualizar equipo
    await supabase
      .from('equipos')
      .update({
        puntaje_actual: totalPuntos,
        puntaje_total: totalPuntos
      })
      .eq('equipo_id', equipoId)

    // Actualizar localStorage para reflejo inmediato si es el equipo local
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`rally_progress_${equipoId}`)
      let list: any[] = cached ? JSON.parse(cached) : []
      const existingIdx = list.findIndex(r => r.estacion_id === estacionId)
      if (existingIdx >= 0) {
        list[existingIdx] = { equipo_id: equipoId, estacion_id: estacionId, puntos_ganados: puntos, completado }
      } else {
        list.push({ equipo_id: equipoId, estacion_id: estacionId, puntos_ganados: puntos, completado })
      }
      localStorage.setItem(`rally_progress_${equipoId}`, JSON.stringify(list))

      // También actualizar el equipo guardado en sesión
      const teamSession = localStorage.getItem('rally_team_session')
      if (teamSession) {
        try {
          const parsed = JSON.parse(teamSession)
          if (parsed.equipo_id === equipoId) {
            parsed.puntaje_total = totalPuntos
            parsed.puntaje_actual = totalPuntos
            localStorage.setItem('rally_team_session', JSON.stringify(parsed))
          }
        } catch {
          // ignore
        }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Error asignando puntos:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/**
 * 8. OBTENER CLASIFICACIÓN / LEADERBOARD
 * Ordenado por mayor puntaje y menor tiempo transcurrido
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient()

    const { data: teamsData, error } = await supabase
      .from('equipos')
      .select('*')

    if (error) {
      console.warn('Error obteniendo equipos para leaderboard:', error.message)
    }

    const teams: Equipo[] = teamsData && teamsData.length > 0 ? (teamsData as Equipo[]) : []

    // Obtener todas las estaciones completadas
    const { data: estacionesData } = await supabase
      .from('equipo_estaciones')
      .select('equipo_id, estacion_id, completado, puntos_ganados')

    const progressByTeam: Record<string, number> = {}
    if (estacionesData) {
      estacionesData.forEach((row) => {
        if (row.completado) {
          progressByTeam[row.equipo_id] = (progressByTeam[row.equipo_id] || 0) + 1
        }
      })
    }

    // Construir entradas del leaderboard
    const entries: LeaderboardEntry[] = teams.map((team) => {
      let duracionSegundos: number | null = null
      let tiempoFormateado = '--:--:--'
      let estado: LeaderboardEntry['estado'] = 'no_iniciado'

      if (team.tiempo_inicio && team.tiempo_final) {
        const start = new Date(team.tiempo_inicio).getTime()
        const end = new Date(team.tiempo_final).getTime()
        duracionSegundos = Math.max(0, Math.floor((end - start) / 1000))
        tiempoFormateado = formatDuration(duracionSegundos)
        estado = 'finalizado'
      } else if (team.tiempo_inicio) {
        estado = 'en_progreso'
        tiempoFormateado = 'En carrera ⏱️'
      }

      return {
        equipo_id: team.equipo_id,
        nombre: team.nombre,
        puntaje_total: Number(team.puntaje_total ?? team.puntaje_actual ?? 0),
        tiempo_inicio: team.tiempo_inicio,
        tiempo_final: team.tiempo_final,
        duracion_segundos: duracionSegundos,
        tiempo_formateado: tiempoFormateado,
        estaciones_completadas: progressByTeam[team.equipo_id] || 0,
        estado
      }
    })

    // Ordenar:
    // 1. Mayor puntaje total (DESC)
    // 2. Menor tiempo (equipos finalizados con menor duracionSegundos van primero)
    entries.sort((a, b) => {
      if (b.puntaje_total !== a.puntaje_total) {
        return b.puntaje_total - a.puntaje_total
      }

      // Si tienen el mismo puntaje, ordenar por menor tiempo
      if (a.duracion_segundos !== null && b.duracion_segundos !== null) {
        return a.duracion_segundos - b.duracion_segundos
      }
      if (a.duracion_segundos !== null) return -1
      if (b.duracion_segundos !== null) return 1

      return 0
    })

    return entries
  } catch (err) {
    console.error('Error calculando leaderboard:', err)
    return []
  }
}

/**
 * 9. OBTENER TODOS LOS EQUIPOS CON DETALLE PARA ADMIN
 */
export async function getAllTeamsWithDetails(): Promise<{ equipo: Equipo; progress: TeamStationProgress[] }[]> {
  const supabase = createClient()
  const { data: teams } = await supabase
    .from('equipos')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (teams || []) as Equipo[]
  const results: { equipo: Equipo; progress: TeamStationProgress[] }[] = []

  for (const team of list) {
    const progress = await getTeamStationsProgress(team.equipo_id)
    results.push({ equipo: team, progress })
  }

  return results
}

/**
 * Helper para formatear segundos a HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [
    hrs > 0 ? hrs.toString().padStart(2, '0') : null,
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ]
    .filter(Boolean)
    .join(':')
}
