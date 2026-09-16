import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('stations')
      .select('*')
      .order('estacion_id', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ stations: data || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al obtener estaciones' },
      { status: 500 }
    )
  }
}
