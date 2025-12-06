"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
          },
        })

        if (error) {
          if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            throw new Error("Este correo ya está registrado. Intenta iniciar sesión.")
          }
          throw error
        }

        if (data.user && !data.session) {
          setSuccessMessage(
            "¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.",
          )
          setEmail("")
          setPassword("")
        } else if (data.session) {
          // Si Supabase no requiere confirmación de email, el usuario ya está logueado
          setSuccessMessage("¡Registro exitoso! Redirigiendo...")
        }
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl p-8 border border-border">
        <div className="mb-8 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Mail className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Análisis de Reseñas IA</h1>
          <p className="text-sm text-gray-600">Sistema de predicción de sentimientos</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-positive/10 border-2 border-positive rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-positive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-positive">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-foreground placeholder-gray-400 transition"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-foreground placeholder-gray-400 transition"
                placeholder="••••••••"
              />
            </div>
            {!isLogin && <p className="mt-2 text-xs text-gray-500">Mínimo 6 caracteres</p>}
          </div>

          {error && (
            <div className="p-4 bg-error/10 border-2 border-error rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Procesando...
              </span>
            ) : isLogin ? (
              "Iniciar sesión"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
              setSuccessMessage("")
            }}
            className="text-sm text-primary hover:text-primary-dark font-semibold transition"
          >
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <span className="ml-1 underline">{isLogin ? "Regístrate aquí" : "Inicia sesión"}</span>
          </button>
        </div>

        {!isLogin && (
          <div className="mt-6 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Al registrarte, recibirás un correo de confirmación. Revisa tu bandeja de entrada.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
