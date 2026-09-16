'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Equipo, TeamStationProgress } from '@/types/rally'
import { createTeam } from '@/utils/rally-service'

interface AdminTeamData {
  equipo: Equipo
  progress: TeamStationProgress[]
}

export default function AdminPage() {
  const router = useRouter()
  const [teamsData, setTeamsData] = useState<AdminTeamData[]>([])
  const [loading, setLoading] = useState(true)

  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [selectedTeam, setSelectedTeam] = useState<AdminTeamData | null>(null)
  const [grading, setGrading] = useState(false)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [stationScores, setStationScores] = useState<{ [key: number]: number }>({})
  const [stationCompleted, setStationCompleted] = useState<{ [key: number]: boolean }>({})

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams')
      if (res.ok) {
        const data = await res.json()
        const teams: Equipo[] = data.teams
        const progreso = data.progreso
        
        const merged: AdminTeamData[] = teams.map(t => {
          const teamProgress = progreso.filter((p: any) => p.equipo_id === t.equipo_id)
          const stations: TeamStationProgress[] = [1, 2, 3, 4].map(sid => {
            const sp = teamProgress.find((p: any) => p.estacion_id === sid)
            return {
              station: { estacion_id: sid, nombre: `Estación ${sid}`, encargados: '', descripcion: '', ubicacion_palabra: '', puntos_totales: 0 },
              completado: sp ? sp.completado : false,
              puntos_ganados: sp ? sp.puntos_ganados : 0
            }
          })
          return { equipo: t, progress: stations }
        })
        setTeamsData(merged)
      }
    } catch (err) {
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const isAdmin = localStorage.getItem('rally_is_admin') === 'true'
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchTeams()
  }, [router])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) {
      setCreateError('Nombre requerido')
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      const res = await createTeam(newTeamName)
      if (res.success) {
        setNewTeamName('')
        fetchTeams()
      } else {
        setCreateError(res.error || 'Error al crear equipo')
      }
    } catch (err) {
      setCreateError('Error de red')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenGrading = (data: AdminTeamData) => {
    setSelectedTeam(data)
    setGradeError(null)
    const scores: { [key: number]: number } = {}
    const completed: { [key: number]: boolean } = {}
    data.progress.forEach(p => {
      scores[p.station.estacion_id] = p.puntos_ganados
      completed[p.station.estacion_id] = p.completado
    })
    setStationScores(scores)
    setStationCompleted(completed)
  }

  const handleSavePoints = async (estacion_id: number) => {
    if (!selectedTeam) return
    setGrading(true)
    setGradeError(null)
    try {
      const res = await fetch('/api/admin/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipo_id: selectedTeam.equipo.equipo_id,
          estacion_id,
          puntos_ganados: stationScores[estacion_id] || 0,
          completado: stationCompleted[estacion_id] || false
        })
      })
      if (res.ok) {
        // Refrescar lista principal
        fetchTeams()
      } else {
        const errData = await res.json()
        setGradeError(errData.error || 'Error al guardar puntos')
      }
    } catch (err) {
      setGradeError('Error de red al guardar puntos')
    } finally {
      setGrading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rally_is_admin')
    localStorage.removeItem('rally_admin_name')
    router.push('/')
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--sbg-dark)] text-[var(--text-primary)] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[var(--sbg-purple)] rounded-full blur-[130px] opacity-15 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[var(--sbg-blue)] rounded-full blur-[130px] opacity-15 pointer-events-none" />
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--sbg-dark-3)] bg-[var(--sbg-dark)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm rounded bg-gradient-to-br from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white">
              AWS
            </div>
            <span className="font-bold text-base hidden sm:inline text-[var(--text-primary)]">Panel Admin</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/leaderboard"
              className="text-sm font-bold px-4 py-2 rounded-full bg-gradient-to-r from-[var(--sbg-purple)] to-[var(--sbg-pink)] text-white hover:scale-105 transition-transform shadow-[var(--glow-primary)] flex items-center gap-2"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">Clasificación</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold px-4 py-2 rounded-full border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)] transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8 relative z-10">
        
        {/* BANNER */}
        <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)]">Panel de Administración</h1>
            <p className="text-[var(--text-secondary)] text-sm">Gestiona equipos y puntajes en tiempo real</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-extrabold text-[var(--sbg-purple)]">{teamsData.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Equipos Totales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: CREAR EQUIPO Y QRs */}
          <div className="md:col-span-1 space-y-6">
            
            {/* CREAR EQUIPO */}
            <div className="aws-card p-6">
              <h2 className="text-lg font-bold mb-4">Crear Nuevo Equipo</h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                {createError && (
                  <div className="p-3 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {createError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#8b949e]">Nombre del Equipo</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    placeholder="Escribe el nombre..."
                    className="w-full bg-[var(--sbg-dark)] border-[var(--sbg-dark-3)] focus:border-[var(--sbg-purple)] focus:ring-1 focus:ring-[var(--sbg-purple)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !newTeamName.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-transform hover:scale-105"
                >
                  {creating ? 'Creando...' : 'Crear Equipo'}
                </button>
              </form>
            </div>

            {/* CODIGOS QR OFICIALES */}
            <div className="aws-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-[var(--sbg-green)]">📱</span> QRs Oficiales
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Muestra estos códigos a los equipos para que inicien o finalicen el rally.
              </p>
              
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--sbg-green)] mb-2">▶ INICIO DE RALLY</p>
                  <div className="bg-white p-2 inline-block rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=InicioAWS_Quest2026_7A3nM_1`} alt="QR Inicio" className="w-32 h-32" />
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-secondary)]">Inicio:</p>
                  <code className="block mt-1 break-all text-xs font-semibold text-[var(--sbg-green)]">InicioAWS_Quest2026_7A3nM_1</code>
                  <p className="mt-2 text-[11px] text-[var(--text-secondary)]">Si el QR no funciona, usa esta palabra clave en el escáner.</p>
                </div>
                
                <div className="border-t border-[var(--sbg-dark-3)] pt-4 text-center">
                  <p className="text-sm font-bold text-[var(--sbg-orange)] mb-2">⏹ FIN DE RALLY</p>
                  <div className="bg-white p-2 inline-block rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FinAWS_Quest2026_7shnM_1`} alt="QR Fin" className="w-32 h-32" />
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-secondary)]">Fin:</p>
                  <code className="block mt-1 break-all text-xs font-semibold text-[var(--sbg-orange)]">FinAWS_Quest2026_7shnM_1</code>
                  <p className="mt-2 text-[11px] text-[var(--text-secondary)]">Al registrar esta palabra clave, el contador se detiene.</p>
                </div>
              </div>
            </div>
            
          </div>

          {/* LISTA DE EQUIPOS */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold">Listado de Equipos</h2>
            {loading ? (
              <div className="p-8 text-center text-[#8b949e]">Cargando equipos...</div>
            ) : teamsData.length === 0 ? (
              <div className="aws-card p-8 text-center text-[#8b949e]">No hay equipos creados aún.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamsData.map(({ equipo, progress }) => {
                  const stationsCompleted = progress.filter(p => p.completado).length
                  return (
                    <div key={equipo.equipo_id} className="aws-card p-5 flex flex-col hover:border-[#7c3aed] transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-[#f0f6fc] group-hover:text-[#7c3aed] transition-colors">{equipo.nombre}</h3>
                        <span className="text-xs text-[#8b949e] font-mono">{equipo.equipo_id.split('-')[0]}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div>
                          <p className="text-xs text-[#8b949e] uppercase">Puntos</p>
                          <p className="font-bold text-lg">{equipo.puntaje_total}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#8b949e] uppercase">Estaciones</p>
                          <p className="font-bold text-lg">{stationsCompleted}/4</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenGrading({ equipo, progress })}
                        className="mt-4 w-full py-1.5 text-xs font-semibold rounded border border-[#21262d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc] transition-colors"
                      >
                        Gestionar Puntos
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GESTION PUNTOS */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTeam(null)}>
          <div className="aws-card p-6 max-w-xl w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 text-[#8b949e] hover:text-[#f0f6fc]"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-[#f0f6fc] mb-1">Calificar Equipo</h3>
            <p className="text-sm text-[#7c3aed] font-semibold mb-6">{selectedTeam.equipo.nombre}</p>

            {gradeError && (
              <div className="mb-4 p-3 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                {gradeError}
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {[1, 2, 3, 4].map(estacionId => (
                <div key={estacionId} className="p-4 rounded-md border border-[#21262d] bg-[#0d1117] flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Estación {estacionId}</h4>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stationCompleted[estacionId] || false}
                        onChange={(e) => setStationCompleted({ ...stationCompleted, [estacionId]: e.target.checked })}
                        className="accent-[#7c3aed]"
                      />
                      Completado
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={stationScores[estacionId] || 0}
                        onChange={(e) => setStationScores({ ...stationScores, [estacionId]: parseInt(e.target.value) || 0 })}
                        className="w-20 py-1 px-2 text-center text-sm"
                      />
                      <span className="text-xs text-[#8b949e]">pts</span>
                    </div>
                    <button
                      onClick={() => handleSavePoints(estacionId)}
                      disabled={grading}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#7c3aed] text-white rounded hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
                    >
                      {grading ? '...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-[#21262d] text-right">
               <button
                  onClick={() => { setSelectedTeam(null); fetchTeams(); }}
                  className="aws-btn-primary text-sm"
               >
                 Cerrar Panel
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
