"use client"

import type React from "react"

import { useState } from "react"
import { TrendingUp, Award, Clock } from "lucide-react"
import { API_URL, AVAILABLE_MODELS } from "@/lib/config"

const PRODUCTS = [
  "Café Premium",
  "Chocolate Negro 70%",
  "Miel Orgánica",
  "Aceite de Oliva Virgen",
  "Granola de Frutos Secos",
  "Galletas Integrales",
  "Té Verde",
  "Nueces de Macadamia",
]

interface ComparisonResult {
  model: string
  score: number
  sentiment: string
  time: number
}

interface ModelComparisonProps {
  userId: string
}

export default function ModelComparison({ userId }: ModelComparisonProps) {
  const [product, setProduct] = useState(PRODUCTS[0])
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ComparisonResult[]>([])

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!review.trim()) return

    setLoading(true)
    setResults([])

    const models = Object.entries(AVAILABLE_MODELS)
      .filter(([_, config]) => config.available)
      .map(([id]) => id)

    const promises = models.map(async (model) => {
      const startTime = performance.now()
      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: review,
            model,
            product_name: product,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error en modelo ${model}`)
        }

        const data = await response.json()
        const endTime = performance.now()

        return {
          model,
          score: data.score,
          sentiment: data.sentiment,
          time: Math.round(endTime - startTime),
        }
      } catch (error) {
        console.error(`Error en modelo ${model}:`, error)
        return null
      }
    })

    try {
      const allResults = await Promise.all(promises)
      setResults(allResults.filter((r): r is ComparisonResult => r !== null))
    } catch (error) {
      console.error("Error comparing models:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelName = (model: string) => {
    const names: Record<string, string> = {
      logreg: "Regresión Logística",
      lstm: "LSTM",
      bert: "BERT",
    }
    return names[model]
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positivo":
        return "bg-positive/20 text-positive border-positive"
      case "Negativo":
        return "bg-error/20 text-error border-error"
      default:
        return "bg-warning/20 text-warning border-warning"
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Comparar los 3 Modelos
        </h2>

        <form onSubmit={handleCompare} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Producto de Amazon</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground"
            >
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Reseña / Comentario</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Escribe una reseña para comparar cómo la analizan los diferentes modelos..."
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground placeholder-gray-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !review.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Comparando modelos...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Comparar Modelos
              </>
            )}
          </button>
        </form>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div
              key={result.model}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-border hover:border-primary transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{getModelName(result.model)}</h3>
                {index === 0 && <Award className="w-5 h-5 text-warning" />}
              </div>

              <div className="space-y-4">
                {/* Puntuación */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Puntuación</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= result.score ? "text-warning text-xl" : "text-gray-300 text-xl"}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-1">{result.score}/5</p>
                </div>

                {/* Sentimiento */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Sentimiento</p>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold border-2 text-center ${getSentimentColor(result.sentiment)}`}
                  >
                    {result.sentiment}
                  </div>
                </div>

                {/* Tiempo */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{result.time}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explicación */}
      {results.length > 0 && (
        <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-3">Comparación de resultados:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>Regresión Logística:</strong> Modelo clásico, rápido y eficiente para análisis básico
            </li>
            <li>
              <strong>LSTM:</strong> Red neuronal recurrente que captura contexto secuencial del texto
            </li>
            <li>
              <strong>BERT:</strong> Transformer pre-entrenado con mejor comprensión semántica profunda
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
