import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { equipo_id, estacion_id, puntos_ganados, completado } = body

    if (!equipo_id || estacion_id === undefined) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const puntos = Math.max(0, Number(puntos_ganados) || 0)

    // 1. Upsert en equipo_estaciones
    const { error: upsertError } = await adminSupabase
      .from('equipo_estaciones')
      .upsert(
        {
          equipo_id,
          estacion_id: Number(estacion_id),
          puntos_ganados: puntos,
          completado: Boolean(completado)
        },
        { onConflict: 'equipo_id,estacion_id' }
      )

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // 2. Calcular la suma total de puntos para este equipo
    const { data: allPoints } = await adminSupabase
      .from('equipo_estaciones')
      .select('puntos_ganados')
      .eq('equipo_id', equipo_id)

    let total = 0
    if (allPoints && allPoints.length > 0) {
      total = allPoints.reduce((acc, row) => acc + (row.puntos_ganados || 0), 0)
    } else {
      total = puntos
    }

    // 3. Actualizar equipo
    const { data: updatedTeam, error: updateError } = await adminSupabase
      .from('equipos')
      .update({
        puntaje_actual: total,
        puntaje_total: total
      })
      .eq('equipo_id', equipo_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, equipo: updatedTeam })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al calificar estación' },
      { status: 500 }
    )
  }
}
