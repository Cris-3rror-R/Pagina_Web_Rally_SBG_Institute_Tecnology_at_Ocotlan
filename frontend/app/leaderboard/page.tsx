'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LeaderboardEntry } from '@/types/rally'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [adminName, setAdminName] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        console.error('Error HTTP del leaderboard:', res.status)
      }
    } catch (err) {
      console.error('Error cargando leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setAdminName(localStorage.getItem('rally_is_admin') === 'true'
      ? localStorage.getItem('rally_admin_name') || 'Administrador'
      : null)
    fetchLeaderboard()
    // Refrescar cada 5 segundos
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredEntries = entries.filter(e =>
    e.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="visual-page visual-orange min-h-screen flex flex-col relative overflow-hidden bg-[var(--sbg-dark)] text-[var(--text-primary)]">
      {/* HEADER */}
      <header className="visual-header sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/imagenes/AWS_logo.png" alt="AWS" className="visual-logo" />
            <span className="font-bold text-base hidden sm:inline text-[var(--text-primary)]">Clasificación Global</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--sbg-green)] text-black border border-[var(--sbg-green)] uppercase">
              <span className="w-2 h-2 rounded-full bg-[var(--sbg-green)] animate-pulse" />
              En Vivo
            </span>
            <Link
              href="/"
              className="text-sm font-bold px-4 py-2 rounded-full border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)] transition-colors"
            >
              ← Inicio
            </Link>
            {adminName && (
              <Link href="/admin" className="text-sm font-bold text-white hover:text-[var(--sbg-blue)]">
                Panel Admin · {adminName}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="visual-content flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-8 relative z-10">
        {/* CABECERA */}
        <section className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Clasificación General
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Equipos ordenados por mayor puntaje. En caso de empate, gana el menor tiempo.
            {lastUpdated && <span className="ml-2 font-medium text-[var(--sbg-green)]">Actualizado: {lastUpdated}</span>}
          </p>
        </section>

        {/* TABLA */}
        <section className="rounded-2xl overflow-hidden border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)]">
          {/* BARRA BUSQUEDA */}
          <div className="p-4 border-b border-[var(--sbg-dark-3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-base">
              {loading ? 'Cargando...' : `${filteredEntries.length} Equipo${filteredEntries.length !== 1 ? 's' : ''}`}
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-sm w-full sm:w-64 bg-[var(--sbg-dark)] border-[var(--sbg-dark-3)] focus:border-[var(--sbg-purple)] focus:ring-1 focus:ring-[var(--sbg-purple)]"
              />
              <button
                onClick={fetchLeaderboard}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold bg-[var(--sbg-orange)] text-white rounded-lg flex-shrink-0"
              >
                {loading ? '...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {/* DATOS TABLA */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-base whitespace-nowrap">
              <thead className="bg-[var(--sbg-dark)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold text-center w-16">Pos</th>
                  <th className="py-4 px-5 font-semibold">Equipo</th>
                  <th className="py-4 px-5 font-semibold text-center">Estaciones</th>
                  <th className="py-4 px-5 font-semibold text-center">Tiempo</th>
                  <th className="py-4 px-5 font-semibold text-center">Estado</th>
                  <th className="py-4 px-5 font-semibold text-right">Puntaje total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sbg-dark-3)]">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[var(--text-secondary)] text-sm">
                      {loading
                        ? <div className="flex items-center justify-center gap-3"><div className="w-5 h-5 rounded-full border-2 border-[var(--sbg-purple)] border-t-transparent animate-spin" /><span>Cargando equipos...</span></div>
                        : 'No hay equipos registrados aún.'}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => {
                    const rank = index + 1

                    return (
                      <tr
                        key={entry.equipo_id}
                        className="bg-[var(--sbg-dark-2)] hover:bg-[var(--sbg-dark-3)] transition-colors"
                      >
                        {/* POSICIÓN */}
                        <td className="py-4 px-4 text-center">
                          {rank === 1 ? <span className="text-2xl">🥇</span>
                          : rank === 2 ? <span className="text-2xl">🥈</span>
                          : rank === 3 ? <span className="text-2xl">🥉</span>
                          : <span className="text-[var(--text-secondary)] font-mono text-sm font-bold">#{rank}</span>}
                        </td>

                        {/* EQUIPO */}
                        <td className="py-5 px-5">
                          <p className={`font-bold text-lg ${rank <= 3 ? 'text-[var(--sbg-blue)]' : 'text-[var(--text-primary)]'}`}>
                            {entry.nombre}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-semibold
                            ${entry.estado === 'finalizado'
                              ? 'bg-[var(--sbg-green)] text-black border border-[var(--sbg-green)]'
                              : entry.estado === 'en_progreso'
                              ? 'bg-[var(--sbg-blue)] text-black border border-[var(--sbg-blue)]'
                              : 'bg-[var(--sbg-dark-3)] text-[var(--text-secondary)]'}`}
                          >
                            {entry.estado === 'finalizado' ? '✅ Finalizado' : entry.estado === 'en_progreso' ? '⏱️ En Carrera' : '⏳ Esperando'}
                          </span>
                        </td>

                        {/* PROGRESO */}
                        <td className="py-5 px-5 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="font-bold text-base">
                              {entry.estaciones_completadas}/4
                            </span>
                            <div className="flex gap-1">
                              {[1,2,3,4].map(i => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${i <= entry.estaciones_completadas ? 'bg-[var(--sbg-green)]' : 'bg-[var(--sbg-dark-3)]'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* TIEMPO */}
                        <td className="py-5 px-5 text-center font-mono text-lg text-[var(--text-secondary)]">
                          {entry.tiempo_formateado}
                        </td>

                        <td className="py-5 px-5 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                            entry.estado === 'finalizado'
                              ? 'bg-[var(--sbg-green)] text-black'
                              : entry.estado === 'en_progreso'
                              ? 'bg-[var(--sbg-blue)] text-black'
                              : 'bg-[var(--sbg-dark-3)] text-[var(--text-secondary)]'
                          }`}>
                            {entry.estado === 'finalizado' ? 'Final' : entry.estado === 'en_progreso' ? 'Activo' : 'Esperando'}
                          </span>
                        </td>

                        {/* PUNTAJE */}
                        <td className="py-5 px-5 text-right">
                          <span className={`font-extrabold text-xl ${
                            rank === 1 ? 'text-[var(--sbg-orange)]'
                            : rank === 2 ? 'text-[var(--text-secondary)]'
                            : rank === 3 ? 'text-[var(--sbg-orange-dark)]'
                            : 'text-[var(--text-primary)]'
                          }`}>
                            {entry.puntaje_total}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] ml-1">pts</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER INFO */}
        <p className="text-center text-xs text-[var(--text-secondary)]">
          La clasificación se actualiza automáticamente. En caso de empate de puntos, gana el equipo con menor tiempo.
        </p>
      </div>
      <footer className="visual-footer">
        <img src="/imagenes/Banner_Naranja.png" alt="" className="visual-banner" />
      </footer>
    </main>
  )
}
