# 🔐 Configuración de Autenticación - Rally Competition Platform

**Credenciales de prueba y setup**

---

## 👥 Usuarios de Prueba

### 1. Usuario Admin

```
Email/Usuario: admin
Contraseña: 1_Ch0col4t3__3t4Arf1shmi
Rol: ADMIN
Descripción: Acceso completo a panel administrativo

Permisos:
├─ Ver dashboard administrativo
├─ Gestionar estaciones
├─ Ver todas las ubicaciones
├─ Ver clasificación completa
├─ Editar usuarios
└─ Ver reportes
```

### 2. Usuario Regular (Equipo)

```
Email/Usuario: prueba
Contraseña: 1234567
Rol: EQUIPO
Descripción: Acceso básico para equipos

Permisos:
├─ Escanear códigos QR
├─ Ver su propia clasificación
├─ Enviar ubicación GPS
├─ Ver leaderboard
└─ Editar su perfil
```

---

## 🔑 Cómo Crear Usuarios en Supabase

### Opción 1: Usando Supabase UI (Recomendado)

1. **Supabase Dashboard**
   ```
   → Authentication
   → Users
   → Add user
   ```

2. **Rellenar formulario**
   ```
   Email: admin
   Password: 1_Ch0col4t3__3t4Arf1shmi
   Click: Create user
   ```

3. **Crear perfil asociado**
   ```
   SQL Editor → New Query
   
   INSERT INTO Profiles (user_id, email, role, team_name)
   SELECT id, email, 'ADMIN', 'Admin Team'
   FROM auth.users
   WHERE email = 'admin'
   ON CONFLICT (user_id) DO NOTHING;
   ```

### Opción 2: SQL directo

```sql
-- Usuario Admin
INSERT INTO Profiles (user_id, email, role, team_name, total_accumulated_points, total_accumulated_time)
SELECT id, email, 'ADMIN', 'Admin Team', 0, 0
FROM auth.users
WHERE email = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- Usuario Prueba (Equipo)
INSERT INTO Profiles (user_id, email, role, team_name, total_accumulated_points, total_accumulated_time)
SELECT id, email, 'EQUIPO', 'Team Prueba', 0, 0
FROM auth.users
WHERE email = 'prueba'
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🔑 Almacenamiento Seguro de Contraseñas

### NO hacer:

```
❌ Guardar contraseñas en variables de entorno
❌ Guardar contraseñas en .env files
❌ Compartir contraseñas en chats
❌ Usar contraseñas débiles en producción
```

### SÍ hacer:

```
✅ Usar Supabase Auth (maneja hash automático)
✅ Usar contraseñas fuertes en producción
✅ Guardar credenciales en gestor de secretos
✅ Usar JWT tokens (Supabase genera automático)
✅ HTTPS en producción (AWS Amplify lo proporciona)
```

---

## 🎫 JWT Tokens

### Cómo funciona

```
1. Usuario ingresa credenciales
   └─ admin / 1_Ch0col4t3__3t4Arf1shmi

2. Supabase verifica
   └─ ✓ Credenciales correctas

3. Supabase genera JWT
   └─ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

4. Frontend almacena en session
   └─ (Supabase lo hace automático)

5. Cada request incluye JWT
   └─ Authorization: Bearer <JWT>

6. Backend verifica JWT
   └─ ✓ Token válido → Permite acceso
   └─ ✗ Token inválido → 401 Unauthorized
```

### Expiración

```
Access Token: ~1 hora
Refresh Token: ~7 días

Si access token expira:
└─ Frontend usa refresh token
└─ Obtiene nuevo access token
└─ Session continúa (transparente)
```

---

## 🔐 RLS Policies (Row-Level Security)

### Cómo funciona en Supabase

```
Tabla: Profiles

RLS Policy: profiles_view_own
├─ SELECT WHERE auth.uid() = user_id
├─ Solo ves tu propio perfil
└─ EQUIPO no ve otros equipos

RLS Policy: profiles_view_admin  
├─ SELECT WHERE role = 'ADMIN'
├─ Admin ve todos
└─ Verifica si eres ADMIN

RLS Policy: profiles_update_own
├─ UPDATE WHERE auth.uid() = user_id
├─ Solo actualizas tu perfil
└─ No puedes cambiar tu role
```

### Por tabla

```
Profiles:
└─ EQUIPO: Ve solo su perfil
└─ ADMIN: Ve todos los perfiles

Stations:
└─ EQUIPO: Ve todas (públicas)
└─ ADMIN: Ve y puede editar

StationAttempts:
└─ EQUIPO: Ve solo sus intentos
└─ ADMIN: Ve todos

TeamLocations:
└─ EQUIPO: Ve solo su ubicación
└─ ADMIN: Ve todas
```

---

## 🌐 Flow de Autenticación Frontend

### 1. Login Page

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/auth/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Login con Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      // Obtener perfil
      const { data: profile } = await supabase
        .from('Profiles')
        .select('role, team_name')
        .eq('user_id', data.user.id)
        .single()

      // Guardar rol en sessionStorage
      if (profile) {
        sessionStorage.setItem('userRole', profile.role)
        sessionStorage.setItem('teamName', profile.team_name)
      }

      // Redirigir según rol
      if (profile?.role === 'ADMIN') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aws-navy to-aws-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* AWS Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-aws-orange mb-2">
            Rally Competition Platform
          </h1>
          <p className="text-white/80">AWS SBG</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-aws-error/10 border border-aws-error text-aws-error p-4 rounded mb-6">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-aws-navy mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-aws-orange focus:ring-2 focus:ring-aws-orange/20"
              placeholder="admin o prueba"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-aws-navy mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-aws-orange focus:ring-2 focus:ring-aws-orange/20"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-aws-orange hover:bg-aws-orange/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Test Credentials */}
        <div className="mt-8 bg-aws-light rounded-lg p-4">
          <p className="text-sm text-aws-navy font-semibold mb-2">
            Credenciales de Prueba:
          </p>
          <p className="text-xs text-aws-navy/70 mb-1">
            Admin: admin / 1_Ch0col4t3__3t4Arf1shmi
          </p>
          <p className="text-xs text-aws-navy/70">
            Equipo: prueba / 1234567
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 🛡️ Seguridad en Producción

### Antes de Desplegar

```
☐ Cambiar credenciales de test
☐ Generar nuevas contraseñas fuertes
☐ Habilitar HTTPS (AWS Amplify)
☐ Configurar CORS correcto
☐ Habilitar email verification
☐ Configurar password reset
☐ Auditar RLS policies
☐ Revisar JWT secrets
☐ Configurar rate limiting
☐ Configurar WAF (AWS WAF)
```

### Contraseñas Fuertes (Producción)

```
Requisitos:
├─ Mínimo 12 caracteres
├─ Uppercase + lowercase
├─ Números
├─ Caracteres especiales
├─ No reutilizar
└─ Cambiar cada 90 días

Generar con:
├─ 1password.com/password-generator
├─ bitwarden.com
├─ O comando: openssl rand -base64 32
```

---

## 🔄 Reset de Contraseña

### Flujo

```
1. Usuario olvida contraseña
   ↓
2. Click "Olvidé contraseña"
   ↓
3. Ingresa email
   ↓
4. Supabase envía email reset
   ↓
5. Usuario click link en email
   ↓
6. Abre página reset
   ↓
7. Ingresa nueva contraseña
   ↓
8. ✓ Contraseña actualizada
```

### Implementación

```typescript
// Solicitar reset
const { error } = await supabase.auth.resetPasswordForEmail(email)

// Actualizar contraseña (después de link)
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

---

## 👤 Sesión del Usuario

### Obtener Usuario Actual

```typescript
// app/hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      // Obtener usuario autenticado
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      // Obtener perfil
      if (data.user) {
        const { data: profileData } = await supabase
          .from('Profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        setProfile(profileData)
      }

      setLoading(false)
    }

    getUser()
  }, [])

  return { user, profile, loading }
}
```

### Usar en Componente

```typescript
'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function Dashboard() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div>Cargando...</div>
  if (!user) return <div>No autenticado</div>

  return (
    <div>
      <h1>Bienvenido, {profile?.team_name}</h1>
      <p>Rol: {profile?.role}</p>
    </div>
  )
}
```

---

## 🚀 Testing de Autenticación

### Test en Desarrollo

```bash
# 1. Iniciar app
cd frontend
pnpm dev

# 2. Ir a http://localhost:3000/login

# 3. Probar con credenciales
Usuario: admin
Contraseña: 1_Ch0col4t3__3t4Arf1shmi

# 4. Verificar redirección a /admin

# 5. Probar con equipo
Usuario: prueba
Contraseña: 1234567

# 6. Verificar redirección a /dashboard

# 7. Verificar en DevTools
# F12 → Application → Cookies
# Deberías ver: sb-auth-token

# 8. Verificar JWT en localStorage
# F12 → Application → Local Storage
# Clave: sb-<project-id>-auth-token
```

---

## 📊 Monitoreo de Autenticación

### En Supabase Dashboard

```
Authentication → Logs
├─ Ver intentos de login
├─ Ver errores de autenticación
├─ Revisar intentos fallidos
└─ Monitoreo en tiempo real
```

### Alertas Recomendadas

```
☐ Múltiples intentos fallidos
☐ Login desde ubicación nueva
☐ Cambio de contraseña
☐ Acceso denegado (permisos)
└─ Configurar en AWS CloudWatch
```

---

## 🔗 Referencias

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [JWT Explanation](https://jwt.io)
- [OWASP Auth](https://owasp.org/www-community/attacks/authentication_cheat_sheet)
- [AWS Security](https://aws.amazon.com/security/best-practices/)

---

**Autenticación segura y basada en roles. Credenciales de prueba listas.** 🔐
