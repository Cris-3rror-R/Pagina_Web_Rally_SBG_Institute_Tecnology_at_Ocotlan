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
    <main className="visual-page visual-blue min-h-screen flex flex-col relative overflow-hidden bg-[var(--sbg-dark)]">
      {/* HEADER */}
      <header className="visual-header sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/imagenes/AWS_logo.png" alt="AWS" className="visual-logo" />
          </div>
          
        </div>
      </header>

      {/* HERO */}
      <section className="visual-content flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10">
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto text-white leading-tight">
          AWS CHALLENGE
          <span className="block text-2xl sm:text-3xl md:text-4xl mt-4 text-[var(--text-secondary)] font-semibold">
            Rally de Conocimiento en el Día de ISC y Ciberseguridad
          </span>
        </h1>
        
        <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-12">
          Demuestra tus habilidades resolviendo retos de arquitectura, seguridad y despliegue en la nube. ¡Registra a tu equipo y compite en tiempo real!
        </p>

        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full py-4 text-base font-bold text-white bg-[var(--sbg-purple)] rounded-xl"
          >
            Administrador
          </button>
          <button
            onClick={() => setShowTeamModal(true)}
            className="w-full py-4 text-base font-bold text-white bg-[var(--sbg-green)] rounded-xl"
          >
            Crear Equipo
          </button>
          <Link
            href="/leaderboard"
            className="w-full py-4 text-base font-bold text-white bg-[var(--sbg-orange)] rounded-xl flex items-center justify-center gap-2"
          >
            <img src="/imagenes/Trofeo_Icono.png" alt="" className="h-6 w-6 object-contain" />
            Clasificación
          </Link>
        </div>

        {existingTeamName && existingTeamId && (
          <div className="mt-8 pt-6 border-t border-[var(--sbg-dark-3)] w-full max-w-md mx-auto">
            <p className="text-sm text-[var(--text-secondary)] mb-3">Ya estás participando:</p>
            <Link
              href={`/equipo?id=${existingTeamId}`}
              className="inline-flex items-center gap-2 text-base font-bold text-white"
            >
              <span>Continuar como {existingTeamName}</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </section>

      {/* MODAL CREAR EQUIPO */}
      <footer className="visual-footer">
        <img src="/imagenes/Banner_Azul.png" alt="" className="visual-banner" />
      </footer>

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black" onClick={() => { setShowTeamModal(false); setTeamError(null) }}>
          <div className="bg-black border border-[var(--sbg-green)] rounded-2xl p-6 sm:p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowTeamModal(false); setTeamError(null) }}
              className="absolute top-4 right-4 text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--sbg-green)]">+</span> Registrar Equipo
            </h3>

            {teamError && (
              <div className="mb-4 p-3 rounded-md border border-[var(--sbg-pink)] bg-[var(--sbg-dark)] text-[var(--sbg-pink)] text-sm font-medium">
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
                  className="w-full bg-black border-[var(--sbg-dark-3)] focus:border-[var(--sbg-green)] focus:ring-1 focus:ring-[var(--sbg-green)]"
                />
              </div>
              <button
                type="submit"
                disabled={teamLoading || !teamName.trim()}
                className="w-full py-3.5 bg-[var(--sbg-green)] text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {teamLoading ? <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black" onClick={() => { setShowAdminModal(false); setAdminError(null) }}>
          <div className="bg-black border border-[var(--sbg-purple)] rounded-2xl p-6 sm:p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowAdminModal(false); setAdminError(null) }}
              className="absolute top-4 right-4 text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--sbg-purple)]">👨‍💻</span> Acceso Admin
            </h3>

            {adminError && (
              <div className="mb-4 p-3 rounded-md border border-[var(--sbg-pink)] bg-[var(--sbg-dark)] text-[var(--sbg-pink)] text-sm font-medium">
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
                  className="w-full bg-black border-[var(--sbg-dark-3)] focus:border-[var(--sbg-purple)] focus:ring-1 focus:ring-[var(--sbg-purple)]"
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
                  className="w-full bg-black border-[var(--sbg-dark-3)] focus:border-[var(--sbg-purple)] focus:ring-1 focus:ring-[var(--sbg-purple)]"
                />
              </div>
              <button
                type="submit"
                disabled={adminLoading || !adminUser.trim() || !adminPassword.trim()}
                className="w-full py-3.5 bg-[var(--sbg-purple)] text-white font-bold rounded-xl flex items-center justify-center gap-2"
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
