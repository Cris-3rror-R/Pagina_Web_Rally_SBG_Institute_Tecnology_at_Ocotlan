# 🎨 Especificaciones de Diseño - Rally Competition Platform

**Branding, Colores y Requerimientos de UI/UX**

---

## 🏢 Información General

- **Marca**: AWS SBG (Amazon Sports Business Group)
- **Tema**: Competencia de Rally en tiempo real
- **Plataforma**: Web responsiva (móvil + desktop)
- **Colores**: Paleta AWS SBG

---

## 🎯 Credenciales de Prueba

### Usuario Admin
```
Usuario: admin
Contraseña: [ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]
Rol: ADMIN
Acceso: Panel de control completo
```

### Usuario Regular (Equipo)
```
Usuario: prueba
Contraseña: [TEAM_PASSWORD_CONFIGURED_IN_SUPABASE]
Rol: EQUIPO
Acceso: Escaneo QR, GPS, clasificación
```

---

## 🎨 Colores AWS SBG

### Paleta Principal

```
PRIMARY (Azul AWS):
  HEX: #FF9900 (Naranja)
  RGB: 255, 153, 0
  HSL: 39, 100%, 50%
  Uso: Botones principales, highlights, CTAs

SECONDARY (Azul Oscuro):
  HEX: #232F3E (Navy)
  RGB: 35, 47, 62
  HSL: 213, 28%, 19%
  Uso: Headers, sidebars, backgrounds principales

ACCENT (Azul Claro):
  HEX: #0A66C2 (LinkedIn Blue / AWS)
  RGB: 10, 102, 194
  HSL: 209, 94%, 40%
  Uso: Links, accents, hover states

BACKGROUND (Gris Claro):
  HEX: #EAEDED (Light Gray)
  RGB: 234, 237, 237
  HSL: 150, 8%, 92%
  Uso: Background general

DARK TEXT:
  HEX: #232F3E (Navy)
  RGB: 35, 47, 62
  Uso: Texto principal

LIGHT TEXT:
  HEX: #FFFFFF (White)
  RGB: 255, 255, 255
  Uso: Texto sobre fondos oscuros
```

### Colores Secundarios

```
SUCCESS (Verde):
  HEX: #28A745
  Uso: Escaneo exitoso, puntos ganados

WARNING (Amarillo):
  HEX: #FFC107
  Uso: Advertencias, intentos en progreso

ERROR (Rojo):
  HEX: #DC3545
  Uso: Errores, escaneo inválido

INFO (Azul):
  HEX: #17A2B8
  Uso: Información, notificaciones
```

---

## 📱 Responsividad

### Breakpoints (Tailwind CSS)

```
Mobile (xs):      0px - 640px
Tablet (sm):      640px - 768px
Small (md):       768px - 1024px
Medium (lg):      1024px - 1280px
Large (xl):       1280px - 1536px
Extra Large (2xl):1536px+
```

### Estrategia Mobile-First

```
1. Diseñar para móvil primero
2. Expandir a tablet
3. Optimizar para desktop
4. Touch targets: mínimo 44px x 44px
5. Pantalla vertical y horizontal
```

---

## 🎯 Componentes de Diseño

### 1. Header/Navbar
```
Desktop:
├─ Logo AWS SBG (izquierda)
├─ Navegación (centro)
│  ├─ Dashboard
│  ├─ Estaciones
│  ├─ Clasificación
│  └─ Admin (si es admin)
└─ Perfil/Logout (derecha)

Mobile:
├─ Hamburger menu
├─ Logo AWS SBG (centro)
└─ Avatar/Logout (derecha)

Colores:
├─ Background: #232F3E (Navy)
├─ Texto: #FFFFFF (White)
└─ Hover: #FF9900 (Orange highlight)
```

### 2. Botones
```
Primary Button:
├─ Background: #FF9900 (Naranja)
├─ Text: #FFFFFF
├─ Hover: #E08E00 (Naranja oscuro)
├─ Padding: 12px 24px
└─ Border-radius: 8px

Secondary Button:
├─ Background: #0A66C2 (Azul)
├─ Text: #FFFFFF
├─ Hover: #0850A0
├─ Padding: 12px 24px
└─ Border-radius: 8px

Ghost Button:
├─ Background: transparent
├─ Border: 2px #232F3E
├─ Text: #232F3E
├─ Hover: Background #F0F0F0
└─ Border-radius: 8px

Danger Button:
├─ Background: #DC3545
├─ Text: #FFFFFF
├─ Hover: #C82333
└─ Border-radius: 8px
```

### 3. Cards
```
├─ Background: #FFFFFF
├─ Border: 1px #D3D3D3
├─ Border-radius: 12px
├─ Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
├─ Padding: 20px
└─ Hover-shadow: 0 4px 16px rgba(0,0,0,0.15)
```

### 4. Inputs
```
├─ Background: #FFFFFF
├─ Border: 1px #D3D3D3
├─ Border-radius: 8px
├─ Padding: 12px 16px
├─ Focus-border: 2px #FF9900
├─ Focus-box-shadow: 0 0 0 4px rgba(255,153,0,0.1)
└─ Font-size: 16px (evita zoom en móvil)
```

### 5. QR Scanner
```
Desktop:
├─ Modal/Overlay: 80% width
├─ Camera: 100% ancho modal
├─ Botones: Debajo de cámara
└─ Size: max 500px width

Mobile:
├─ Fullscreen
├─ Camera: Full viewport
├─ Botones: Fixed bottom
└─ Safe area consideration (notch)

Colores:
├─ Overlay: rgba(0,0,0,0.8)
├─ Button background: #FF9900
├─ Button text: #FFFFFF
└─ Focus ring: #0A66C2
```

### 6. Clasificación/Leaderboard
```
Desktop:
├─ Tabla: 100% width
├─ Columns: Rank | Team | Points | Time
├─ Rows: Hover background #F5F5F5
└─ Top 3: Gold/Silver/Bronze badges

Mobile:
├─ Cards apiladas (vertical)
├─ Rank grande (izquierda)
├─ Team + Points (centro)
├─ Time (derecha)
└─ Deslizable horizontalmente si es necesario
```

### 7. Mapa (Desktop)
```
├─ Height: 60vh (viewport height)
├─ Width: 100%
├─ Border: 1px #D3D3D3
├─ Border-radius: 8px
├─ Markers: Azul para equipo actual, naranja para otros
└─ No mostrar en móvil (demasiado pequeño)
```

---

## 📋 Página por Página

### 1. Página de Login
```
Desktop:
├─ Layout: 2 columnas
│  ├─ Izquierda: Branding/Info
│  └─ Derecha: Formulario
├─ Form width: max 400px
└─ Centered en página

Mobile:
├─ Full width
├─ Padding: 20px
├─ Form fields: 100% width
└─ Stacked vertical

Campos:
├─ Usuario (email)
├─ Contraseña
├─ Remember me (checkbox)
├─ Login button
└─ Link a registro

Branding:
├─ Logo AWS SBG (grande)
├─ Tagline: "Rally Competition Platform"
└─ Colores: #232F3E background, #FF9900 accents
```

### 2. Dashboard (Equipo)
```
Desktop:
├─ Grid layout
├─ Col 1: Card estado actual
├─ Col 2: Próxima estación
├─ Col 3: Puntuación
├─ Full width: Clasificación
└─ Full width: Últimos intentos

Mobile:
├─ Cards apiladas
├─ Uno a uno
├─ Scrollable vertical
└─ Bottom: Floating action button (QR scan)

Elementos:
├─ Welcome message
├─ Current status
├─ Points total
├─ Time total
├─ Last 3 attempts
├─ Leaderboard preview (top 5)
└─ QR scan button (CTA prominente)
```

### 3. Scanner QR
```
Desktop:
├─ Modal overlay
├─ Camera feed: 100% modal width
├─ Buttons below
├─ Back/Close button
└─ Show detected QR text (debug mode)

Mobile:
├─ Fullscreen
├─ Camera: full viewport
├─ Buttons: Fixed bottom
├─ Safe area: Considerar notch
└─ Vibration on scan (haptic feedback)

Estados:
├─ Ready: "Apunta a un código QR"
├─ Scanning: "Escaneando..."
├─ Success: "✓ Código leído!" (verde)
├─ Error: "✗ Código inválido" (rojo)
└─ Processing: "Procesando..." (loading)
```

### 4. Leaderboard (Global)
```
Desktop:
├─ Tabla completa
├─ Columns: Rank | Team | Points | Time | Status
├─ Sortable columns
├─ Highlight current user
├─ Refresh button
└─ Auto-refresh cada 10s (real-time)

Mobile:
├─ Card list
├─ Rank: Grande a la izquierda
├─ Team info: Centro
├─ Points: Derecha
├─ Swipe para ver más info
└─ Pull-to-refresh

Top 3 Styling:
├─ Rank 1: 🥇 Gold background
├─ Rank 2: 🥈 Silver background
├─ Rank 3: 🥉 Bronze background
└─ Rest: Standard styling
```

### 5. Mapa en Vivo (Admin)
```
Desktop:
├─ Fullscreen map (Leaflet)
├─ Markers: Posición de equipos
├─ Colors:
│  ├─ Blue: Equipo actual (admin)
│  ├─ Orange: Otros equipos
│  └─ Green: Estaciones
├─ Popup on marker click
└─ Zoom controls

Mobile:
├─ Map 100% width
├─ Height: 60vh
├─ Markers smaller
├─ Touch controls
└─ Info sidebar: Aparece abajo o lateral

Updates:
├─ Real-time (cada 10s)
├─ Smooth transitions
└─ Connected status indicator
```

### 6. Panel Admin
```
Desktop:
├─ Sidebar: Navegación (izquierda)
├─ Main content: Area principal
├─ Sections:
│  ├─ Dashboard (stats)
│  ├─ Gestionar estaciones
│  ├─ Ver leaderboard
│  ├─ Mapa en vivo
│  └─ Reportes

Mobile:
├─ Hamburger menu
├─ Main content full width
├─ Sections: Tabs en top
└─ Stats: Cards horizontales

Stats Cards:
├─ Total equipos
├─ Equipos activos
├─ Total puntos
├─ Tiempo promedio
└─ Estaciones disponibles
```

---

## 🎨 Tipografía

### Fuentes

```
Primary Font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Mono Font: "JetBrains Mono", monospace (para códigos QR, debugging)

Tamaños (rem):
├─ H1: 2.5rem (40px) - Títulos principales
├─ H2: 2rem (32px) - Subtítulos
├─ H3: 1.5rem (24px) - Secciones
├─ H4: 1.25rem (20px) - Subsecciones
├─ Body: 1rem (16px) - Texto general
├─ Small: 0.875rem (14px) - Labels, hints
├─ Tiny: 0.75rem (12px) - Metadata
└─ Button: 1rem (16px) - En botones

Pesos:
├─ Headings: 600-700 (semibold-bold)
├─ Body: 400-500 (regular-medium)
└─ Accents: 600 (semibold)
```

---

## 📐 Espaciado (Tailwind Scale)

```
8px (1 unit)
16px (2 units) - padding standard
24px (3 units) - gaps entre secciones
32px (4 units) - gaps grandes
48px (6 units) - between major sections
64px (8 units) - padding arriba/abajo de páginas
```

---

## 🎬 Animaciones

### Transiciones

```
Quick: 150ms (hover, focus)
Normal: 300ms (opens, closes)
Slow: 500ms (page transitions)

Easing: cubic-bezier(0.4, 0, 0.2, 1)
        (Material Design standard)
```

### Efectos

```
Button hover: Scale 1.05 + shadow increase
Card hover: Elevation increase (shadow)
Loading: Spinner (CSS animation)
Success: Green checkmark + fadeIn
Error: Red X + shake animation
QR scan: Flash effect
```

---

## 📊 Iconografía

### Fuentes de Iconos

```
Usar: Heroicons, Lucide Icons, o Font Awesome

Tamaños:
├─ Nav icons: 24px
├─ Buttons: 20px
├─ Inline: 16px
└─ Large decorative: 48px+

Color:
├─ Primary: #232F3E
├─ On hover: #FF9900
├─ Disabled: #CCCCCC
└─ Active: #0A66C2
```

---

## 🌙 Dark Mode (Opcional)

Si se implementa dark mode:

```
Background dark: #1A1F2E
Card dark: #2D3748
Text dark: #E8EAED
Border dark: #4A5568

Colores se invierten adaptando contraste
```

---

## ♿ Accesibilidad

```
- WCAG 2.1 AA compliance
- Contrast ratio mínimo: 4.5:1 (texto)
- Focus indicators: Visible siempre
- Color no es único indicador
- Keyboard navigation: Tab, Enter, Esc
- Screen reader: Proper ARIA labels
- Mobile: Mínimo 44px touch targets
- Semantic HTML: <button>, <form>, <nav>
```

---

## 📱 Consideraciones Móvil

```
- No zoom on focus inputs: font-size >= 16px
- Safe area: Considerar notch (top/bottom)
- Orientation: Soportar vertical y horizontal
- Touch: Mínimo 44x44px
- Gestures: Swipe, pull-to-refresh
- Network: Indicador conexión
- Battery: Considerar en GPS tracking
- Data: Comprimir imágenes, lazy load
```

---

## 🔌 Implementación Tailwind CSS

### Configuration

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'aws-orange': '#FF9900',
        'aws-navy': '#232F3E',
        'aws-blue': '#0A66C2',
        'aws-light': '#EAEDED',
        'aws-success': '#28A745',
        'aws-warning': '#FFC107',
        'aws-error': '#DC3545',
        'aws-info': '#17A2B8',
      },
      screens: {
        'xs': '0px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
}
```

### Uso en Componentes

```jsx
// Botón Primary
<button className="bg-aws-orange hover:bg-aws-orange/90 text-white px-6 py-3 rounded-lg transition-all duration-300">
  Click me
</button>

// Card responsivo
<div className="bg-white rounded-lg shadow-md p-6 md:p-8 hover:shadow-lg transition-shadow">
  Contenido
</div>

// Mobile-first layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards auto-responsivos */}
</div>
```

---

## 🚀 Prioridades de Implementación

### Fase 1 (MVP)
- [x] Login/Auth UI
- [x] Dashboard base
- [x] QR Scanner (funcional)
- [x] Leaderboard
- [x] Colores AWS SBG

### Fase 2
- [ ] Mapa en vivo
- [ ] Admin panel completo
- [ ] Reportes
- [ ] Dark mode

### Fase 3
- [ ] PWA (offline)
- [ ] Notificaciones push
- [ ] Analytics
- [ ] Optimizaciones

---

## 📚 Recursos

- **Tailwind CSS**: https://tailwindcss.com
- **AWS Branding**: https://aws.amazon.com/brand/
- **Heroicons**: https://heroicons.com
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Diseño basado en AWS SBG, responsivo mobile-first, optimizado para performance.** 🎨
