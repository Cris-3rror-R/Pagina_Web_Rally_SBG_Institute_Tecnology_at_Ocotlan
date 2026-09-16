# 📦 Base de Datos - Rally Competition Platform

**Cómo generar la base de datos Supabase usando IA**

---

## ⚡ Ruta Rápida (5 min)

```
1. Abre: SUPABASE_AI_PROMPT.md
2. Copia: El prompt completo
3. Pega: En ChatGPT, Claude, o Gemini
4. Obtén: El SQL generado
5. Ejecuta: En Supabase SQL Editor
6. ✅ Listo!
```

---

## 📖 Documentos Disponibles

### 1. **SUPABASE_AI_PROMPT.md** ← COMIENZA AQUÍ
   - Prompt completo listo para IA
   - Especificaciones exactas del proyecto
   - Qué debería generar la IA

### 2. **HOW_TO_USE_SUPABASE_PROMPT.md**
   - Guía paso a paso para usar el prompt
   - 3 opciones diferentes
   - Troubleshooting

### 3. **SUPABASE_INSTRUCTIONS.md**
   - Instrucciones resumidas
   - Checklist de verificación
   - Cómo obtener credenciales

### 4. **SUPABASE_SETUP.md**
   - Guía manual (sin IA)
   - SQL directo para copiar/pegar
   - Para si prefieres control total

---

## 🤖 Qué Hace la IA

Cuando le das el prompt, la IA generará:

```sql
-- 1. CREAR 4 TABLAS
CREATE TABLE Profiles (...)
CREATE TABLE Stations (...)
CREATE TABLE StationAttempts (...)
CREATE TABLE TeamLocations (...)

-- 2. CREAR ÍNDICES (para performance)
CREATE INDEX idx_profiles_role ON Profiles(role)
...

-- 3. ACTIVAR SEGURIDAD (RLS)
ALTER TABLE Profiles ENABLE ROW LEVEL SECURITY
...

-- 4. CREAR POLICIES (control de acceso)
CREATE POLICY profiles_view_own ON Profiles ...
...

-- 5. CREAR TRIGGERS (automáticos)
CREATE TRIGGER update_profiles_updated_at ...
...

-- 6. DATOS DE EJEMPLO (opcional)
INSERT INTO Profiles VALUES (...)
INSERT INTO Stations VALUES (...)
...
```

Todo listo para ejecutar. ✅

---

## 🎯 3 Opciones para Generar

### Opción 1: ChatGPT (Más fácil)
```
1. https://chat.openai.com
2. Copia prompt de SUPABASE_AI_PROMPT.md
3. Pega y envía
4. Copia el SQL resultante
5. Pega en Supabase SQL Editor
```

### Opción 2: Claude (Muy preciso)
```
1. https://claude.ai
2. Copia prompt
3. Pega y envía
4. Copia SQL
5. Pega en Supabase
```

### Opción 3: Manual (Control total)
```
1. Abre SUPABASE_SETUP.md
2. Copia el SQL directo
3. Pega en Supabase SQL Editor
4. Ejecuta
```

---

## 📋 Lo Que Se Crea

### 4 Tablas Principales

```
1. PROFILES
   └─ Usuarios y equipos
   └─ Roles: ADMIN, EQUIPO
   └─ Puntuación acumulada

2. STATIONS
   └─ Estaciones del rally
   └─ Códigos QR inicio/fin
   └─ GPS coordinates

3. STATION_ATTEMPTS
   └─ Intentos de los equipos
   └─ Tiempos y puntos
   └─ Estado en progreso

4. TEAM_LOCATIONS
   └─ Ubicación GPS en vivo
   └─ Timestamp de actualización
   └─ Precisión del GPS
```

### Características Incluidas

✅ **Foreign Keys** - Relaciones entre tablas
✅ **Índices** - Optimización de performance
✅ **RLS Policies** - Seguridad basada en roles
✅ **Triggers** - Campos automáticos (updated_at)
✅ **Validaciones** - Constraints en datos
✅ **Timestamps** - Auditoría de cambios
✅ **Datos de Ejemplo** - Para testing

---

## 🚀 Paso a Paso

### 1. Copiar Prompt
```
Archivo: SUPABASE_AI_PROMPT.md
Sección: "PROMPT COMPLETO"
Entre los ``` (backticks)
```

### 2. Elegir IA
- ChatGPT → https://chat.openai.com
- Claude → https://claude.ai
- Gemini → https://gemini.google.com
- Otra IA que prefieras

### 3. Pegar y Generar
```
1. Copia el prompt
2. Lo pega en la IA
3. Click "Send" o "Generate"
4. Espera el SQL
```

### 4. Copiar SQL Resultante
```
La IA mostrará bloques SQL
Cópialos TODO en portapapeles
```

### 5. Ejecutar en Supabase
```
1. https://app.supabase.com
2. Selecciona tu proyecto
3. SQL Editor → New Query
4. Pega el SQL
5. Click "Run"
6. Espera a que termine
```

### 6. Verificar en Table Editor
```
Dashboard → Table Editor
¿Ves las 4 tablas? ✅ Listo!
```

---

## ✅ Verificación

Después de ejecutar, verifica:

**En Table Editor** (Dashboard → Table Editor):
- [ ] Tabla "Profiles" existe
- [ ] Tabla "Stations" existe
- [ ] Tabla "StationAttempts" existe
- [ ] Tabla "TeamLocations" existe

**En Policies** (Profiles → Policies tab):
- [ ] Hay varias policies (5-10)
- [ ] Incluyen SELECT, INSERT, UPDATE, DELETE

**En Data** (Profiles → Data):
- [ ] Hay usuarios de ejemplo
- [ ] Incluye admin@rally.com (ADMIN)
- [ ] Incluye team1/2/3@rally.com (EQUIPO)

---

## 🔑 Credenciales Después

Una vez que la BD esté lista, obtén:

**En Settings → API**:
1. **Project URL** → Variable: `NEXT_PUBLIC_SUPABASE_URL`
2. **Anon Key** → Variable: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Service Key** → Variable: `SUPABASE_KEY` (backend)

Crear archivo: `frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 Test Rápido

Verificar que funciona:

```bash
# Terminal 1 - Frontend
cd frontend
pnpm dev
# Abre http://localhost:3000

# Terminal 2 - Backend
cd backend
python -m uvicorn main:app --reload
# Abre http://localhost:8000/docs

# En frontend, intenta:
# 1. Ir a /login
# 2. Registrarte con un email
# 3. Supabase debería crear usuario automáticamente
```

Si ves usuario creado en Supabase → ✅ Funcionando!

---

## 📚 Documentación Completa

Para más detalles, consulta:

1. **SUPABASE_AI_PROMPT.md** - Prompt exacto
2. **HOW_TO_USE_SUPABASE_PROMPT.md** - Instrucciones detalladas
3. **SUPABASE_INSTRUCTIONS.md** - Checklist y verification
4. **SUPABASE_SETUP.md** - Guía manual completa

---

## ⏱️ Tiempo Total

| Paso | Tiempo |
|------|--------|
| Copiar prompt | 1 min |
| Generar SQL en IA | 2-3 min |
| Ejecutar en Supabase | 1-2 min |
| Verificar tablas | 2 min |
| Obtener credenciales | 2 min |
| Configurar .env.local | 2 min |
| **TOTAL** | **~15 min** |

---

## 🎯 Próximo Paso

Una vez que la base de datos esté lista:

1. ✅ Base de datos creada
2. ✅ .env.local configurado
3. ✅ Credenciales guardadas

**Siguiente**: `QUICK_START_AMPLIFY.md` para deployar a AWS ☁️

---

## 🆘 Problemas?

Si algo falla:

1. **Error en SQL** → Usa `SUPABASE_SETUP.md` (SQL verificado)
2. **Tablas no aparecen** → Refrescar page o reintentar
3. **Auth error** → Verificar credenciales en .env.local
4. **CORS error** → Verificar backend tiene CORS

Consulta: `HOW_TO_USE_SUPABASE_PROMPT.md` → Troubleshooting

---

**Ready? Abre: SUPABASE_AI_PROMPT.md 🚀**
