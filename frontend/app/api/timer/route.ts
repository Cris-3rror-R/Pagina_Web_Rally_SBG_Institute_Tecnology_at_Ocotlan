import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { equipo_id, action, timestamp } = body

    if (!equipo_id || !action) {
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

    const { data: updated, error } = await adminSupabase
      .from('equipos')
      .update(updatePayload)
      .eq('equipo_id', equipo_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, equipo: updated, timestamp: timeValue })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al actualizar cronómetro' },
      { status: 500 }
    )
  }
}
