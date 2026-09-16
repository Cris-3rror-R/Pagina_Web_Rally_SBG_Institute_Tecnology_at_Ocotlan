import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { equipo_id, action, timestamp } = body

    if (!equipo_id || !action || !['start', 'finish'].includes(action)) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const timeValue = timestamp || new Date().toISOString()

    const updatePayload: Record<string, string> = {}
    if (action === 'start') {
      updatePayload.tiempo_inicio = timeValue
    } else if (action === 'finish') {
      updatePayload.tiempo_final = timeValue
    }

    let updateQuery = adminSupabase
      .from('equipos')
      .update(updatePayload)
      .eq('equipo_id', equipo_id)

    if (action === 'start') {
      updateQuery = updateQuery.is('tiempo_inicio', null).is('tiempo_final', null)
    } else {
      updateQuery = updateQuery.is('tiempo_final', null).not('tiempo_inicio', 'is', null)
    }

    const { data: updated, error } = await updateQuery
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json(
        { error: action === 'start'
          ? 'Este equipo ya inició el cronómetro.'
          : 'Este equipo ya detuvo el cronómetro.' },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, equipo: updated, timestamp: timeValue })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al actualizar cronómetro' },
      { status: 500 }
    )
  }
}
