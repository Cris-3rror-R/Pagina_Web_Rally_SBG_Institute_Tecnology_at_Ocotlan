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
    const { data: current, error: currentError } = await adminSupabase
      .from('equipos')
      .select('equipo_id, tiempo_inicio, tiempo_final')
      .eq('equipo_id', equipo_id)
      .maybeSingle()

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 })
    }
    if (!current) {
      return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 })
    }

    if (action === 'start' && (current.tiempo_inicio || current.tiempo_final)) {
      return NextResponse.json({ error: 'Este equipo ya inició el cronómetro.' }, { status: 409 })
    }
    if (action === 'finish' && current.tiempo_final) {
      return NextResponse.json({ error: 'Este equipo ya detuvo el cronómetro.' }, { status: 409 })
    }
    if (action === 'finish' && !current.tiempo_inicio) {
      return NextResponse.json({ error: 'El equipo debe iniciar el cronómetro antes de detenerlo.' }, { status: 409 })
    }

    const updatePayload = action === 'start'
      ? { tiempo_inicio: timeValue }
      : { tiempo_final: timeValue }

    const { data: updated, error } = await adminSupabase
      .from('equipos')
      .update(updatePayload)
      .eq('equipo_id', equipo_id)
      .select()
      .single()

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
