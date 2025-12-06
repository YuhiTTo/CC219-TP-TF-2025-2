# Guía de Solución de Problemas

## Problemas con Python y el Backend

### 1. "python: command not found"
**Causa:** Python no está instalado o no está en el PATH

**Solución:**
- Windows: Descarga Python desde python.org (asegúrate de marcar "Add to PATH")
- Mac: `brew install python3`
- Linux: `sudo apt install python3 python3-pip`

### 2. "pip: command not found"
**Solución:**
\`\`\`bash
# Windows
python -m ensurepip --upgrade

# Mac/Linux
sudo apt install python3-pip
\`\`\`

### 3. Error al instalar TensorFlow o transformers
**Causa:** Incompatibilidad de versiones

**Solución:**
\`\`\`bash
# Usa versiones específicas compatibles
pip install tensorflow==2.15.0
pip install transformers==4.35.0
pip install torch==2.1.0
\`\`\`

### 4. "Address already in use" (puerto 8000 ocupado)
**Solución:**
\`\`\`bash
# Windows - Matar proceso en puerto 8000
netstat -ano | findstr :8000
taskkill /PID <numero_pid> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9

# O usa otro puerto:
python -m uvicorn main:app --reload --port 8001
\`\`\`

### 5. Modelos tardan mucho en cargar
**Causa:** BERT es pesado (~400MB)

**Solución:** Esto es normal. Primera carga toma 30-60 segundos.

### 6. "FileNotFoundError: modelo no encontrado"
**Solución:**
\`\`\`bash
# Verifica la estructura de carpetas
cd backend
ls -R models/  # Mac/Linux
dir models /s  # Windows

# Asegúrate de que tienes:
# models/logreg/modelo_lr_entrenado.joblib
# models/lstm/tuning_modelo_lstm_entrenado.h5
# models/bert/config.json
\`\`\`

## Problemas con Node.js y el Frontend

### 7. "npm: command not found"
**Causa:** Node.js no está instalado

**Solución:**
- Descarga Node.js desde nodejs.org (versión LTS recomendada)
- Reinicia VS Code después de instalar

### 8. "Cannot find module" al ejecutar npm run dev
**Solución:**
\`\`\`bash
# Borra node_modules y reinstala
rm -rf node_modules package-lock.json  # Mac/Linux
# o
rmdir /s node_modules & del package-lock.json  # Windows

npm install
\`\`\`

### 9. "Port 3000 already in use"
**Solución:**
\`\`\`bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero_pid> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# O edita package.json para usar puerto diferente:
# "dev": "next dev -p 3001"
\`\`\`

### 10. "Error loading .env.local"
**Solución:**
- Asegúrate de que `.env.local` está en la raíz (NO en /backend)
- NO uses comillas en los valores:
  \`\`\`
  # ✗ INCORRECTO
  NEXT_PUBLIC_SUPABASE_URL="https://..."
  
  # ✓ CORRECTO
  NEXT_PUBLIC_SUPABASE_URL=https://...
  \`\`\`

## Problemas con Supabase

### 11. "Invalid API key"
**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia la "anon public" key (NO la service_role)
3. Pégala en `.env.local`:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui
   \`\`\`

### 12. "Table reviews_history does not exist"
**Solución:**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia el contenido de `database_setup.sql`
3. Ejecuta el script completo
4. Verifica en Table Editor que la tabla exista

### 13. "RLS policy violation"
**Causa:** No estás autenticado o las políticas RLS no están configuradas

**Solución:**
1. Cierra sesión y vuelve a iniciar
2. Verifica en Supabase → Authentication que tu usuario exista
3. Verifica en Table Editor → reviews_history → Policies que haya 3 políticas

### 14. Email de confirmación no llega
**Solución rápida:**
1. Ve a Supabase Dashboard
2. Authentication → Users
3. Busca tu email
4. Clic en los 3 puntos → "Confirm User"

**Solución permanente:**
- Configura un proveedor de email en Supabase Settings → Auth → Email

### 15. "Session expired" constantemente
**Solución:**
\`\`\`bash
# Borra las cookies del navegador para localhost
# O usa modo incógnito

# En Chrome: F12 → Application → Storage → Clear site data
\`\`\`

## Problemas con CORS

### 16. "CORS policy: No 'Access-Control-Allow-Origin'"
**Causa:** Frontend y backend no pueden comunicarse

**Solución:**
1. Verifica que el backend esté corriendo
2. En `backend/main.py`, verifica que el origen esté permitido:
   \`\`\`python
   allow_origins=[
       "http://localhost:3000",  # ← Debe coincidir con tu frontend
   ]
   \`\`\`
3. Reinicia el backend después de cambiar

## Problemas de Predicción

### 17. "Model returned invalid score"
**Causa:** Modelo entrenado con diferentes clases

**Solución:**
- Verifica que tus modelos predicen clases 0-4 (que se convierten a 1-5)
- Revisa los logs del backend para ver valores intermedios

### 18. Predicción es muy lenta (>10 segundos)
**Causa:** BERT sin GPU

**Solución:**
- Primera predicción siempre es lenta (compilación)
- Predicciones siguientes son más rápidas
- Para acelerar BERT: instala tensorflow-gpu (requiere CUDA)

### 19. "Text too long" error
**Solución:**
- BERT tiene límite de 128 tokens
- LSTM tiene límite de 200 tokens
- Recorta textos largos en el frontend o aumenta max_length en backend

## Problemas Visuales / UI

### 20. Estilos no se aplican correctamente
**Solución:**
\`\`\`bash
# Reconstruye Tailwind CSS
npm run build
npm run dev
\`\`\`

### 21. Tabla de historial vacía
**Causa:** No hay datos o error de autenticación

**Solución:**
1. Verifica en Supabase Table Editor si hay registros
2. Verifica que `user_id` coincida con tu ID de usuario
3. Mira la consola del navegador (F12) para errores

### 22. Botón "Predecir" no responde
**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el backend responda: http://localhost:8000/health

## Comandos de Diagnóstico Útiles

### Verificar versiones:
\`\`\`bash
python --version  # Debe ser 3.9+
node --version    # Debe ser 18+
npm --version     # Debe ser 9+
\`\`\`

### Verificar puertos en uso:
\`\`\`bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :3000
lsof -i :8000
\`\`\`

### Ver logs detallados del backend:
\`\`\`bash
# Ejecuta con más verbosidad
python -m uvicorn main:app --reload --log-level debug
\`\`\`

### Verificar conexión a Supabase:
\`\`\`bash
# Desde el navegador, abre consola y ejecuta:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
# Debe mostrar tu URL, no undefined
\`\`\`

## Contacto y Recursos

Si ninguna solución funciona:
1. Copia el mensaje de error completo
2. Copia los logs del backend/frontend
3. Verifica la versión de Python, Node, y dependencias
4. Revisa la documentación oficial:
   - FastAPI: https://fastapi.tiangolo.com
   - Next.js: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
