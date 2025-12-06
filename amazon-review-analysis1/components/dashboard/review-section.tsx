"use client"

import type React from "react"

import { useState } from "react"
import { Package, MessageSquare, Cpu, Send } from "lucide-react"

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

const MODELS = [
  { id: "logreg", name: "Regresión Logística", description: "Rápida y eficiente", icon: "⚡" },
  { id: "lstm", name: "LSTM", description: "Red neuronal recurrente", icon: "🧠" },
  { id: "bert", name: "BERT", description: "Transformer pre-entrenado", icon: "🚀" },
]

const EXAMPLE_REVIEWS = [
  "El producto es excelente, superó mis expectativas. Lo recomiendo totalmente.",
  "Calidad regular, esperaba algo mejor por el precio. No volvería a comprarlo.",
  "Es aceptable, cumple con lo que promete pero nada especial.",
]

interface ReviewSectionProps {
  onPredict: (text: string, model: string, productName: string) => void
  loading: boolean
  error: string
}

export default function ReviewSection({ onPredict, loading, error }: ReviewSectionProps) {
  const [product, setProduct] = useState(PRODUCTS[0])
  const [review, setReview] = useState("")
  const [model, setModel] = useState("logreg")
  const [charCount, setCharCount] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (review.trim()) {
      onPredict(review, model, product)
    }
  }

  const useExample = (exampleText: string) => {
    setReview(exampleText)
    setCharCount(exampleText.length)
  }

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setReview(text)
    setCharCount(text.length)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary" />
        Predecir Sentimiento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleccionar producto */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Producto de Amazon
          </label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-foreground transition"
          >
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Textarea reseña */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-foreground">Reseña / Comentario</label>
            <span className="text-xs text-gray-500">{charCount} caracteres</span>
          </div>
          <textarea
            value={review}
            onChange={handleReviewChange}
            placeholder="Escribe la reseña que deseas analizar..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-foreground placeholder-gray-400 resize-none transition"
          />

          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-2">Ejemplos rápidos:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_REVIEWS.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReview(example)}
                  className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition"
                >
                  Ejemplo {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seleccionar modelo */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Modelo de IA
          </label>
          <div className="space-y-3">
            {MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                  model === m.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-slate-50 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={m.id}
                  checked={model === m.id}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-5 h-5 text-primary cursor-pointer"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <p className="font-bold text-foreground">{m.name}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border-2 border-error text-error rounded-xl text-sm font-medium">{error}</div>
        )}

        {/* Botón predecir */}
        <button
          type="submit"
          disabled={loading || !review.trim()}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              Analizando con IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Predecir Sentimiento
            </>
          )}
        </button>
      </form>
    </div>
  )
}
