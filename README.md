# CC219-TP-TF-2025-2
# Objetivo del trabajo
El objetivo de este proyecto es aplicar técnicas de Minería de Datos y Procesamiento de Lenguaje Natural (NLP) para analizar reseñas de productos alimenticios publicadas en Amazon.
El propósito es desarrollar un modelo de clasificación capaz de predecir la calificación otorgada por el usuario (de 1 a 5 estrellas) a partir del texto de la reseña, identificando patrones lingüísticos que reflejen percepciones positivas o negativas sobre los productos.
El proyecto se desarrolla en el marco del curso CC219 – Data Mining, siguiendo los lineamientos metodológicos enseñados en clase (preprocesamiento, vectorización TF-IDF, entrenamiento de modelos y evaluación de rendimiento).

# Integrantes del equipo
U20211e088 - Huamán Saavedra, Willam Alexander

U202216120 - Manchay Paredes, Lucero Salome

U202218044 - Mayhua Hinostroza, José Antonio

# Descripción del dataset

El dataset utilizado es “Amazon Fine Food Reviews”, disponible públicamente en Kaggle. Contiene 568,454 reseñas de productos alimenticios publicadas por usuarios en Amazon entre 1999 y 2012.
Cada registro incluye información sobre el producto, el usuario, la puntuación otorgada y el texto de la reseña.

Principales atributos:

Id: Identificador único de la reseña.

ProductId: Código del producto.

UserId: Identificador del usuario.

ProfileName: Nombre del usuario.

HelpfulnessNumerator y HelpfulnessDenominator: Indicadores de utilidad de la reseña.

Score: Calificación otorgada (1 a 5 estrellas).

Time: Fecha de publicación.

Summary: Resumen breve de la reseña.

Text: Texto completo de la reseña (principal variable analizada).

# Conclusiones

Se logró construir un pipeline completo de minería de texto, incluyendo limpieza, normalización, vectorización y modelización.

El análisis mostró que las palabras más frecuentes en las reseñas positivas son “like”, “good”, “taste” y “product”, evidenciando una tendencia a comentarios favorables.

Entre los modelos probados, la Red Neuronal MLP (baseline) presentó el mejor rendimiento global, con una accuracy aproximada de 0.69 y un F1 ponderado de 0.68, demostrando una buena capacidad para predecir reseñas positivas.

# Licencia
Este proyecto está bajo la Licencia MIT. Ver LICENSE para más detalles.

