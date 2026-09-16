'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTeam } from '@/utils/rally-service'
import { createClient } from '@/utils/supabase/client'

export default function HomePage() {
  const router = useRouter()

  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const [teamName, setTeamName] = useState('')
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)

  const [adminUser, setAdminUser] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)

  const [existingTeamName, setExistingTeamName] = useState<string | null>(null)
  const [existingTeamId, setExistingTeamId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('rally_current_team_id')
      const storedName = localStorage.getItem('rally_current_team_name')
      if (storedId && storedName) {
        setExistingTeamId(storedId)
        setExistingTeamName(storedName)
      }
    }
  }, [])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setTeamError('Ingresa el nombre de tu equipo')
      return
    }
    setTeamLoading(true)
    setTeamError(null)
    try {
      const res = await createTeam(teamName.trim())
      if (res.success && res.equipo) {
        router.push(`/equipo?id=${res.equipo.equipo_id}`)
      } else {
        setTeamError(res.error || 'No se pudo crear el equipo. Inténtalo de nuevo.')
      }
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Error inesperado al crear equipo')
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
      const supabase = createClient()
      const email = cleanUser.includes('@') ? cleanUser : `${cleanUser}@rally.com`
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: cleanPass })
      const isValidAdmin = !error && data.user

      if (isValidAdmin) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rally_is_admin', 'true')
          localStorage.setItem('rally_admin_name', cleanUser)
        }
        router.push('/admin')
      } else {
        setAdminError('Usuario o contraseña de administrador incorrectos.')
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Error al verificar credenciales')
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--sbg-dark)]">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--sbg-purple)] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--sbg-blue)] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--sbg-dark-3)] bg-[var(--sbg-dark)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm rounded bg-gradient-to-br from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white shadow-[var(--glow-primary)]">
              AWS
            </div>
          </div>
          
          <Link
            href="/leaderboard"
            className="text-sm font-bold px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--sbg-purple)] to-[var(--sbg-pink)] text-white hover:scale-105 transition-transform shadow-[var(--glow-primary)] flex items-center gap-2"
          >
            <span>🏆</span>
            <span>Clasificación Global</span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10">
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--sbg-blue)] to-[var(--sbg-green)] leading-tight">
          AWS CHALLENGE
          <span className="block text-2xl sm:text-3xl md:text-4xl mt-4 text-[var(--text-secondary)] font-semibold">
            Rally de Conocimiento en el Día de ISC y Ciberseguridad
          </span>
        </h1>
        
        <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-12">
          Demuestra tus habilidades resolviendo retos de arquitectura, seguridad y despliegue en la nube. ¡Registra a tu equipo y compite en tiempo real!
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md mx-auto">
          <button
            onClick={() => setShowTeamModal(true)}
            className="w-full py-4 text-base font-bold text-[var(--sbg-dark)] bg-gradient-to-r from-[var(--sbg-green)] to-[var(--sbg-blue)] rounded-xl hover:scale-105 transition-all shadow-[var(--glow-accent)]"
          >
            Crear Equipo
          </button>
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full py-4 text-base font-bold text-[var(--text-primary)] bg-[var(--sbg-dark-2)] border border-[var(--sbg-dark-3)] rounded-xl hover:bg-[var(--sbg-dark-3)] transition-all"
          >
            Administrador
          </button>
        </div>

        {existingTeamName && existingTeamId && (
          <div className="mt-8 pt-6 border-t border-[var(--sbg-dark-3)] w-full max-w-md mx-auto">
            <p className="text-sm text-[var(--text-secondary)] mb-3">Ya estás participando:</p>
            <Link
              href={`/equipo?id=${existingTeamId}`}
              className="inline-flex items-center gap-2 text-base font-bold text-[var(--sbg-blue)] hover:text-[var(--sbg-purple)] transition-colors"
            >
              <span>Continuar como {existingTeamName}</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </section>

      {/* MODAL CREAR EQUIPO */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowTeamModal(false); setTeamError(null) }}>
          <div className="bg-[var(--sbg-dark-2)] border border-[var(--sbg-purple)] shadow-[var(--glow-primary)] rounded-2xl p-6 sm:p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowTeamModal(false); setTeamError(null) }}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--sbg-green)]">🚀</span> Registrar Equipo
            </h3>

            {teamError && (
              <div className="mb-4 p-3 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">
                {teamError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">Nombre del Equipo</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Ej: Cloud Builders..."
                  required
                  autoFocus
                  disabled={teamLoading}
                  className="w-full bg-[var(--sbg-dark)] border-[var(--sbg-dark-3)] focus:border-[var(--sbg-blue)] focus:ring-1 focus:ring-[var(--sbg-blue)]"
                />
              </div>
              <button
                type="submit"
                disabled={teamLoading || !teamName.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-transform hover:scale-105"
              >
                {teamLoading ? <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAdminModal(false); setAdminError(null) }}>
          <div className="bg-[var(--sbg-dark-2)] border border-[var(--sbg-orange)] shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-2xl p-6 sm:p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowAdminModal(false); setAdminError(null) }}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--sbg-orange)]">👨‍💻</span> Acceso Admin
            </h3>

            {adminError && (
              <div className="mb-4 p-3 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">Usuario / Correo</label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  disabled={adminLoading}
                  className="w-full bg-[var(--sbg-dark)] border-[var(--sbg-dark-3)] focus:border-[var(--sbg-orange)] focus:ring-1 focus:ring-[var(--sbg-orange)]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">Contraseña</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={adminLoading}
                  className="w-full bg-[var(--sbg-dark)] border-[var(--sbg-dark-3)] focus:border-[var(--sbg-orange)] focus:ring-1 focus:ring-[var(--sbg-orange)]"
                />
              </div>
              <button
                type="submit"
                disabled={adminLoading || !adminUser.trim() || !adminPassword.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--sbg-orange)] to-[var(--sbg-orange-dark)] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-transform hover:scale-105"
              >
                {adminLoading ? <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
