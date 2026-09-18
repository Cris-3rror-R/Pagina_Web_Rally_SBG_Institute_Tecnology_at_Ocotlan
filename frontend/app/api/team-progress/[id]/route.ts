import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const equipoId = params.id

  if (!equipoId) {
    return NextResponse.json({ error: 'ID de equipo requerido' }, { status: 400 })
  }

  try {
    const adminSupabase = createAdminClient()

    // Obtener equipo actualizado
    const { data: equipo, error: equipoError } = await adminSupabase
      .from('equipos')
      .select('*')
      .eq('equipo_id', equipoId)
      .maybeSingle()

    if (equipoError) {
      return NextResponse.json({ error: equipoError.message }, { status: 500 })
    }

    // Obtener estaciones desde la BD
    const { data: stations, error: stationsError } = await adminSupabase
      .from('stations')
      .select('*')
      .order('estacion_id', { ascending: true })

    if (stationsError) {
      return NextResponse.json({ error: stationsError.message }, { status: 500 })
    }

    // Obtener progreso del equipo en las estaciones
    const { data: progreso, error: progresoError } = await adminSupabase
      .from('equipo_estaciones')
      .select('estacion_id, puntos_ganados, completado')
      .eq('equipo_id', equipoId)

    if (progresoError) {
      console.warn('Error cargando progreso del equipo:', progresoError.message)
    }

    const progresoMap: Record<number, { puntos_ganados: number; completado: boolean }> = {}
    ;(progreso || []).forEach((p: any) => {
      progresoMap[p.estacion_id] = {
        puntos_ganados: Number(p.puntos_ganados || 0),
        completado: Boolean(p.completado)
      }
    })

    const normalizedStations = Array.from({ length: 5 }, (_, index) => {
      const estacionId = index + 1
      const existing = (stations || []).find((st: any) => Number(st.estacion_id) === estacionId)

      return {
        estacion_id: estacionId,
        nombre: existing?.nombre || `Estación ${estacionId}`,
        encargados: existing?.encargados || '',
        descripcion: existing?.descripcion || '',
        ubicacion_palabra: existing?.ubicacion_palabra || '',
        puntos_totales: Number(existing?.puntos_totales || 0),
      }
    })

    const stationsProgress = normalizedStations.map((st: any) => ({
      station: st,
      completado: progresoMap[st.estacion_id]?.completado ?? false,
      puntos_ganados: progresoMap[st.estacion_id]?.puntos_ganados ?? 0
    }))

    return NextResponse.json(
      { equipo: equipo || null, stationsProgress },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al obtener progreso' },
      { status: 500 }
    )
  }
}
