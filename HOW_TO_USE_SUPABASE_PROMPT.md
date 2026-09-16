# 📖 Cómo Usar el Prompt de Supabase AI

**Guía paso a paso para generar la base de datos usando IA**

---

## 🎯 3 Opciones para Generar la Base de Datos

### OPCIÓN 1: Supabase AI Assistant (Recomendado si existe)

#### Paso 1: Acceder a Supabase Dashboard

1. Ir a https://app.supabase.com
2. Seleccionar tu proyecto
3. Buscar en la interfaz un botón como:
   - "AI Assistant"
   - "Generate SQL"
   - "Ask AI"
   - O similar

#### Paso 2: Copiar el Prompt

1. Abre: `SUPABASE_AI_PROMPT.md` (en la carpeta del proyecto)
2. Copia la sección que dice:
   ```
   ## 📋 PROMPT COMPLETO
   
   ```
   Copia TODO lo que está entre los ``` (backticks)

#### Paso 3: Pegar en Supabase AI

1. En Supabase AI, pega el prompt
2. Click "Generate" o "Run"
3. Espera a que genere el SQL

#### Paso 4: Ejecutar el SQL

1. El AI te mostrará el SQL generado
2. Click "Execute" o "Run Script"
3. Supabase ejecutará automáticamente

#### Paso 5: Verificar

En Supabase Dashboard → Table Editor, deberías ver:
- ✅ Profiles
- ✅ Stations
- ✅ StationAttempts
- ✅ TeamLocations

---

### OPCIÓN 2: ChatGPT / Claude (Alternativa)

#### Paso 1: Acceder a ChatGPT o Claude

1. https://chat.openai.com (ChatGPT)
2. https://claude.ai (Claude)
3. O cualquier otro LLM

#### Paso 2: Copiar el Prompt Completo

Abre: `SUPABASE_AI_PROMPT.md`

Copia desde:
```
Necesito crear una base de datos completa...
```

Hasta:
```
¿Puedes generar la base de datos completa con todas estas especificaciones?
```

#### Paso 3: Pegar en ChatGPT/Claude

1. Crea un nuevo chat
2. Pega el prompt completo
3. Click "Send"

#### Paso 4: Pedir que genere SQL

Si la IA no genera SQL automáticamente, pide:
```
Genera el SQL completo de PostgreSQL listo para ejecutar en Supabase
```

#### Paso 5: Copiar el SQL Generado

La IA mostrará bloques SQL como:

```sql
CREATE TABLE Profiles (
    ...
);

CREATE TABLE Stations (
    ...
);
```

**Copia TODO el SQL en un archivo .sql o en portapapeles**

---

### OPCIÓN 3: Directamente en Supabase SQL Editor (Manual)

Si prefieres el control total:

#### Paso 1: Abrir SQL Editor

1. Supabase Dashboard
2. SQL Editor (en el sidebar izquierdo)
3. Click "New Query"

#### Paso 2: Usar SUPABASE_SETUP.md

1. Abre: `SUPABASE_SETUP.md`
2. Ve a "Paso 3: Crear Tablas"
3. Copia el SQL completo que ves ahí

#### Paso 3: Pegar en Supabase

1. En el SQL Editor, pega el SQL
2. Click "Run" (botón azul)
3. Espera a que termine

---

## 🔄 Flujo Recomendado

```
┌─────────────────────────────────┐
│ 1. Abre SUPABASE_AI_PROMPT.md   │
└──────────────┬──────────────────┘
               │
     ┌─────────▼─────────┐
     │ Elige una opción: │
     └─────────┬─────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
 Opción1   Opción2    Opción3
 (Si       (Si no     (Manual)
 Supabase  existe
 lo permite) AI)

    │          │          │
    └──────────┼──────────┘
               │
        ┌──────▼──────┐
        │ Copiar      │
        │ Prompt/SQL  │
        └──────┬──────┘
               │
        ┌──────▼──────────┐
        │ Pegar en        │
        │ IA/Supabase     │
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ Generar/        │
        │ Ejecutar        │
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ ✅ Verificar    │
        │ tablas creadas  │
        └─────────────────┘
```

---

## ✅ Verificación: Tablas Creadas

Después de ejecutar, verifica en Supabase:

**Ruta**: Dashboard → Table Editor

Deberías ver estas 4 tablas:

```
📦 Profiles
   ├─ user_id (UUID)
   ├─ email
   ├─ role
   ├─ team_name
   ├─ total_accumulated_points
   ├─ total_accumulated_time
   └─ timestamps

📦 Stations
   ├─ estacion_id
   ├─ estacion_nombre
   ├─ qr_code_start_hash
   ├─ qr_code_end_hash
   ├─ latitude
   ├─ longitude
   └─ description

📦 StationAttempts
   ├─ registro_id
   ├─ user_id (FK)
   ├─ estacion_id (FK)
   ├─ start_timestamp
   ├─ end_timestamp
   ├─ duration_seconds
   ├─ points
   └─ status

📦 TeamLocations
   ├─ ubicacion_id
   ├─ user_id (FK)
   ├─ latitude
   ├─ longitude
   ├─ accuracy
   └─ timestamp
```

---

## 🧪 Test: Verificar RLS

Después de crear tablas, verifica que RLS funciona:

1. **Ve a Policies**
   - Supabase Dashboard → SQL Editor
   - O Supabase Dashboard → Table Editor → Profiles → Policies

2. **Deberías ver policies como**:
   ```
   - profiles_view_own
   - profiles_view_admin
   - profiles_update_own
   - stations_view_all
   - stations_insert_admin
   - attempts_view_own
   - attempts_view_admin
   - locations_view_own
   - locations_view_admin
   ```

3. **Si ves todas**, ✅ RLS está bien configurado

---

## 📊 Verificar Datos de Ejemplo

Si la IA generó datos de ejemplo:

1. Supabase Dashboard → Table Editor
2. Click en "Profiles"
3. Deberías ver filas como:
   ```
   admin@rally.com     | ADMIN
   team1@rally.com     | EQUIPO
   team2@rally.com     | EQUIPO
   team3@rally.com     | EQUIPO
   ```

4. Click en "Stations"
5. Deberías ver:
   ```
   Estación 1 - Salida
   Estación 2 - Control
   Estación 3 - Desafío
   Estación 4 - Meta
   ```

---

## 🆘 Si Algo Falla

### Error: "Syntax error in SQL"
- La IA generó SQL inválido
- **Solución**: Usa SUPABASE_SETUP.md en su lugar (está verificado)

### Error: "Permission denied"
- Necesitas permisos de administrador en Supabase
- **Solución**: Usa la cuenta que creó el proyecto

### Error: "Foreign key constraint"
- Las tablas se crearon en orden incorrecto
- **Solución**: Ejecutar TODO el SQL de una vez (no fragmentado)

### Error: "Table already exists"
- Las tablas ya existen
- **Solución**: 
  ```sql
  -- En SQL Editor, ejecuta esto primero:
  DROP TABLE IF EXISTS TeamLocations CASCADE;
  DROP TABLE IF EXISTS StationAttempts CASCADE;
  DROP TABLE IF EXISTS Stations CASCADE;
  DROP TABLE IF EXISTS Profiles CASCADE;
  
  -- Luego pega el SQL completo de nuevo
  ```

---

## 💾 Guardar el SQL Generado

Es buena idea guardar el SQL que funcionó:

```bash
# Crear archivo
echo "SQL generado" > backend/migrations/000_database_generated.sql

# O simplemente copiar en un editor de texto
# Guardar como: backend/migrations/000_generated_schema.sql
```

Esto es útil para:
- ✅ Documentación
- ✅ Reproducibilidad
- ✅ Backup

---

## 📋 Próximos Pasos

Una vez que las tablas estén creadas:

1. **Obtener credenciales Supabase**
   - Settings → API
   - Copiar URL y keys

2. **Crear .env.local**
   - En carpeta `frontend/`
   - Pegar las credenciales

3. **Conectar Next.js**
   - `pnpm install`
   - `pnpm dev`
   - Debería conectar automáticamente

4. **Verificar conexión**
   - Abrir http://localhost:3000
   - Intentar login
   - Deberías poder autenticarse

---

## 🎯 Resumen Rápido

```
┌──────────────────────────────────────┐
│ 1. Abre SUPABASE_AI_PROMPT.md        │
│    (en la carpeta del proyecto)      │
├──────────────────────────────────────┤
│ 2. Elige una opción (1, 2 o 3)       │
├──────────────────────────────────────┤
│ 3. Copia el prompt o SQL             │
├──────────────────────────────────────┤
│ 4. Pega en IA o Supabase             │
├──────────────────────────────────────┤
│ 5. Genera/Ejecuta                    │
├──────────────────────────────────────┤
│ 6. Verifica tablas en Table Editor   │
├──────────────────────────────────────┤
│ 7. Obtén credenciales (Settings)     │
├──────────────────────────────────────┤
│ 8. Configura .env.local              │
├──────────────────────────────────────┤
│ ✅ Base de datos lista               │
└──────────────────────────────────────┘
```

---

## 📖 Documentos Relacionados

- **SUPABASE_AI_PROMPT.md** ← El prompt para la IA
- **SUPABASE_SETUP.md** ← Guía manual si prefieres
- **PNPM_SECURITY.md** ← Para instalar dependencias
- **FINAL_SETUP.md** ← Estado actual del proyecto

---

**Tiempo estimado**: 5-15 minutos (depende de cuál opción uses)

**Siguiente**: Una vez hecho, abre `QUICK_START_AMPLIFY.md` para deploy 🚀
