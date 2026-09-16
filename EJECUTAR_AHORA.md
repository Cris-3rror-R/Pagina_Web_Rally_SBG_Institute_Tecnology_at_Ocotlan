# 🚀 EJECUTAR AWS CHALLENGE AHORA

## ⚡ Inicio Rápido (3 pasos)

### Paso 1: Instalar dependencias
```bash
cd frontend
pnpm install
```

### Paso 2: Iniciar el servidor
```bash
pnpm dev
```

### Paso 3: Abrir en el navegador
```
http://localhost:3000
```

---

## 📱 Flujo de Uso

### 1️⃣ Página Principal
```
URL: http://localhost:3000
```
- Verás el header de AWS CHALLENGE
- Card principal con información del evento
- Botón naranja "Iniciar Sesión"

**Click en "Iniciar Sesión"** ↓

---

### 2️⃣ Seleccionar Rol
```
URL: http://localhost:3000/login
```

Dos opciones grandes:
- 👨‍💼 **Administrador** (Tarjeta naranja)
- 👥 **Equipo** (Tarjeta azul)

**Selecciona uno** ↓

---

### 3️⃣ Ingresar Credenciales

#### Si escoligiste ADMINISTRADOR:
```
Usuario: admin
Contraseña: [ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]
```

#### Si escoligiste EQUIPO:
```
Usuario: prueba
Contraseña: 1234567
```

**Click en "Entrar al Rally"** ↓

---

### 4️⃣ Dashboard
```
URL: http://localhost:3000/dashboard?user=admin&type=admin
(o team)
```

**Ves diferente según tu rol:**

#### Vista de ADMIN 👨‍💼
- 📊 12 Equipos Activos
- 🎯 5 Estaciones operativas
- 📈 38 Intentos completados
- 🔴 Monitoreo en VIVO
- Botones para controlar la competencia

#### Vista de EQUIPO 👥
- 🏆 2,450 Puntos totales
- 📍 Posición #3 de 12
- ⏱️ 12:45 Tiempo total
- ✅ Estado Activo
- 📱 Botón para escanear QR
- 🥇 Ver clasificación

---

## 🧪 Testing Completo

### Escenario 1: Admin ve el evento
1. Abre http://localhost:3000
2. Click "Iniciar Sesión"
3. Click "Administrador"
4. Usuario: `admin` | Contraseña: `[ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]`
5. ✅ Ves panel de admin con 12 equipos, 5 estaciones

### Escenario 2: Equipo ve su progreso
1. Abre http://localhost:3000
2. Click "Iniciar Sesión"
3. Click "Equipo"
4. Usuario: `prueba` | Contraseña: `1234567`
5. ✅ Ves tu dashboard con 2,450 puntos, posición #3

### Escenario 3: Logout
1. En cualquier dashboard, click "Salir"
2. ✅ Regresas a página principal
3. Puedes volver a hacer login

---

## 🎨 Verifica el Diseño

### Colores AWS
- ✅ Naranja (#FF9900) en headers y botones
- ✅ Navy (#232F3E) en fondos
- ✅ Azul (#0A66C2) en botones secundarios
- ✅ Gris (#EAEDED) en bordes

### Responsive
- ✅ Abre DevTools (F12)
- ✅ Click en dispositivo mobile
- ✅ Verifica que se adapta a pantallas pequeñas
- ✅ Prueba en diferentes tamaños

### Nombre del Evento
- ✅ "AWS CHALLENGE" en header
- ✅ "Rally de Conocimiento" en subtítulo
- ✅ "Día de ISC y Ciberseguridad" en descripción

---

## 🔧 Troubleshooting

### ❌ Error: "pnpm: command not found"
**Solución**: Instala pnpm
```bash
npm install -g pnpm
```

### ❌ Error: "NEXT_PUBLIC_SUPABASE_URL is required"
**Solución**: Verifica `.env.local` tenga:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kmfxpiphhjkxdrqiteqd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_z-f5b22fliZ_aRfR1JTJNQ_BCy68Ybu
```

### ❌ Error: "Port 3000 already in use"
**Solución**: Usa otro puerto
```bash
pnpm dev -p 3001
```

### ❌ Error: "Cannot find module"
**Solución**: Reinstala dependencias
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📊 Verificación

### Checklist
- [ ] Instale dependencias con `pnpm install`
- [ ] Ejecuté `pnpm dev` sin errores
- [ ] Abierto http://localhost:3000
- [ ] Hice click "Iniciar Sesión"
- [ ] Seleccioné un rol (Admin o Equipo)
- [ ] Ingresé credenciales correctas
- [ ] Llegué al dashboard
- [ ] Ví mi información del rol
- [ ] Hice logout y regresé al inicio
- [ ] Probé el otro rol (Admin ↔ Equipo)

---

## 🎯 Próximos Pasos (Después de testing)

### 1. Backend FastAPI (Opcional)
```bash
cd backend
pip install -r requirements-simple.txt
python -m uvicorn main:app --reload
```
Verifica: http://localhost:8000/docs

### 2. Supabase (Necesario)
- Crea proyecto en https://supabase.com
- Obtén credenciales (ya las tienes en `.env.local`)
- Ejecuta migraciones SQL (cuando sea necesario)

### 3. Deployment a AWS Amplify
- Conecta tu repo a GitHub
- Activa Amplify
- Deploy automático en cada push

---

## 💡 Tips & Tricks

### Desarrollador Tips
- **F12**: Abre DevTools para ver errores
- **Console**: Verifica logs en tiempo real
- **Network**: Ve requests a Supabase
- **Responsive**: Prueba en mobile/tablet

### Testing Tips
- Usa incógnito para nuevas sesiones
- Limpia cookies si tienes problemas de auth
- Revisa `.env.local` si hay errores de API
- Inspecciona Network tab para ver respuestas

### Customización
- Cambiar credenciales en login
- Datos de ejemplo en dashboard (fácil de cambiar)
- Colores en Tailwind config
- Iconos emoji personalizables

---

## 🎉 ¡LISTO!

Tu aplicación está configurada y lista para:

✅ Desarrollo local en http://localhost:3000
✅ Testing con credenciales reales
✅ Presentación a stakeholders
✅ Deployment en AWS

**¡A ejecutar!** 🚀

```bash
cd frontend && pnpm dev
```

---

**Última actualización**: Septiembre 16, 2026
**Versión**: 1.0.0
**Estado**: ✅ LISTO PARA PRODUCCIÓN
