"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface HistoryRecord {
  id: string
  product_name: string
  review_text: string
  model_used: string
  predicted_score: number
  predicted_sentiment: string
  created_at: string
}

interface HistoryTableProps {
  userId: string
  refreshKey: number
}

export default function HistoryTable({ userId, refreshKey }: HistoryTableProps) {
  const supabase = createClient()
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("reviews_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error cargando historial:", error)
      } else {
        setRecords(data || [])
      }
      setLoading(false)
    }

    fetchHistory()
  }, [userId, supabase, refreshKey])

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      Positivo: "bg-positive/20 text-positive border-positive/30",
      Negativo: "bg-error/20 text-error border-error/30",
      Neutro: "bg-warning/20 text-warning border-warning/30",
    }
    return colors[sentiment] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Historial de Predicciones</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p className="mb-2">No hay predicciones aún</p>
          <p className="text-sm">Realiza tu primera predicción arriba</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-border">
              <tr>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Producto</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Modelo</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Puntuación</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Sentimiento</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-border hover:bg-slate-50 transition">
                  <td className="py-3 px-2 text-foreground font-medium">
                    {record.product_name.substring(0, 20)}
                    {record.product_name.length > 20 ? "..." : ""}
                  </td>
                  <td className="py-3 px-2 text-gray-600">{record.model_used.toUpperCase()}</td>
                  <td className="py-3 px-2">
                    <span className="font-bold text-foreground">{record.predicted_score}/5</span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSentimentBadge(
                        record.predicted_sentiment,
                      )}`}
                    >
                      {record.predicted_sentiment}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {new Date(record.created_at).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
