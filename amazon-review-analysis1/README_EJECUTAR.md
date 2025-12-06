# Guía Rápida de Ejecución - Visual Studio Code

## PASO 1: Configurar Base de Datos Supabase

1. Abre tu navegador y ve a: https://supabase.com/dashboard
2. Haz clic en tu proyecto
3. En el menú lateral, busca "SQL Editor"
4. Copia TODO el contenido del archivo `database_setup.sql`
5. Pégalo en el editor SQL de Supabase
6. Haz clic en el botón "RUN" para ejecutar
7. Deberías ver un mensaje: "Success. No rows returned"

## PASO 2: Configurar Backend Python

### Abrir terminal en VS Code:
- Presiona: `Ctrl + Ñ` (Windows/Linux) o `Cmd + Ñ` (Mac)
- O ve a: Terminal → Nueva Terminal

### Ejecutar estos comandos uno por uno:

\`\`\`bash
# 1. Ir a la carpeta backend
cd backend

# 2. Crear ambiente virtual (opcional pero recomendado)
python -m venv venv

# 3. Activar ambiente virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Ejecutar el servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Deberías ver algo como:
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
✓ Modelo LogReg cargado correctamente
✓ Modelo LSTM cargado correctamente
✓ Modelo BERT cargado correctamente
\`\`\`

**IMPORTANTE:** Deja esta terminal abierta y ejecutándose

## PASO 3: Verificar que tus modelos están cargados

Antes de continuar, verifica que tu carpeta `backend/` tenga esta estructura:

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

Si falta algún modelo, el backend seguirá funcionando pero ese modelo no estará disponible.

## PASO 4: Configurar Frontend

### Abrir OTRA terminal nueva en VS Code:
- Presiona: `Ctrl + Shift + Ñ` 
- O ve a: Terminal → Nueva Terminal (ícono +)

**NO cierres la terminal del backend**

### Ejecutar estos comandos:

\`\`\`bash
# 1. Asegúrate de estar en la carpeta raíz (no en backend)
# Si estás en backend, sal con:
cd ..

# 2. Instalar dependencias de Node.js
npm install

# 3. Ejecutar el servidor de desarrollo
npm run dev
\`\`\`

Deberías ver:
\`\`\`
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
\`\`\`

## PASO 5: Probar la Aplicación

1. Abre tu navegador en: **http://localhost:3000**
2. Registra una cuenta nueva:
   - Email: tu_email@ejemplo.com
   - Contraseña: mínimo 6 caracteres
3. Recibirás un email de confirmación (revisa spam)
4. Después de confirmar, inicia sesión

## PASO 6: Usar el Dashboard

1. Selecciona un producto del menú desplegable
2. Escribe una reseña (ejemplo: "This coffee is amazing, best I've ever had!")
3. Selecciona un modelo (LogReg, LSTM o BERT)
4. Haz clic en "Predecir Sentimiento"
5. Verás el resultado con estrellas y sentimiento
6. El historial se guarda automáticamente en la tabla de abajo

## Solución de Problemas Comunes

### Error: "Module not found" en el backend
\`\`\`bash
# Asegúrate de que el ambiente virtual esté activado
# Deberías ver (venv) al inicio de tu terminal

# Reinstala las dependencias:
pip install -r requirements.txt
\`\`\`

### Error: "Cannot connect to backend" en el frontend
- Verifica que el backend esté corriendo en http://localhost:8000
- Prueba abriendo: http://localhost:8000/health
- Deberías ver: `{"status":"ok","models":{...}}`

### Error: "Supabase connection failed"
- Verifica que tu archivo `.env.local` tenga las credenciales correctas
- El archivo debe estar en la raíz del proyecto (NO en backend/)
- Las variables deben ser:
  \`\`\`
  NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
  \`\`\`

### Error: "Model not loaded" al hacer predicción
- Revisa los logs del backend (primera terminal)
- Si un modelo no se cargó, verás: `⚠ Archivos de [modelo] no encontrados`
- Verifica que los archivos existen en la carpeta correcta

### El email de confirmación no llega
- Revisa tu carpeta de spam
- O ve a Supabase Dashboard → Authentication → Users
- Busca tu usuario y haz clic en "Confirm User" manualmente

## Estructura de Terminales en VS Code

Deberías tener 2 terminales abiertas simultáneamente:

**Terminal 1 (Backend):**
\`\`\`
(venv) C:\tu-proyecto\backend> python -m uvicorn main:app --reload
INFO:     Uvicorn running on http://0.0.0.0:8000
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`
C:\tu-proyecto> npm run dev
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
\`\`\`

## Comandos Útiles

Para detener un servidor: `Ctrl + C` en la terminal correspondiente

Para reinicar el backend:
\`\`\`bash
# Desde la carpeta backend
python -m uvicorn main:app --reload
\`\`\`

Para reiniciar el frontend:
\`\`\`bash
# Desde la carpeta raíz
npm run dev
\`\`\`

Para ver logs del backend en tiempo real:
- Solo observa la terminal del backend mientras usas la app

## Próximos Pasos

Una vez que todo funcione:
- Personaliza los productos en `components/dashboard/review-section.tsx`
- Ajusta los colores en `app/globals.css`
- Agrega más funcionalidades según tu tesis
