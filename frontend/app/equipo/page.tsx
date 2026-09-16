'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDuration } from '@/utils/rally-service'
import { Equipo, TeamStationProgress } from '@/types/rally'

function EquipoContent() {
  const [team, setTeam] = useState<Equipo | null>(null)
  const [progress, setProgress] = useState<TeamStationProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams?.get('id')

  // Función centralizada que carga TODO desde el admin API (sin RLS)
  const fetchTeamData = useCallback(async (id: string, isInitial = false) => {
    try {
      const res = await fetch(`/api/team-progress/${id}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()

      if (!data.equipo) {
        // Solo en carga inicial: intentar localStorage como fallback
        if (isInitial) {
          const sessionRaw = localStorage.getItem('rally_team_session')
          if (sessionRaw) {
            try {
              const parsed = JSON.parse(sessionRaw)
              if (parsed.equipo_id === id) {
                setTeam(parsed)
              } else {
                router.push('/')
                return
              }
            } catch {
              router.push('/')
              return
            }
          } else {
            router.push('/')
            return
          }
        }
      } else {
        setTeam(data.equipo)
        // Actualizar localStorage con datos frescos
        localStorage.setItem('rally_current_team_id', data.equipo.equipo_id)
        localStorage.setItem('rally_current_team_name', data.equipo.nombre)
        localStorage.setItem('rally_team_session', JSON.stringify(data.equipo))
      }

      setProgress(data.stationsProgress || [])
      setError(null)
    } catch (err) {
      console.error('Error cargando datos del equipo:', err)
      if (isInitial) {
        setError('No se pudo cargar la información del equipo')
      }
      // En polling, si falla silenciosamente, no redirigir
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [router])

  // Carga inicial
  useEffect(() => {
    const id = teamId || localStorage.getItem('rally_current_team_id')
    if (!id) {
      router.push('/')
      return
    }
    fetchTeamData(id, true)
  }, [teamId, router, fetchTeamData])

  // Polling cada 5 segundos para reflejar cambios del admin en tiempo real
  useEffect(() => {
    const id = teamId || localStorage.getItem('rally_current_team_id')
    if (!id || loading) return

    const interval = setInterval(() => {
      fetchTeamData(id, false)
    }, 1000)

    return () => clearInterval(interval)
  }, [teamId, loading, fetchTeamData])

  // Cronómetro en tiempo real
  useEffect(() => {
    if (!team?.tiempo_inicio) {
      setElapsedSeconds(null)
      return
    }

    // Si ya finalizó, calcular el tiempo total fijo
    if (team.tiempo_final) {
      const start = new Date(team.tiempo_inicio).getTime()
      const end = new Date(team.tiempo_final).getTime()
      if (Number.isNaN(start) || Number.isNaN(end)) {
        setElapsedSeconds(null)
        return
      }
      setElapsedSeconds(Math.max(0, Math.floor((end - start) / 1000)))
      return
    }

    // Si está en carrera, cronómetro en vivo
    const calcElapsed = () => {
      const start = new Date(team.tiempo_inicio as string).getTime()
      if (Number.isNaN(start)) {
        setElapsedSeconds(null)
        return
      }
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    }
    calcElapsed()
    const interval = setInterval(calcElapsed, 1000)
    return () => clearInterval(interval)
  }, [team])


  const handleLogout = () => {
    localStorage.removeItem('rally_current_team_id')
    localStorage.removeItem('rally_current_team_name')
    localStorage.removeItem('rally_team_session')
    router.push('/')
  }

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--sbg-dark)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--sbg-purple)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm animate-pulse">Cargando equipo...</p>
        </div>
      </main>
    )
  }

  // ─── ERROR ───────────────────────────────────────────────────────────────────
  if (error || !team) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--sbg-dark)] flex-col gap-4 px-4">
        <div className="text-5xl mb-2">⚠️</div>
        <p className="text-red-400 font-semibold text-center">{error || 'Equipo no encontrado'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white font-bold text-sm hover:opacity-90 transition"
        >
          Ir al inicio
        </button>
      </main>
    )
  }

  // ─── DATOS COMPUTADOS ────────────────────────────────────────────────────────
  const totalStations = progress.length
  const completadas = progress.filter(p => p.completado).length
  const totalPuntos = progress.reduce((s, p) => s + p.puntos_ganados, 0)
  const estadoEquipo = team.tiempo_final ? 'finalizado' : team.tiempo_inicio ? 'en_progreso' : 'no_iniciado'

  const tiempoDisplay = team.tiempo_final && team.tiempo_inicio
    ? formatDuration(Math.floor((new Date(team.tiempo_final).getTime() - new Date(team.tiempo_inicio).getTime()) / 1000))
    : elapsedSeconds !== null
    ? formatDuration(elapsedSeconds)
    : '--:--'

  return (
    <main className="min-h-screen flex flex-col bg-[var(--sbg-dark)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="fixed top-[-15%] right-[-10%] w-[50%] sm:w-[35%] h-[40%] bg-[var(--sbg-purple)] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[50%] sm:w-[35%] h-[40%] bg-[var(--sbg-blue)] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-[var(--sbg-dark-3)] bg-[var(--sbg-dark)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-extrabold text-xs sm:text-sm rounded-lg bg-gradient-to-br from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white shadow-[var(--glow-primary)]">
              AWS
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="text-right hidden xs:block min-w-0">
              <p className="text-[var(--text-primary)] font-semibold text-sm truncate max-w-[140px] sm:max-w-none">{team.nombre}</p>
              <p className="text-xs text-[var(--text-secondary)]">Mi Equipo</p>
            </div>
            {/* Badge de estado */}
            <div className={`hidden sm:flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              estadoEquipo === 'finalizado'
                ? 'bg-[var(--sbg-green)]/10 text-[var(--sbg-green)] border-[var(--sbg-green)]/30'
                : estadoEquipo === 'en_progreso'
                ? 'bg-[var(--sbg-blue)]/10 text-[var(--sbg-blue)] border-[var(--sbg-blue)]/30'
                : 'bg-[var(--sbg-dark-3)] text-[var(--text-secondary)] border-[var(--sbg-dark-3)]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
              {estadoEquipo === 'finalizado' ? 'Finalizado' : estadoEquipo === 'en_progreso' ? 'En Carrera' : 'En Espera'}
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)] transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full space-y-5 sm:space-y-6 relative z-10">

        {/* ── BANNER BIENVENIDA ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] leading-tight">
                ¡Bienvenido, {team.nombre}!
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                AWS Challenge 2026 · Rally de Conocimiento
              </p>
            </div>
            {/* Badge de estado móvil */}
            <div className={`sm:hidden self-start flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              estadoEquipo === 'finalizado'
                ? 'bg-[var(--sbg-green)]/10 text-[var(--sbg-green)] border-[var(--sbg-green)]/30'
                : estadoEquipo === 'en_progreso'
                ? 'bg-[var(--sbg-blue)]/10 text-[var(--sbg-blue)] border-[var(--sbg-blue)]/30'
                : 'bg-[var(--sbg-dark-3)] text-[var(--text-secondary)] border-[var(--sbg-dark-3)]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
              {estadoEquipo === 'finalizado' ? '✅ Finalizado' : estadoEquipo === 'en_progreso' ? '⏱️ En Carrera' : '⏳ En Espera'}
            </div>
            {/* Indicador de actualización */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--sbg-green)] animate-pulse inline-block" />
              Actualización en vivo
            </div>
          </div>
        </div>

        {/* ── STATS GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Puntaje Total',
              value: totalPuntos,
              icon: '🏆',
              color: 'text-[var(--sbg-orange)]',
              border: 'border-[var(--sbg-orange)]/25'
            },
            {
              label: 'Estaciones',
              value: totalStations > 0 ? `${completadas}/${totalStations}` : '0/0',
              icon: '📍',
              color: 'text-[var(--sbg-blue)]',
              border: 'border-[var(--sbg-blue)]/25'
            },
            {
              label: estadoEquipo === 'finalizado' ? 'Tiempo Final' : 'Tiempo',
              value: tiempoDisplay,
              icon: '⏱️',
              color: estadoEquipo === 'finalizado' ? 'text-[var(--sbg-green)]' : 'text-[var(--sbg-green)]',
              border: 'border-[var(--sbg-green)]/25'
            },
            {
              label: 'Estado',
              value: estadoEquipo === 'finalizado' ? 'FINAL' : estadoEquipo === 'en_progreso' ? 'ACTIVO' : 'ESPERA',
              icon: estadoEquipo === 'finalizado' ? '✅' : estadoEquipo === 'en_progreso' ? '🔥' : '⏳',
              color: 'text-[var(--sbg-purple)]',
              border: 'border-[var(--sbg-purple)]/25'
            },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-[var(--sbg-dark-2)] p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider leading-tight">{stat.label}</p>
                <span className="text-lg sm:text-xl">{stat.icon}</span>
              </div>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono ${stat.color} break-all`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── ESTACIONES ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">Progreso de Estaciones</h2>
            {totalStations > 0 && (
              <span className="text-xs text-[var(--text-secondary)] bg-[var(--sbg-dark-2)] px-3 py-1 rounded-full border border-[var(--sbg-dark-3)]">
                {completadas} de {totalStations} completadas
              </span>
            )}
          </div>

          {progress.length === 0 ? (
            <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-8 sm:p-12 text-center">
              <div className="text-4xl mb-3">📡</div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">
                Las estaciones del rally aún no están disponibles.
              </p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">Consulta con el administrador.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {progress.map((prog, idx) => (
                <div
                  key={prog.station.estacion_id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    prog.completado
                      ? 'border-[var(--sbg-green)]/40 bg-gradient-to-br from-[var(--sbg-green)]/5 to-[var(--sbg-dark-2)]'
                      : 'border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)]'
                  }`}
                >
                  {/* Header de estación */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-[var(--sbg-dark-3)] text-[var(--text-secondary)]">
                      #{idx + 1}
                    </span>
                    <span className="text-xl">{prog.completado ? '✅' : '🔒'}</span>
                  </div>

                  {/* Nombre */}
                  <h3 className={`font-bold text-sm sm:text-base mb-1 leading-tight ${
                    prog.completado ? 'text-[var(--sbg-green)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {prog.station.nombre}
                  </h3>

                  {/* Descripción */}
                  {prog.station.descripcion && (
                    <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 leading-relaxed">
                      {prog.station.descripcion}
                    </p>
                  )}

                  {/* Encargados */}
                  {prog.station.encargados && (
                    <p className="text-xs text-[var(--text-secondary)] mb-3 font-medium">
                      👤 {prog.station.encargados}
                    </p>
                  )}

                  {/* Puntos */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--sbg-dark-3)] mt-auto">
                    <span className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wide">Puntos</span>
                    <span className={`text-xl sm:text-2xl font-extrabold font-mono ${
                      prog.completado ? 'text-[var(--sbg-green)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {prog.puntos_ganados}
                    </span>
                  </div>

                  {/* Barra de puntos */}
                  {prog.station.puntos_totales > 0 && (
                    <div className="mt-2 w-full h-1 rounded-full bg-[var(--sbg-dark-3)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          prog.completado ? 'bg-[var(--sbg-green)]' : 'bg-[var(--sbg-dark-3)]'
                        }`}
                        style={{ width: prog.completado ? `${Math.min(100, (prog.puntos_ganados / prog.station.puntos_totales) * 100)}%` : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ACCIONES ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-6">
          <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-5 sm:p-6 flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-3">📱</span>
            <h3 className="font-bold text-[var(--text-primary)] mb-1 text-base">Escanear QR</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Inicia o finaliza tu desafío</p>
            <Link
              href="/qr"
              className="w-full max-w-xs py-2.5 rounded-full bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white font-bold text-sm text-center hover:opacity-90 transition-opacity shadow-[var(--glow-primary)]"
            >
              Abrir Cámara
            </Link>
          </div>
          <div className="rounded-2xl border border-[var(--sbg-purple)]/30 bg-gradient-to-br from-[var(--sbg-purple)]/5 to-[var(--sbg-dark-2)] p-5 sm:p-6 flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-3">🏆</span>
            <h3 className="font-bold text-[var(--text-primary)] mb-1 text-base">Clasificación</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Ve tu posición en vivo</p>
            <Link
              href="/leaderboard"
              className="w-full max-w-xs py-2.5 rounded-full bg-gradient-to-r from-[var(--sbg-purple)] to-[var(--sbg-pink)] text-white font-bold text-sm text-center hover:opacity-90 transition-opacity shadow-[var(--glow-primary)]"
            >
              Ver Tabla
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function EquipoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[var(--sbg-dark)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--sbg-purple)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm animate-pulse">Cargando...</p>
        </div>
      </main>
    }>
      <EquipoContent />
    </Suspense>
  )
}
