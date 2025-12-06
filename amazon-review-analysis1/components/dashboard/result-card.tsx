"use client"

import { Award, ThumbsUp, ThumbsDown, Meh } from "lucide-react"

interface Prediction {
  score: number
  sentiment: string
  model: string
  product_name: string
  probs?: number[]
}

interface ResultCardProps {
  prediction: Prediction
}

export default function ResultCard({ prediction }: ResultCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positivo":
        return "bg-positive/10 border-positive text-positive"
      case "Negativo":
        return "bg-error/10 border-error text-error"
      default:
        return "bg-warning/10 border-warning text-warning"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positivo":
        return <ThumbsUp className="w-6 h-6" />
      case "Negativo":
        return <ThumbsDown className="w-6 h-6" />
      default:
        return <Meh className="w-6 h-6" />
    }
  }

  const getModelLabel = (model: string) => {
    const labels: Record<string, string> = {
      logreg: "Regresión Logística",
      lstm: "LSTM",
      bert: "BERT",
    }
    return labels[model] || model
  }

  const getScoreDescription = (score: number) => {
    switch (score) {
      case 5:
        return "Excelente - El usuario está muy satisfecho"
      case 4:
        return "Muy bueno - Experiencia positiva general"
      case 3:
        return "Neutral - Opinión mixta o sin preferencia clara"
      case 2:
        return "Regular - Experiencia por debajo de expectativas"
      case 1:
        return "Muy malo - Usuario muy insatisfecho"
      default:
        return ""
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-primary/20">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Resultado del Análisis</h2>
      </div>

      {/* Modelo usado */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
        <p className="text-sm text-gray-600 mb-1">Modelo de IA utilizado:</p>
        <p className="font-bold text-foreground text-xl">{getModelLabel(prediction.model)}</p>
      </div>

      {/* Puntuación con estrellas */}
      <div className="mb-6 p-6 bg-slate-50 rounded-xl border-2 border-border">
        <p className="text-sm font-semibold text-gray-600 mb-3">Puntuación predicha:</p>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= prediction.score ? "text-warning" : "text-gray-300"}>
                ⭐
              </span>
            ))}
          </div>
          <span className="text-3xl font-bold text-foreground">{prediction.score}/5</span>
        </div>
        <p className="text-sm text-gray-600 italic">{getScoreDescription(prediction.score)}</p>
      </div>

      {/* Badge sentimiento */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-3">Análisis de sentimiento:</p>
        <div
          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold border-2 ${getSentimentColor(
            prediction.sentiment,
          )}`}
        >
          {getSentimentIcon(prediction.sentiment)}
          <span className="text-xl">{prediction.sentiment}</span>
        </div>
      </div>

      {/* Producto */}
      <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl mb-6">
        <p className="text-sm text-gray-600 mb-1">Producto analizado:</p>
        <p className="font-bold text-foreground text-lg">{prediction.product_name}</p>
      </div>

      {/* Notas */}
      <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Nota:</strong> Esta predicción está basada en análisis de texto con inteligencia artificial. Los
          resultados son informativos y reflejan patrones aprendidos de +500K reseñas reales.
        </p>
      </div>
    </div>
  )
}
