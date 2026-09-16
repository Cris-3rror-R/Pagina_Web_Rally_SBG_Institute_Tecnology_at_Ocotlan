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
    <main className="min-h-screen bg-gradient-to-b from-[#0F1419] via-[#1A2332] to-[#232F3E] text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-[#0F1419]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-md bg-[#FF9900] text-[#0F1419] font-black flex items-center justify-center text-sm">
              AWS
            </div>
            <span className="font-bold text-sm hidden sm:inline text-white">
              AWS CHALLENGE
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      {/* Tarjeta de Acceso */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[#161F2E] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white">Acceso al Rally</h1>
            <p className="text-xs text-gray-400">Selecciona tu perfil de acceso</p>
          </div>

          {/* Selector de rol */}
          <div className="flex bg-[#0F1419] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole('equipo')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'equipo'
                  ? 'bg-[#FF9900] text-[#0F1419] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👥 Crear Equipo
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-[#0A66C2] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👨‍💼 Administrador
            </button>
          </div>

          {/* Formulario Equipo */}
          {role === 'equipo' && (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              {teamError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                  ⚠️ {teamError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Nombre del Equipo:
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej: CyberTeam AWS"
                  required
                  disabled={teamLoading}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-white/20 rounded-xl text-white outline-none focus:border-[#FF9900] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={teamLoading || !teamName.trim()}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#FF9900] to-[#FF7700] hover:from-[#FF8800] hover:to-[#FF6600] text-[#0F1419] font-black text-base rounded-xl shadow-lg transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {teamLoading ? 'Creando...' : 'Crear'}
              </button>
            </form>
          )}

          {/* Formulario Admin */}
          {role === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                  ⚠️ {adminError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Usuario o Correo:
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin o admin@rally.com"
                  required
                  disabled={adminLoading}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-white/20 rounded-xl text-white outline-none focus:border-[#0A66C2] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Contraseña:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={adminLoading}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-white/20 rounded-xl text-white outline-none focus:border-[#0A66C2] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading || !adminUser.trim() || !adminPassword.trim()}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#0A66C2] to-[#004C99] hover:from-[#0B74DB] hover:to-[#0A5BA6] text-white font-black text-base rounded-xl shadow-lg transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {adminLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-gray-500 bg-[#0F1419]">
        AWS CHALLENGE © 2026
      </footer>
    </main>
  )
}
