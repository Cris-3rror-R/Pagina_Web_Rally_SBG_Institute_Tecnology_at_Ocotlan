import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Autenticar con signInWithPassword usando el service role client
    const { data, error } = await adminSupabase.auth.signInWithPassword({
      email: email.includes('@') ? email : `${email}@rally.com`,
      password
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar que el usuario tiene rol de administrador
    const userRole = data.user.user_metadata?.role || data.user.app_metadata?.role
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin' ||
      // También verificar en la tabla de administradores
      (await checkAdminTable(adminSupabase, data.user.id))

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre: data.user.user_metadata?.nombre || data.user.email
      }
    })
  } catch (err) {
    console.error('Error en /api/auth/admin-login:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error de autenticación' },
      { status: 500 }
    )
  }
}

async function checkAdminTable(supabase: ReturnType<typeof createAdminClient>, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('administradores')
      .select('admin_id')
      .eq('admin_id', userId)
      .maybeSingle()
    return !error && !!data
  } catch {
    return false
  }
}
