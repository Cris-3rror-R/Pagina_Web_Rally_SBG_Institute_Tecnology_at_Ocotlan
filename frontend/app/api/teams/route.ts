import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()
    const { data: teams, error } = await adminSupabase
      .from('equipos')
      .select('*')
      .order('puntaje_total', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener también estaciones para cada equipo
    const { data: progreso } = await adminSupabase
      .from('equipo_estaciones')
      .select('equipo_id, estacion_id, puntos_ganados, completado')

    return NextResponse.json({ teams: teams || [], progreso: progreso || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al obtener equipos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre } = body

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre del equipo es obligatorio' }, { status: 400 })
    }

    const cleanName = nombre.trim()
    const adminSupabase = createAdminClient()

    // 1. Crear usuario en auth.users (el trigger on_auth_user_created creará el equipo en BD)
    const email = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@rally.com`
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'EQUIPO',
        nombre: cleanName
      }
    })

    if (authError || !authData.user) {
      console.error('Error creando auth user en API:', authError)
      return NextResponse.json({ error: authError?.message || 'Error creando usuario' }, { status: 500 })
    }

    const newTeamId = authData.user.id

    // El trigger en postgres es síncrono, consultamos el equipo recién creado
    const { data: equipo, error: fetchError } = await adminSupabase
      .from('equipos')
      .select('*')
      .eq('equipo_id', newTeamId)
      .single()

    if (fetchError) {
       console.error('Advertencia: No se pudo cargar el equipo post-trigger:', fetchError)
    }

    // 2. Inicializar las 4 estaciones para el equipo
    const stationsInit = [1, 2, 3, 4].map((estacion_id) => ({
      equipo_id: newTeamId,
      estacion_id,
      puntos_ganados: 0,
      completado: false
    }))

    await adminSupabase
      .from('equipo_estaciones')
      .upsert(stationsInit, { onConflict: 'equipo_id,estacion_id' })

    const resEquipo = equipo || {
      equipo_id: newTeamId,
      nombre: cleanName,
      puntaje_actual: 0,
      puntaje_total: 0
    }

    return NextResponse.json({ success: true, equipo: resEquipo }, { status: 201 })
  } catch (err) {
    console.error('Error procesando POST /api/teams:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear equipo' },
      { status: 500 }
    )
  }
}
