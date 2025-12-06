"use client"

import type React from "react"

import { useState } from "react"
import { FileText, BarChart3, Download, Sparkles } from "lucide-react"
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

interface BatchAnalysisProps {
  userId: string
}

interface BatchResult {
  results: Array<{
    index: number
    text: string
    score: number
    sentiment: string
  }>
  statistics: {
    average_score: number
    sentiment_distribution: {
      Negativo: number
      Neutro: number
      Positivo: number
    }
    score_distribution: {
      "1": number
      "2": number
      "3": number
      "4": number
      "5": number
    }
  }
  total_reviews: number
  model: string
  product_name: string
}

export default function BatchAnalysis({ userId }: BatchAnalysisProps) {
  const [product, setProduct] = useState(PRODUCTS[0])
  const [model, setModel] = useState(
    Object.entries(AVAILABLE_MODELS).find(([_, config]) => config.available)?.[0] || "bert",
  )
  const [reviews, setReviews] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BatchResult | null>(null)

  const exampleReviews = `Este café es absolutamente delicioso, el mejor que he probado
El sabor es horrible, no lo recomiendo para nada
Producto decente, nada especial pero cumple
Increíble calidad, superó mis expectativas totalmente
No vale la pena el precio, muy decepcionante`

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviews.trim()) return

    setLoading(true)
    setResult(null)

    try {
      // Dividir las reseñas por líneas
      const reviewsList = reviews
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0)

      const response = await fetch(`${API_URL}/predict-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: reviewsList,
          model,
          product_name: product,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en el análisis masivo")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al analizar las reseñas")
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!result) return

    const headers = ["#", "Reseña", "Puntuación", "Sentimiento"]
    const rows = result.results.map((r) => [r.index, `"${r.text.replace(/"/g, '""')}"`, r.score, r.sentiment])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analisis_${product}_${Date.now()}.csv`
    a.click()
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

  const getModelName = (m: string) => {
    const names: Record<string, string> = {
      logreg: "Regresión Logística",
      lstm: "LSTM",
      bert: "BERT",
    }
    return names[m]
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Análisis Masivo de Reseñas</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Analiza múltiples reseñas de un producto simultáneamente. Copia y pega reseñas de Amazon (una por línea) o usa
          el ejemplo.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Producto</label>
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
              <label className="block text-sm font-semibold text-foreground mb-2">Modelo</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground"
              >
                {Object.entries(AVAILABLE_MODELS)
                  .filter(([_, config]) => config.available)
                  .map(([id, config]) => (
                    <option key={id} value={id}>
                      {config.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-foreground">Reseñas (una por línea)</label>
              <button
                type="button"
                onClick={() => setReviews(exampleReviews)}
                className="text-xs text-primary hover:text-primary/80 font-semibold"
              >
                Usar ejemplo
              </button>
            </div>
            <textarea
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              placeholder="Copia y pega reseñas de Amazon, una por línea..."
              rows={10}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground placeholder-gray-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              {reviews.split("\n").filter((r) => r.trim().length > 0).length} reseñas detectadas
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !reviews.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Analizando {reviews.split("\n").filter((r) => r.trim().length > 0).length} reseñas...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analizar Reseñas
              </>
            )}
          </button>
        </form>
      </div>

      {/* Resultados */}
      {result && (
        <>
          {/* Estadísticas */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-7 h-7" />
                <h3 className="text-2xl font-bold">Estadísticas del Análisis</h3>
              </div>
              <button
                onClick={downloadCSV}
                className="bg-white text-primary hover:bg-white/90 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar CSV
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Total Reseñas</p>
                <p className="text-3xl font-bold">{result.total_reviews}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Puntuación Promedio</p>
                <p className="text-3xl font-bold">{result.statistics.average_score}/5</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Positivas</p>
                <p className="text-3xl font-bold">{result.statistics.sentiment_distribution.Positivo}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Negativas</p>
                <p className="text-3xl font-bold">{result.statistics.sentiment_distribution.Negativo}</p>
              </div>
            </div>

            {/* Gráfico de barras simple */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="font-semibold mb-4">Distribución de Puntuaciones</p>
              <div className="space-y-3">
                {Object.entries(result.statistics.score_distribution).map(([score, count]) => {
                  const percentage = (count / result.total_reviews) * 100
                  return (
                    <div key={score} className="flex items-center gap-3">
                      <span className="w-8 font-bold">{score}⭐</span>
                      <div className="flex-1 bg-white/20 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full flex items-center justify-end pr-2 text-primary text-xs font-bold"
                          style={{ width: `${percentage}%` }}
                        >
                          {count > 0 && count}
                        </div>
                      </div>
                      <span className="w-12 text-sm text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tabla de resultados individuales */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-6">Resultados Individuales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Reseña</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Puntuación</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Sentimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((item) => (
                    <tr key={item.index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-gray-600">{item.index}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-md">{item.text}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-warning font-bold">{item.score}/5</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getSentimentColor(item.sentiment)}`}
                        >
                          {item.sentiment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
