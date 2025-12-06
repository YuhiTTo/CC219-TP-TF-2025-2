export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const AVAILABLE_MODELS = {
  logreg: { id: "logreg", name: "Regresión Logística", available: true },
  lstm: { id: "lstm", name: "LSTM", available: true }, // Actualmente no disponible
  bert: { id: "bert", name: "BERT", available: true },
}