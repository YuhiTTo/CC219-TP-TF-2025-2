"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthPage from "@/components/auth/auth-page"
import Dashboard from "@/components/dashboard/dashboard"
import type { Session } from "@supabase/supabase-js"

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return <Dashboard session={session} />
}
