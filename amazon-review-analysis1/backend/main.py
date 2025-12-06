"""
Backend FastAPI para análisis de reseñas de alimentos con múltiples modelos ML
- LogReg (Regresión Logística + TF-IDF)
- LSTM (Red Neuronal Recurrente)
- BERT (Transformers)
"""

import os
import pickle
import numpy as np
from typing import Optional
import logging

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

# ML Libraries
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
##from transformers import BertTokenizerFast, TFBertForSequenceClassification
import re
import string

from transformers import BertTokenizerFast, BertForSequenceClassification
import torch

from fastapi.middleware.cors import CORSMiddleware


# ============================================================================
# CONFIGURACIÓN
# ============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Detectar plataforma Windows vs Unix para rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ============================================================================
# MODELOS GLOBALES (Cargados al iniciar la aplicación)
# ============================================================================

# Regresión Logística
logreg_model = None
tfidf_vectorizer = None

# LSTM
lstm_model = None
lstm_tokenizer = None
LSTM_MAX_LEN = 150

# BERT
bert_model = None
bert_tokenizer = None

# ============================================================================
# ESQUEMAS PYDANTIC
# ============================================================================

class PredictionRequest(BaseModel):
    text: str
    model: str  # "logreg", "lstm", "bert"
    product_name: str

class PredictionResponse(BaseModel):
    score: int
    sentiment: str
    model: str
    product_name: str
    probs: Optional[list] = None

class BatchPredictionRequest(BaseModel):
    reviews: list[str]  # Lista de reseñas
    model: str
    product_name: str

class BatchPredictionResponse(BaseModel):
    results: list[dict]
    statistics: dict
    model: str
    product_name: str
    total_reviews: int

# ============================================================================
# FUNCIONES DE PROCESAMIENTO DE TEXTO
# ============================================================================

def preprocess_text(text: str) -> str:
    """Limpia y preprocesa el texto."""
    # Convertir a minúsculas
    text = text.lower()
    # Remover URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Remover caracteres especiales excepto puntuación importante
    text = re.sub(r'[^a-zA-Z0-9áéíóúñ\s.!?]', '', text)
    # Remover espacios extras
    text = ' '.join(text.split())
    return text

def score_to_sentiment(score: int) -> str:
    """Convierte puntuación (1-5) a sentimiento."""
    if score <= 2:
        return "Negativo"
    elif score == 3:
        return "Neutro"
    else:  # 4-5
        return "Positivo"

# ============================================================================
# CARGA DE MODELOS
# ============================================================================

def load_models():
    """Carga todos los modelos en memoria al iniciar la app."""
    global logreg_model, tfidf_vectorizer, lstm_model, lstm_tokenizer, bert_model, bert_tokenizer
    
    logger.info("Cargando modelos...")
    
    # --- LogReg ---
    try:
        logreg_path = os.path.join(MODELS_DIR, "logreg", "modelo_lr_entrenado.joblib")
        tfidf_path = os.path.join(MODELS_DIR, "logreg", "tfidf_vectorizer.joblib")
        
        if os.path.exists(logreg_path) and os.path.exists(tfidf_path):
            logreg_model = joblib.load(logreg_path)
            tfidf_vectorizer = joblib.load(tfidf_path)
            logger.info("✓ Modelo LogReg cargado correctamente")
        else:
            logger.warning("⚠ Archivos de LogReg no encontrados")
    except Exception as e:
        logger.error(f"✗ Error al cargar LogReg: {e}")
    
    # --- LSTM ---
        # --- LSTM ---
    try:
        lstm_model_path = os.path.join(MODELS_DIR, "lstm", "tuning_modelo_lstm_entrenado.h5")
        lstm_tokenizer_path = os.path.join(MODELS_DIR, "lstm", "tuning_tokenizer_lstm.pickle")
        
        if os.path.exists(lstm_model_path) and os.path.exists(lstm_tokenizer_path):
            # importante: usar tf.keras y compile=False para evitar problemas extra
            lstm_model = tf.keras.models.load_model(lstm_model_path, compile=False)
            with open(lstm_tokenizer_path, "rb") as f:
                lstm_tokenizer = pickle.load(f)
            logger.info("✓ Modelo LSTM cargado correctamente")
        else:
            logger.warning("⚠ Archivos de LSTM no encontrados")
    except Exception as e:
        logger.error(f"✗ Error al cargar LSTM: {e}")
        # asegurarnos de que queden en None si falla
        lstm_model = None
        lstm_tokenizer = None

    # --- BERT ---
    # --- BERT (versión PyTorch, sin TensorFlow) ---
    try:
        # Por ahora usamos directamente un modelo de HuggingFace
        bert_name = "nlptown/bert-base-multilingual-uncased-sentiment"
        logger.info(f"Cargando BERT (PyTorch) desde HuggingFace: {bert_name}")
        
        bert_model = BertForSequenceClassification.from_pretrained(bert_name)
        bert_tokenizer = BertTokenizerFast.from_pretrained(bert_name)
        bert_model.eval()  # modo evaluación, sin gradientes
        
        logger.info("✓ Modelo BERT cargado correctamente (PyTorch)")
    except Exception as e:
        logger.error(f"✗ Error al cargar BERT: {e}")
        bert_model = None
        bert_tokenizer = None
# ============================================================================
# FUNCIONES DE PREDICCIÓN
# ============================================================================

def predict_logreg(text: str) -> tuple:
    """Predicción con Regresión Logística."""
    if logreg_model is None or tfidf_vectorizer is None:
        raise Exception("Modelo LogReg no está cargado")
    
    text_clean = preprocess_text(text)
    # Vectorizar
    X = tfidf_vectorizer.transform([text_clean])
    # Predecir
    prediction = logreg_model.predict(X)[0]
    probs = logreg_model.predict_proba(X)[0]
    
    # LogReg predice 0-4, convertir a 1-5
    score = int(prediction) + 1
    score = max(1, min(5, score))  # Asegurar rango 1-5
    
    return score, list(probs)

def predict_lstm(text: str) -> tuple:
    if lstm_model is None or lstm_tokenizer is None:
        raise Exception("Modelo LSTM no está cargado")
    
    text_clean = preprocess_text(text)
    sequences = lstm_tokenizer.texts_to_sequences([text_clean])
    padded = pad_sequences(sequences, maxlen=LSTM_MAX_LEN, padding='post')

    probs = lstm_model.predict(padded, verbose=0)[0]  # shape (2,)
    # clase 0 = negativo, clase 1 = positivo (ajusta según cómo entrenaste)
    class_idx = int(np.argmax(probs))  # 0 o 1

    # mapeamos a un "score" artificial solo para que tu UI siga funcionando
    if class_idx == 0:
        score = 1  # muy negativo
    else:
        score = 5  # muy positivo

    return score, [float(p) for p in probs]


def predict_bert(text: str) -> tuple:
    """Predicción con BERT (PyTorch)."""
    if bert_model is None or bert_tokenizer is None:
        raise Exception("Modelo BERT no está cargado")
    
    text_clean = preprocess_text(text)
    
    # Tokenizar para PyTorch
    inputs = bert_tokenizer(
        text_clean,
        truncation=True,
        padding="max_length",
        max_length=128,
        return_tensors="pt"
    )
    
    # Desactivar gradientes
    with torch.no_grad():
        outputs = bert_model(**inputs)
    
    logits = outputs.logits[0]
    probs = torch.nn.functional.softmax(logits, dim=-1).numpy()
    
    score = int(np.argmax(probs)) + 1  # clases 0-4 → 1-5
    score = max(1, min(5, score))
    
    return score, list(probs)

# ============================================================================
# APLICACIÓN FASTAPI
# ============================================================================

app = FastAPI(
    title="API Análisis de Reseñas",
    description="Backend para predicción de sentimientos en reseñas de alimentos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # permitir cualquier origen (solo desarrollo)
    allow_credentials=False,      # ponlo en False si usas "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# EVENTOS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar la app."""
    logger.info("📚 Iniciando servidor FastAPI...")
    load_models()
    logger.info("✓ Servidor listo para recibir predicciones")

# ============================================================================
# RUTAS
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    """Información sobre la API."""
    return {
        "message": "API de Análisis de Reseñas de Alimentos",
        "version": "1.0.0",
        "models_available": {
            "logreg": "Regresión Logística + TF-IDF",
            "lstm": "Red Neuronal LSTM",
            "bert": "Transformers BERT"
        }
    }

@app.get("/health", tags=["Info"])
async def health_check():
    """Verificar estado de la API."""
    models_status = {
        "logreg": logreg_model is not None and tfidf_vectorizer is not None,
        "lstm": lstm_model is not None and lstm_tokenizer is not None,
        "bert": bert_model is not None and bert_tokenizer is not None,
    }
    return {
        "status": "ok",
        "models": models_status
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict(request: PredictionRequest):

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="El texto no puede estar vacío")
    
    model_name = request.model.lower().strip()
    
    try:
        if model_name == "logreg":
            score, probs = predict_logreg(request.text)
        elif model_name == "lstm":
            score, probs = predict_lstm(request.text)
        elif model_name == "bert":
            score, probs = predict_bert(request.text)
        else:
            raise HTTPException(status_code=400, detail=f"Modelo desconocido: {model_name}")
        
        sentiment = score_to_sentiment(score)

        #  CONVERSIÓN OBLIGATORIA PARA EVITAR EL ERROR
        probs = [float(p) for p in probs]

        return PredictionResponse(
            score=score,
            sentiment=sentiment,
            model=model_name,
            product_name=request.product_name,
            probs=probs
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Error al realizar predicción: {str(e)}")


@app.post("/predict-batch", response_model=BatchPredictionResponse, tags=["Predictions"])
async def predict_batch(request: BatchPredictionRequest):
    """
    Endpoint de predicción masiva.
    
    - **reviews**: Lista de reseñas a analizar
    - **model**: Modelo a usar (logreg, lstm, bert)
    - **product_name**: Nombre del producto
    
    Retorna estadísticas agregadas y análisis individual de cada reseña.
    """
    
    if not request.reviews or len(request.reviews) == 0:
        return {"error": "Debe proporcionar al menos una reseña"}
    
    model_name = request.model.lower().strip()
    results = []
    scores = []
    sentiments = {"Negativo": 0, "Neutro": 0, "Positivo": 0}
    
    try:
        # Analizar cada reseña
        for idx, text in enumerate(request.reviews):
            if not text or len(text.strip()) == 0:
                continue
            
            # Predecir según modelo
            if model_name == "logreg":
                score, probs = predict_logreg(text)
            elif model_name == "lstm":
                score, probs = predict_lstm(text)
            elif model_name == "bert":
                score, probs = predict_bert(text)
            else:
                return {"error": f"Modelo desconocido: {model_name}"}
            
            sentiment = score_to_sentiment(score)
            scores.append(score)
            sentiments[sentiment] += 1
            
            results.append({
                "index": idx + 1,
                "text": text[:100] + "..." if len(text) > 100 else text,
                "score": score,
                "sentiment": sentiment,
                "probs": [float(p) for p in probs]
            })
        
        # Calcular estadísticas
        avg_score = sum(scores) / len(scores) if scores else 0
        statistics = {
            "average_score": round(avg_score, 2),
            "sentiment_distribution": sentiments,
            "score_distribution": {
                "1": scores.count(1),
                "2": scores.count(2),
                "3": scores.count(3),
                "4": scores.count(4),
                "5": scores.count(5)
            }
        }
        
        return BatchPredictionResponse(
            results=results,
            statistics=statistics,
            model=model_name,
            product_name=request.product_name,
            total_reviews=len(results)
        )
    
    except Exception as e:
        logger.error(f"Error en predicción masiva: {e}")
        return {"error": f"Error al realizar predicción masiva: {str(e)}"}

# ============================================================================
# PUNTO DE ENTRADA
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

