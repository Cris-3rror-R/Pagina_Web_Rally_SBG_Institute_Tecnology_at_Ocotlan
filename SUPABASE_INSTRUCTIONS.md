# 🗄️ Instrucciones Completas - Base de Datos Supabase

**Guía rápida para generar y configurar la base de datos**

---

## 🚀 Opción Rápida (5 minutos)

Si quieres hacerlo **Ya mismo**:

### 1️⃣ Abre el Prompt
```
Archivo: SUPABASE_AI_PROMPT.md
Sección: "PROMPT COMPLETO" (está entre los ``` )
```

### 2️⃣ Elige Tu IA
- **ChatGPT**: https://chat.openai.com
- **Claude**: https://claude.ai
- **Gemini**: https://gemini.google.com
- **O cualquier otra IA**

### 3️⃣ Copia y Pega
1. Copia TODO el prompt (desde "Necesito crear..." hasta "...especificaciones?")
2. Pégalo en la IA
3. Click "Send"

### 4️⃣ Obtén el SQL
La IA generará bloques SQL. Cópialos todos.

### 5️⃣ Ejecuta en Supabase
1. Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Pega TODO el SQL
4. Click "Run"

### 6️⃣ Verifica
- Supabase → Table Editor
- ¿Ves 4 tablas? ✅ ¡Listo!

---

## 📋 Checklist Paso a Paso

### ✅ Antes de Empezar
- [ ] Cuenta Supabase creada (https://supabase.com)
- [ ] Proyecto Supabase creado
- [ ] Acceso al Dashboard

### ✅ Generación de Base de Datos
- [ ] Abierto: SUPABASE_AI_PROMPT.md
- [ ] Copiado: El prompt completo
- [ ] Elegida: Una IA (ChatGPT, Claude, etc.)
- [ ] Pegado: El prompt en la IA
- [ ] Generado: SQL por la IA
- [ ] Copiado: El SQL resultante

### ✅ Ejecución en Supabase
- [ ] Supabase Dashboard abierto
- [ ] SQL Editor abierto
- [ ] SQL pegado en editor
- [ ] SQL ejecutado ("Run" button)
- [ ] Sin errores ✅

### ✅ Verificación
- [ ] Tabla "Profiles" visible en Table Editor
- [ ] Tabla "Stations" visible
- [ ] Tabla "StationAttempts" visible
- [ ] Tabla "TeamLocations" visible
- [ ] Todos tienen datos de ejemplo (si los generó)

### ✅ Obtener Credenciales
- [ ] Settings → API abierto
- [ ] Copiado: Project URL
- [ ] Copiado: anon public key
- [ ] Copiado: service_role secret key

### ✅ Configurar Frontend
- [ ] Archivo .env.local creado en carpeta frontend/
- [ ] NEXT_PUBLIC_SUPABASE_URL = <URL>
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY = <KEY>
- [ ] NEXT_PUBLIC_API_URL = http://localhost:8000

### ✅ Testing
- [ ] pnpm dev en frontend/
- [ ] http://localhost:3000 abre
- [ ] Backend backend/ corriendo
- [ ] http://localhost:8000/docs accesible

---

## 📚 Recursos por Opción

### Si Usas ChatGPT
1. Abre: https://chat.openai.com
2. Nuevo chat
3. Pega el prompt de SUPABASE_AI_PROMPT.md
4. Espera SQL
5. Copia el SQL a Supabase SQL Editor

**Ventajas**: Rápido, fácil, amigable
**Desventajas**: Requiere cuenta OpenAI

### Si Usas Claude
1. Abre: https://claude.ai
2. Nuevo chat
3. Pega el prompt
4. Espera SQL
5. Copia a Supabase

**Ventajas**: Muy preciso, buen SQL
**Desventajas**: Requiere cuenta Anthropic

### Si Usas Gemini
1. Abre: https://gemini.google.com
2. Nuevo chat
3. Pega el prompt
4. Espera SQL
5. Copia a Supabase

**Ventajas**: Gratis con Google
**Desventajas**: A veces menos SQL knowledge

### Si Usas Supabase AI (si existe)
1. Supabase Dashboard
2. Busca "AI Assistant" o "Generate SQL"
3. Pega el prompt
4. Click "Generate"
5. Auto-ejecuta en Supabase

**Ventajas**: Una sola plataforma, auto-ejecuta
**Desventajas**: Si está disponible

---

## 🔍 Verificar Que Todo Funcionó

### En Supabase Table Editor

Deberías ver esta estructura:

```
Profiles
├─ user_id (uuid)
├─ email (text)
├─ role (text)
├─ team_name (text)
├─ total_accumulated_points (int8)
├─ total_accumulated_time (int8)
├─ created_at (timestamp)
└─ updated_at (timestamp)

Stations
├─ estacion_id (int8)
├─ estacion_nombre (text)
├─ qr_code_start_hash (text)
├─ qr_code_end_hash (text)
├─ latitude (float8)
├─ longitude (float8)
├─ description (text)
└─ created_at (timestamp)

StationAttempts
├─ registro_id (int8)
├─ user_id (uuid) [FK → Profiles]
├─ estacion_id (int8) [FK → Stations]
├─ start_timestamp (timestamp)
├─ end_timestamp (timestamp)
├─ duration_seconds (int8)
├─ points (int8)
├─ status (text)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TeamLocations
├─ ubicacion_id (int8)
├─ user_id (uuid) [FK → Profiles]
├─ latitude (float8)
├─ longitude (float8)
├─ accuracy (float8)
├─ timestamp (timestamp)
└─ created_at (timestamp)
```

**Si ves esto exacto**: ✅ ¡Perfecto!

---

## 🔐 Verificar RLS Policies

En Supabase, ve a: Profiles → Policies tab

Deberías ver ~10-15 policies como:
- profiles_view_own
- profiles_view_admin
- stations_view_all
- attempts_view_own
- locations_view_admin
- etc.

**Si ves varias policies**: ✅ ¡RLS está configurado!

---

## 📊 Verificar Datos de Ejemplo

Supabase → Table Editor → Profiles

Si la IA generó datos, verás:
```
admin@rally.com       | ADMIN
team1@rally.com       | EQUIPO
team2@rally.com       | EQUIPO
team3@rally.com       | EQUIPO
```

Si no hay datos, puedes agregarlos manualmente:
1. Click "Insert" en Table Editor
2. Llenar campos
3. Click "Save"

---

## 🔑 Obtener Credenciales para .env.local

### En Supabase Dashboard:

1. **Project URL**
   - Settings → API
   - Copiar "Project URL"
   - Ej: `https://abcdefghijklmnop.supabase.co`

2. **Anon Key**
   - Settings → API
   - Copiar "anon public"
   - Ej: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Service Role Key** (para backend)
   - Settings → API
   - Copiar "service_role secret"
   - Ej: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### En .env.local (Frontend)

Crear archivo: `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### En backend/.env (Backend)

Crear archivo: `backend/.env`

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=tu-secret-super-largo-aqui
ENV=development
```

---

## 🧪 Probar Conexión

### Test 1: Frontend

```bash
cd frontend
pnpm dev

# Abre http://localhost:3000
# Debería cargar sin errores
# En browser DevTools (F12), no deberías ver errores de Supabase
```

### Test 2: Backend

```bash
cd backend
python -m uvicorn main:app --reload

# Abre http://localhost:8000/docs
# Debería cargar documentación API
# Testear /health endpoint
```

### Test 3: Login en Frontend

1. Abre http://localhost:3000/login
2. Intenta registrarte con `test@rally.com`
3. Supabase debería crear el usuario automáticamente
4. Profiles table debería tener una nueva fila

**Si ves todo esto**: ✅ ¡Conexión funciona!

---

## 🆘 Troubleshooting

### "Table does not exist"
- Verificar que SQL se ejecutó sin errores
- Ir a Table Editor y refrescar
- Intentar nuevamente: SQL Editor → Run

### "Permission denied on Supabase"
- Usar cuenta del proyecto (no random account)
- Verificar credenciales en .env.local
- Regenerar anon key en Settings → API

### "Cannot find module 'supabase'"
```bash
cd frontend
pnpm install  # Reinstalar
```

### "CORS error"
- Backend necesita CORS configurado
- Verificar main.py tiene CORSMiddleware
- Verificar NEXT_PUBLIC_API_URL correcto

### "Authentication failed"
- Verificar NEXT_PUBLIC_SUPABASE_URL y KEY
- Verificar que son "public" keys, no "secret"
- Refrescar token: Settings → Auth Tokens

---

## 📞 Documentación

Si algo no funciona, consulta:

- **SUPABASE_SETUP.md** - Guía completa manual
- **SUPABASE_AI_PROMPT.md** - El prompt exacto
- **HOW_TO_USE_SUPABASE_PROMPT.md** - Instrucciones detalladas
- **PNPM_SECURITY.md** - Para usar pnpm correctamente
- **FINAL_SETUP.md** - Estado actual del proyecto

---

## ⏱️ Tiempos Estimados

| Tarea | Tiempo |
|-------|--------|
| Generar SQL con IA | 2-3 min |
| Ejecutar en Supabase | 1-2 min |
| Verificar tablas | 2 min |
| Obtener credenciales | 2 min |
| Configurar .env.local | 2 min |
| Probar conexión | 3-5 min |
| **TOTAL** | **15-20 min** |

---

## 🎉 Siguiente Paso

Una vez que la base de datos esté lista:

1. ✅ Base de datos creada
2. ✅ Credenciales copiadas
3. ✅ .env.local configurado
4. ✅ Conexión probada

**Siguiente**: Abre `QUICK_START_AMPLIFY.md` para deployar a AWS

---

**¿Listo? Comienza con SUPABASE_AI_PROMPT.md 🚀**
