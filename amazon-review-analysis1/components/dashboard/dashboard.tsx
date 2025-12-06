"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "./header"
import ReviewSection from "./review-section"
import ResultCard from "./result-card"
import HistoryTable from "./history-table"
import ModelComparison from "./model-comparison"
import BatchAnalysis from "./batch-analysis"
import { Sparkles, Target, TrendingUp } from "lucide-react"
import { API_URL } from "@/lib/config"

interface Prediction {
  score: number
  sentiment: string
  model: string
  product_name: string
  probs?: number[]
}

export default function Dashboard({ session }: { session: any }) {
  const supabase = createClient()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [batchMode, setBatchMode] = useState(false)

  const handlePrediction = async (text: string, model: string, productName: string) => {
    setLoading(true)
    setError("")
    setPrediction(null)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model,
          product_name: productName,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en la predicción del servidor")
      }

      const data = await response.json()

      // Guardar en Supabase
      const { error: insertError } = await supabase.from("reviews_history").insert({
        user_id: session.user.id,
        product_name: productName,
        review_text: text,
        model_used: model,
        predicted_score: data.score,
        predicted_sentiment: data.sentiment,
      })

      if (insertError) {
        console.error("Error guardando en BD:", insertError)
      }

      setPrediction(data)
      setRefreshHistory((prev) => prev + 1) // Refrescar historial
    } catch (err: any) {
      setError(err.message || "Error al procesar la predicción")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header userEmail={session.user.email} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Análisis Inteligente de Sentimientos</h2>
            </div>
            <p className="text-lg leading-relaxed text-white/90 mb-6">
              Descubre qué piensan realmente los consumidores sobre productos alimenticios de Amazon. Este sistema
              utiliza <strong>Inteligencia Artificial avanzada</strong> para analizar más de 500,000 reseñas y predecir
              sentimientos con tres modelos de Machine Learning de última generación.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-white/80">Modelos IA</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">95%+</p>
                <p className="text-sm text-white/80">Precisión</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">500K+</p>
                <p className="text-sm text-white/80">Reseñas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setCompareMode(false)
              setBatchMode(false)
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              !compareMode && !batchMode
                ? "bg-primary text-white shadow-lg"
                : "bg-white text-foreground border-2 border-border hover:border-primary"
            }`}
          >
            Análisis Simple
          </button>
          <button
            onClick={() => {
              setCompareMode(true)
              setBatchMode(false)
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              compareMode
                ? "bg-accent text-white shadow-lg"
                : "bg-white text-foreground border-2 border-border hover:border-accent"
            }`}
          >
            Comparar Modelos
          </button>
          <button
            onClick={() => {
              setCompareMode(false)
              setBatchMode(true)
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              batchMode
                ? "bg-primary text-white shadow-lg"
                : "bg-white text-foreground border-2 border-border hover:border-primary"
            }`}
          >
            Análisis Masivo
          </button>
        </div>

        {batchMode ? (
          <BatchAnalysis userId={session.user.id} />
        ) : !compareMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewSection onPredict={handlePrediction} loading={loading} error={error} />
            </div>
            <div className="space-y-8">
              {prediction && <ResultCard prediction={prediction} />}
              <HistoryTable userId={session.user.id} refreshKey={refreshHistory} />
            </div>
          </div>
        ) : (
          <ModelComparison userId={session.user.id} />
        )}
      </main>
    </div>
  )
}
