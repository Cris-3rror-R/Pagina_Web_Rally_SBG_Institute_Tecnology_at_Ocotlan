'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function DashboardRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get('type')
    const teamId = searchParams.get('id')

    if (type === 'admin') {
      router.replace('/admin')
      return
    }

    if (teamId) {
      router.replace(`/equipo?id=${teamId}`)
      return
    }

    if (typeof window !== 'undefined') {
      const storedTeamId = localStorage.getItem('rally_current_team_id')
      if (storedTeamId) {
        router.replace(`/equipo?id=${storedTeamId}`)
        return
      }

      const isAdmin = localStorage.getItem('rally_is_admin') === 'true'
      if (isAdmin) {
        router.replace('/admin')
        return
      }
    }

    // Por defecto volver a inicio
    router.replace('/')
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center text-white">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Redirigiendo a tu panel...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1419] flex items-center justify-center text-white">
          Cargando...
        </div>
      }
    >
      <DashboardRedirectContent />
    </Suspense>
  )
}
