'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { startTeamTimer, stopTeamTimer } from '@/utils/rally-service'

type ScanState = 'idle' | 'requesting' | 'scanning' | 'success' | 'error' | 'denied'

export default function QRScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const [state, setState] = useState<ScanState>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)

  // Cargar jsQR dinámicamente (no requiere instalación)
  const [jsQR, setJsQR] = useState<((data: Uint8ClampedArray, w: number, h: number) => { data: string } | null) | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('rally_current_team_id')
    const name = localStorage.getItem('rally_current_team_name')
    if (!id) {
      router.push('/')
      return
    }
    setTeamId(id)
    setTeamName(name || 'Tu equipo')

    // Cargar jsQR desde CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    script.onload = () => {
      if ((window as any).jsQR) {
        setJsQR(() => (window as any).jsQR)
      }
    }
    script.onerror = () => console.warn('No se pudo cargar jsQR, usando modo manual')
    document.head.appendChild(script)

    return () => {
      stopCamera()
    }
  }, [router])

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setState('requesting')
    setStatusMsg('Solicitando acceso a la cámara...')

    try {
      // Intentar primero cámara trasera (mejor para QR)
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
      } catch {
        // Fallback: cualquier cámara disponible
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = stream

      // Detectar linterna
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as any
      if (capabilities?.torch) {
        setHasTorch(true)
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setState('scanning')
      setStatusMsg('Apunta el QR al centro del visor')
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setState('denied')
        setStatusMsg('Permiso de cámara denegado. Actívalo en configuración del navegador.')
      } else {
        setState('error')
        setStatusMsg('No se pudo acceder a la cámara: ' + err.message)
      }
    }
  }, [])

  // Loop de escaneo usando jsQR
  useEffect(() => {
    if (state !== 'scanning' || !jsQR) return

    const scan = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(scan)
        return
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code && code.data && code.data !== lastScanned) {
        handleQRDetected(code.data)
        return
      }

      animFrameRef.current = requestAnimationFrame(scan)
    }

    animFrameRef.current = requestAnimationFrame(scan)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [state, jsQR, lastScanned])

  const handleQRDetected = useCallback(async (qrData: string) => {
    // La entrada manual se procesa desde el estado idle; el lector de cámara
    // solo puede enviar un código mientras está escaneando.
    if (!teamId || (state !== 'scanning' && state !== 'idle')) return

    setLastScanned(qrData)
    stopCamera()
    setState('success')

    const upper = qrData.trim().toUpperCase()
    const isStart = upper.includes('START') || upper.includes('INICIO')
    const isFinish = upper.includes('FINISH') || upper.includes('FINAL') || upper.includes('FIN')

    if (isStart) {
      setStatusMsg('⏱️ Iniciando cronómetro...')
      const res = await startTeamTimer(teamId, qrData)
      if (res.success) {
        setStatusMsg('✅ ¡Rally iniciado! Cronómetro en marcha.')
      } else {
        setState('error')
        setStatusMsg(res.error || 'Error al iniciar el rally')
      }
    } else if (isFinish) {
      setStatusMsg('🏁 Finalizando rally...')
      const res = await stopTeamTimer(teamId, qrData)
      if (res.success) {
        setStatusMsg('✅ ¡Rally finalizado! Regresa a tu panel.')
      } else {
        setState('error')
        setStatusMsg(res.error || 'Error al finalizar el rally')
      }
    } else {
      setState('error')
      setStatusMsg(`QR no reconocido: "${qrData}". Usa el QR oficial del rally.`)
    }
  }, [teamId, state, stopCamera])

  // Entrada manual de código QR (fallback)
  const [manualCode, setManualCode] = useState('')
  const handleManual = (e: React.FormEvent) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    setStatusMsg('⏳ Procesando código...')
    void handleQRDetected(code)
    setManualCode('')
  }

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return
    const track = streamRef.current.getVideoTracks()[0]
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] })
      setTorchOn(v => !v)
    } catch (err) {
      console.warn('Error al cambiar linterna:', err)
    }
  }

  const reset = () => {
    setLastScanned(null)
    setState('idle')
    setStatusMsg('')
  }

  return (
    <main className="min-h-screen bg-[var(--sbg-dark)] text-[var(--text-primary)] flex flex-col">
      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--sbg-purple)] rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--sbg-blue)] rounded-full blur-[120px] opacity-10" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--sbg-dark-3)] bg-[var(--sbg-dark)]/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={teamId ? `/equipo?id=${teamId}` : '/'} className="w-8 h-8 flex items-center justify-center font-extrabold text-xs rounded-lg bg-gradient-to-br from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white">
              AWS
            </Link>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Escáner QR</p>
              {teamName && <p className="text-xs text-[var(--text-secondary)]">{teamName}</p>}
            </div>
          </div>
          <Link
            href={teamId ? `/equipo?id=${teamId}` : '/'}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)] transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6 flex flex-col gap-5 relative z-10">
        {/* Instrucciones */}
        <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-4">
          <h1 className="text-lg font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)]">
            Escanear Código QR
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Escanea el QR de <span className="text-[var(--sbg-green)] font-bold">INICIO</span> para comenzar el rally o el de{' '}
            <span className="text-[var(--sbg-orange)] font-bold">FIN</span> para terminar.
          </p>
        </div>

        {/* VISOR DE CÁMARA */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--sbg-dark-3)] bg-black aspect-[4/3] flex items-center justify-center">
          {/* Video stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${state === 'scanning' ? 'block' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />
          {/* Canvas oculto para análisis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay de escaneo */}
          {state === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Marco QR */}
              <div className="relative w-52 h-52">
                {/* Esquinas */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--sbg-green)] rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--sbg-green)] rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--sbg-green)] rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--sbg-green)] rounded-br-sm" />
                {/* Línea de escaneo animada */}
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[var(--sbg-green)] to-transparent animate-pulse" />
              </div>
            </div>
          )}

          {/* Pantalla inicial / idle */}
          {(state === 'idle') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--sbg-dark-2)]">
              <div className="text-6xl">📷</div>
              <p className="text-sm text-[var(--text-secondary)] text-center px-6">
                Presiona el botón para activar la cámara y escanear el QR
              </p>
              <button
                onClick={startCamera}
                className="px-8 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] hover:opacity-90 transition-opacity shadow-[var(--glow-primary)]"
              >
                📷 Activar Cámara
              </button>
            </div>
          )}

          {/* Solicitando permiso */}
          {state === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--sbg-dark-2)]">
              <div className="w-10 h-10 border-2 border-[var(--sbg-purple)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">Solicitando acceso a la cámara...</p>
              <p className="text-xs text-[var(--sbg-orange)] text-center px-6 font-medium">
                ⚠️ Acepta el permiso de cámara cuando el navegador lo solicite
              </p>
            </div>
          )}

          {/* Permiso denegado */}
          {state === 'denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--sbg-dark-2)] p-6">
              <div className="text-5xl">🚫</div>
              <p className="text-sm font-bold text-red-400 text-center">Acceso a la cámara denegado</p>
              <p className="text-xs text-[var(--text-secondary)] text-center">
                Ve a la configuración de tu navegador y permite el acceso a la cámara para este sitio.
              </p>
              <button
                onClick={startCamera}
                className="mt-2 px-6 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)]"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Éxito */}
          {state === 'success' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--sbg-dark-2)] p-6">
              <div className="text-5xl animate-bounce">✅</div>
              <p className="text-base font-bold text-[var(--sbg-green)] text-center">{statusMsg}</p>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => router.push(teamId ? `/equipo?id=${teamId}` : '/')}
                  className="px-6 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[var(--sbg-green)] to-[var(--sbg-blue)]"
                >
                  Ver mi panel
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-2 rounded-full text-sm font-semibold border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)]"
                >
                  Escanear otro
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--sbg-dark-2)] p-6">
              <div className="text-5xl">⚠️</div>
              <p className="text-sm font-bold text-red-400 text-center">{statusMsg}</p>
              <button
                onClick={reset}
                className="px-6 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[var(--sbg-orange)] to-[var(--sbg-purple)]"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Controles del escáner */}
        {state === 'scanning' && (
          <div className="flex gap-3 justify-center flex-wrap">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  torchOn
                    ? 'bg-[var(--sbg-orange)]/20 border-[var(--sbg-orange)]/50 text-[var(--sbg-orange)]'
                    : 'border-[var(--sbg-dark-3)] text-[var(--text-secondary)]'
                }`}
              >
                🔦 {torchOn ? 'Linterna ON' : 'Linterna'}
              </button>
            )}
            <button
              onClick={() => { stopCamera(); setState('idle') }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-[var(--sbg-dark-3)] text-[var(--text-secondary)] hover:bg-[var(--sbg-dark-2)]"
            >
              ✕ Cancelar
            </button>
          </div>
        )}

        {/* Indicador de carga jsQR */}
        {state === 'scanning' && !jsQR && (
          <div className="rounded-xl border border-[var(--sbg-orange)]/30 bg-[var(--sbg-orange)]/5 p-3 text-xs text-[var(--sbg-orange)] text-center">
            ⏳ Cargando motor de escaneo... Usa la entrada manual si tarda mucho.
          </div>
        )}

        {/* Estado / mensajes */}
        {state !== 'idle' && state !== 'scanning' && state !== 'requesting' && state !== 'success' && state !== 'error' && state !== 'denied' && statusMsg && (
          <div className="rounded-xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-3 text-sm text-center text-[var(--text-secondary)]">
            {statusMsg}
          </div>
        )}

        {/* Fallback: Entrada manual */}
        <div className="rounded-2xl border border-[var(--sbg-dark-3)] bg-[var(--sbg-dark-2)] p-5">
          <h2 className="text-sm font-bold mb-1 text-[var(--text-primary)]">Registrar código manualmente</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Escribe el código de Inicio o Fin y pulsa Registrar.
          </p>
          <form onSubmit={handleManual} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="InicioAWS_Quest2026_7A3nM_1 o FinAWS_Quest2026_7shnM_1"
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--sbg-dark)] border border-[var(--sbg-dark-3)] text-[var(--text-primary)] focus:border-[var(--sbg-purple)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[var(--sbg-blue)] to-[var(--sbg-purple)] text-white disabled:opacity-50"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
