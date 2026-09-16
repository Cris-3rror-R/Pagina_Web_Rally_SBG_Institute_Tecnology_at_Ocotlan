export interface Administrador {
  admin_id: string
  nombre: string
  created_at?: string
  updated_at?: string
}

export interface Equipo {
  equipo_id: string
  nombre: string
  tiempo_inicio: string | null
  tiempo_final: string | null
  puntaje_actual: number
  puntaje_total: number
  created_at?: string
  updated_at?: string
}

export interface Station {
  estacion_id: number
  nombre: string
  encargados?: string | null
  descripcion?: string | null
  ubicacion_palabra?: string | null
  puntos_totales: number
  created_at?: string
  updated_at?: string
}

export interface EquipoEstacion {
  id?: number
  equipo_id: string
  estacion_id: number
  puntos_ganados: number
  completado: boolean
  created_at?: string
  updated_at?: string
  station?: Station
}

export interface TeamStationProgress {
  station: Station
  completado: boolean
  puntos_ganados: number
}

export interface LeaderboardEntry {
  equipo_id: string
  nombre: string
  puntaje_total: number
  tiempo_inicio: string | null
  tiempo_final: string | null
  duracion_segundos: number | null
  tiempo_formateado: string
  estaciones_completadas: number
  estado: 'no_iniciado' | 'en_progreso' | 'finalizado'
}
