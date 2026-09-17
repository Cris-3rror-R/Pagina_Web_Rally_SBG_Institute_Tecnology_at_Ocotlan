'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTeam } from '@/utils/rally-service'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'equipo' | 'admin'>('equipo')

  // Formulario Equipo
  const [teamName, setTeamName] = useState('')
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)

  // Formulario Admin
  const [adminUser, setAdminUser] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    setTeamLoading(true)
    setTeamError(null)

    try {
      const res = await createTeam(teamName.trim())
      if (res.success && res.equipo) {
        router.push(`/equipo?id=${res.equipo.equipo_id}`)
      } else {
        setTeamError(res.error || 'Error al crear equipo')
      }
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setTeamLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError(null)

    const cleanUser = adminUser.trim()
    const cleanPass = adminPassword.trim()

    try {
      // Usar el API server-side para autenticación (evita problemas con la publishable key del browser)
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanUser, password: cleanPass })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        localStorage.setItem('rally_is_admin', 'true')
        localStorage.setItem('rally_admin_name', data.user?.nombre || cleanUser)
        router.push('/admin')
        return
      }

      setAdminError(data.error || 'Usuario o contraseña incorrectos.')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setAdminLoading(false)
    }
  }


  return (
    <main className="min-h-screen bg-[var(--sbg-dark)] text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-[var(--sbg-dark-3)] bg-[var(--sbg-dark)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition">
            <img src="/imagenes/AWS_logo.png" alt="AWS" className="h-10 w-20 object-contain" />
            <span className="font-bold text-sm hidden sm:inline text-white">
              AWS CHALLENGE
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-[var(--text-secondary)] hover:text-white border border-[var(--sbg-dark-3)] px-3 py-1.5 rounded-lg transition"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      {/* Tarjeta de Acceso */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[var(--sbg-dark-2)] border border-[var(--sbg-dark-3)] rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white">Acceso al Rally</h1>
            <p className="text-xs text-[var(--text-secondary)]">Selecciona tu perfil de acceso</p>
          </div>

          {/* Selector de rol */}
          <div className="flex bg-[var(--sbg-dark)] p-1 rounded-xl border border-[var(--sbg-dark-3)]">
            <button
              type="button"
              onClick={() => setRole('equipo')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'equipo'
                  ? 'bg-[var(--sbg-orange)] text-[var(--sbg-dark)] shadow'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              👥 Crear Equipo
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-[var(--sbg-blue)] text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              👨‍💼 Administrador
            </button>
          </div>

          {/* Formulario Equipo */}
          {role === 'equipo' && (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              {teamError && (
                <div className="p-3 rounded-xl bg-[var(--sbg-dark)] border border-[var(--sbg-pink)] text-[var(--sbg-pink)] text-xs">
                  ⚠️ {teamError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Nombre del Equipo:
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej: CyberTeam AWS"
                  required
                  disabled={teamLoading}
                  className="w-full px-4 py-3 bg-[var(--sbg-dark)] border border-[var(--sbg-dark-3)] rounded-xl text-white outline-none focus:border-[var(--sbg-orange)] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={teamLoading || !teamName.trim()}
                className="w-full py-3 px-6 bg-[var(--sbg-orange)] text-white font-black text-base rounded-xl transition"
              >
                {teamLoading ? 'Creando...' : 'Crear'}
              </button>
            </form>
          )}

          {/* Formulario Admin */}
          {role === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminError && (
                <div className="p-3 rounded-xl bg-[var(--sbg-dark)] border border-[var(--sbg-pink)] text-[var(--sbg-pink)] text-xs">
                  ⚠️ {adminError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Usuario o Correo:
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin o admin@rally.com"
                  required
                  disabled={adminLoading}
                  className="w-full px-4 py-3 bg-[var(--sbg-dark)] border border-[var(--sbg-dark-3)] rounded-xl text-white outline-none focus:border-[var(--sbg-blue)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Contraseña:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={adminLoading}
                  className="w-full px-4 py-3 bg-[var(--sbg-dark)] border border-[var(--sbg-dark-3)] rounded-xl text-white outline-none focus:border-[var(--sbg-blue)] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading || !adminUser.trim() || !adminPassword.trim()}
                className="w-full py-3 px-6 bg-[var(--sbg-blue)] text-white font-black text-base rounded-xl transition"
              >
                {adminLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--sbg-dark-3)] py-4 px-4 text-center text-xs text-[var(--text-secondary)] bg-[var(--sbg-dark)]">
        AWS CHALLENGE © 2026
      </footer>
    </main>
  )
}
