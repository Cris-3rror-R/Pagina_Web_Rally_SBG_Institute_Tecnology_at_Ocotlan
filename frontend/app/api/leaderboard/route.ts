import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()

    // Obtener todos los equipos
    const { data: teamsData, error: teamsError } = await adminSupabase
      .from('equipos')
      .select('*')

    if (teamsError) {
      console.error('Error obteniendo equipos:', teamsError.message)
      return NextResponse.json({ error: teamsError.message }, { status: 500 })
    }

    const teams = teamsData || []

    // Obtener todas las estaciones completadas por equipo
    const { data: estacionesData } = await adminSupabase
      .from('equipo_estaciones')
      .select('equipo_id, estacion_id, completado, puntos_ganados')

    const estaciones = estacionesData || []

    // Contar estaciones completadas por equipo
    const progressByTeam: Record<string, number> = {}
    estaciones.forEach((row) => {
      if (row.completado) {
        progressByTeam[row.equipo_id] = (progressByTeam[row.equipo_id] || 0) + 1
      }
    })

    // Construir entradas del leaderboard
    const entries = teams.map((team: any) => {
      let duracionSegundos: number | null = null
      let tiempoFormateado = '--:--'
      let estado: 'no_iniciado' | 'en_progreso' | 'finalizado' = 'no_iniciado'

      if (team.tiempo_inicio && team.tiempo_final) {
        const start = new Date(team.tiempo_inicio).getTime()
        const end = new Date(team.tiempo_final).getTime()
        duracionSegundos = Math.max(0, Math.floor((end - start) / 1000))
        // Formatear HH:MM:SS
        const hrs = Math.floor(duracionSegundos / 3600)
        const mins = Math.floor((duracionSegundos % 3600) / 60)
        const secs = duracionSegundos % 60
        tiempoFormateado = [
          hrs > 0 ? String(hrs).padStart(2, '0') : null,
          String(mins).padStart(2, '0'),
          String(secs).padStart(2, '0'),
        ].filter(Boolean).join(':')
        estado = 'finalizado'
      } else if (team.tiempo_inicio) {
        estado = 'en_progreso'
        tiempoFormateado = 'En carrera'
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
        estado,
      }
    })

    // Ordenar: Mayor puntaje primero, desempate por menor tiempo
    entries.sort((a: any, b: any) => {
      if (b.puntaje_total !== a.puntaje_total) return b.puntaje_total - a.puntaje_total
      if (a.duracion_segundos !== null && b.duracion_segundos !== null)
        return a.duracion_segundos - b.duracion_segundos
      if (a.duracion_segundos !== null) return -1
      if (b.duracion_segundos !== null) return 1
      return a.nombre.localeCompare(b.nombre)
    })

    return NextResponse.json({ entries })
  } catch (err) {
    console.error('Error en /api/leaderboard:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al obtener clasificación' },
      { status: 500 }
    )
  }
}
