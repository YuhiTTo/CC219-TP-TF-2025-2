# Instrucciones de Configuración

## 1. BACKEND FastAPI

### Requisitos previos
- Python 3.9+
- pip

### Instalación

\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### Estructura de carpetas esperada

\`\`\`
backend/
├── main.py
├── requirements.txt
└── models/
    ├── logreg/
    │   ├── modelo_lr_entrenado.joblib
    │   └── tfidf_vectorizer.joblib
    ├── lstm/
    │   ├── tuning_modelo_lstm_entrenado.h5
    │   └── tuning_tokenizer_lstm.pickle
    └── bert/
        ├── config.json
        ├── tf_model.h5
        ├── tokenizer_config.json
        ├── special_tokens_map.json
        └── vocab.txt
\`\`\`

### Ejecutar el backend

\`\`\`bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

El servidor estará disponible en: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs

## 2. SUPABASE

### Pasos

1. Crear cuenta en supabase.com
2. Crear nuevo proyecto
3. En la sección "SQL Editor", ejecutar el contenido de `database_setup.sql`
4. Copiar las variables de entorno:
   - Ir a "Project Settings" > "API"
   - Copiar "Project URL" y "anon key"
5. Pegar en `.env.local` del frontend:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=<tu_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_key>
   \`\`\`

## 3. FRONTEND Next.js

### Instalación

\`\`\`bash
npm install
# o
yarn install
\`\`\`

### Variables de entorno

Editar `.env.local` con tus credenciales de Supabase (ver paso anterior).

### Ejecutar el frontend

\`\`\`bash
npm run dev
\`\`\`

El frontend estará disponible en: http://localhost:3000

## 4. TESTING

1. Abre http://localhost:3000 en tu navegador
2. Registra una cuenta con email y contraseña
3. En el dashboard:
   - Selecciona un producto
   - Escribe una reseña de prueba
   - Elige un modelo
   - Haz clic en "Predecir Sentimiento"
4. Verifica que aparezca el resultado y se guarde en el historial

## Solución de Problemas

### Error: "CORS policy"
- Asegúrate de que el backend está corriendo en http://localhost:8000
- Verifica que los orígenes CORS estén configurados correctamente en `main.py`

### Error: "Models not loaded"
- Verifica que los archivos de modelos están en la carpeta `backend/models/`
- Revisa los logs del backend para ver qué modelos se cargaron exitosamente

### Error: "Supabase connection"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son correctos
- Asegúrate de que la tabla `reviews_history` existe en tu base de datos

## Próximos pasos

- Ajusta los nombres de productos en `components/dashboard/review-section.tsx`
- Personaliza los colores en `app/globals.css`
- Agrega más modelos o características según tus necesidades
