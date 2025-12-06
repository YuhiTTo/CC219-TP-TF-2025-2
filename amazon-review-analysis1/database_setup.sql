-- Crear tabla de historial de reseñas
CREATE TABLE reviews_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  review_text TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  predicted_score INTEGER NOT NULL CHECK (predicted_score >= 1 AND predicted_score <= 5),
  predicted_sentiment VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_reviews_user_id ON reviews_history(user_id);
CREATE INDEX idx_reviews_created_at ON reviews_history(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE reviews_history ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias reseñas
CREATE POLICY "Users can view their own reviews"
  ON reviews_history FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias reseñas
CREATE POLICY "Users can insert their own reviews"
  ON reviews_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden borrar sus propias reseñas
CREATE POLICY "Users can delete their own reviews"
  ON reviews_history FOR DELETE
  USING (auth.uid() = user_id);
