# Despliegue Rápido a AWS Amplify

## 🎯 5 Pasos para Desplegar en AWS Amplify

### Paso 1: Preparar Repositorio Git

```bash
# En la carpeta raíz del proyecto
git init
git add .
git commit -m "Initial commit: Rally Competition Platform"
```

**IMPORTANTE**: Antes de hacer push, asegúrate de que `pnpm-lock.yaml` esté en el repositorio (pnpm lo generó automáticamente).

### Paso 2: Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. Crear repositorio (ej: `rally-competition-platform`)
3. NO inicializar con README
4. Crear repositorio

### Paso 3: Push a GitHub

```bash
# Agregar remote y hacer push
git remote add origin https://github.com/tu-usuario/rally-competition-platform.git
git branch -M main
git push -u origin main
```

### Paso 4: Conectar a AWS Amplify

1. Ir a https://console.aws.amazon.com/amplify
2. Click en "New app" → "Host web app"
3. Seleccionar GitHub
4. Autorizar AWS Amplify (si es primera vez)
5. Seleccionar:
   - Repository: `rally-competition-platform`
   - Branch: `main`
6. Click "Next"

### Paso 5: Configurar Build

1. En "Build and deploy settings":
   - Framework: **Next.js (ssr)**
   - Build command: `pnpm install && pnpm run build`
   - Start command: `pnpm start`

2. Haz click en "Mostrar ediciones del archivo" y asegúrate que `amplify.yml` existe con:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - echo "Backend build not required"
frontend:
  phases:
    preBuild:
      commands:
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Click "Next"

### Paso 6: Agregar Variables de Entorno

En AWS Amplify Console:
1. App settings → Environment variables
2. Click "Manage all"
3. Agregar variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL = https://tu-api-gateway.execute-api.us-east-1.amazonaws.com
```

4. Click "Save"

### Paso 7: Desplegar

1. En Amplify Console
2. Click "Deploy"
3. Esperar 3-5 minutos
4. Cuando esté listo, verás:
   - URL: `https://main.xxxxxxxxxxxx.amplifyapp.com`
   - Status: ✅ "Deployed"

## ✅ Verificar Despliegue

- [ ] Frontend abierto en navegador
- [ ] Login funciona
- [ ] Páginas cargan correctamente
- [ ] No hay errores en consola

## 🔧 Solucionar Problemas

### Error: "Build failed"

```bash
# Ver logs
# En Amplify Console → Deployments → Click en despliegue fallido

# Soluciones comunes:
# 1. npm install falla → verificar node_modules
# 2. Variables de entorno faltantes
# 3. Errores TypeScript → npm run type-check localmente
```

### Error: "Cannot find module"

```bash
# En local:
npm ci  # Clean install
npm run build  # Build test

# Si funciona localmente pero falla en Amplify:
# - Verificar .gitignore no excluye dependencias
# - Amplify rebuilds node_modules automáticamente
```

### App carga pero está en blanco

```bash
# Verificar:
1. Variables de entorno configuradas
2. Supabase URL correcta
3. CORS habilitado en backend

# Debug:
# En navegador → Abre DevTools (F12)
# → Console tab → busca errores rojos
```

## 📊 Próximo: Desplegar Backend

Una vez que el frontend está funcionando:

```bash
# Instalar Serverless Framework
npm install -g serverless

# Desplegar backend a AWS Lambda
cd backend
serverless deploy --stage prod

# Tomar nota de la URL del API
# Ej: https://abcdef.execute-api.us-east-1.amazonaws.com
```

Luego actualizar en Amplify:
1. Environment variables → `NEXT_PUBLIC_API_URL`
2. Pegar URL del Lambda
3. Guardar
4. Redesplegar

## 🎉 ¡Listo!

Tu app está en vivo en:
```
https://main.xxxxxxxxxxxx.amplifyapp.com
```

## Despliegue Continuo (Opcional)

Cada push a `main` desplegará automáticamente:

```bash
# Hacer cambios locales
git add .
git commit -m "Add new feature"
git push origin main

# Amplify detecta el push y redeplega automáticamente
# Ver progreso en Amplify Console → Deployments
```

## 📚 Documentación Completa

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para:
- Configurar dominio personalizado
- SSL/HTTPS
- Monitoreo
- Rollback
- Base de datos

---

**Tiempo total**: ~15 minutos ⚡
