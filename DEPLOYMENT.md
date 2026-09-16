# Guía de Despliegue - Rally Competition Platform

## Arquitectura de Despliegue

```
AWS Amplify (Frontend + SSR)
  ↓
CloudFront (CDN)
  ↓
S3 (Static Assets)
  ↓
AWS Lambda (Backend API)
  ↓
API Gateway
  ↓
Supabase PostgreSQL (Database)
```

## Requisitos Previos

- Cuenta de AWS
- Proyecto de Supabase configurado
- GitHub/GitLab repository conectado
- Node.js 18+ y Python 3.11+
- AWS CLI configurado
- Serverless Framework instalado

## Paso 1: Preparar Variables de Entorno

### Frontend (.env.production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://api.rally.example.com
```

### Backend (backend/.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-here
API_HOST=0.0.0.0
API_PORT=8000
ENV=production
CORS_ORIGINS=https://rally.example.com,https://www.rally.example.com
```

## Paso 2: Configurar Supabase

### 2.1 Crear Proyecto Supabase

1. Ir a [Supabase Console](https://app.supabase.com)
2. Crear nuevo proyecto
3. Esperar inicialización (5-10 minutos)

### 2.2 Crear Tablas y RLS Policies

```bash
# Desde la consola SQL de Supabase, ejecutar los scripts:
# 1. backend/migrations/001_create_tables.sql
# 2. backend/migrations/002_create_rls_policies.sql
# 3. backend/migrations/003_create_indexes.sql
```

### 2.3 Configurar Autenticación

1. En Supabase Dashboard → Authentication
2. Configurar proveedores (Email, OAuth si es necesario)
3. Copiar URL del proyecto y Anon Key

## Paso 3: Desplegar Backend en AWS Lambda

### 3.1 Instalar Dependencias

```bash
cd backend

# Instalar Serverless Framework
npm install -g serverless

# Instalar plugins
npm install --save-dev serverless-python-requirements serverless-plugin-tracing
```

### 3.2 Desplegar a AWS

```bash
# Configurar credenciales AWS (si no las tienes)
aws configure

# Desplegar a development
serverless deploy --stage dev

# Desplegar a producción
serverless deploy --stage prod
```

### 3.3 Variables de Entorno en AWS

En AWS Lambda:
1. Ir a cada función
2. Configuración → Variables de entorno
3. Agregar las variables necesarias

O usar el archivo `.env`:

```bash
serverless deploy --stage prod --env-file=.env.production
```

## Paso 4: Desplegar Frontend en AWS Amplify

### 4.1 Conectar Repositorio

1. Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. "Nueva aplicación" → "Alojar aplicación web"
3. Seleccionar GitHub/GitLab
4. Autorizar AWS Amplify
5. Seleccionar repositorio y rama (`main` o `production`)

### 4.2 Configurar Build

1. En "Configuración de compilación":
   - Framework: Next.js
   - Build command: `npm run build`
   - Start command: `npm start`

2. Copiar configuración desde `amplify.yml` (en la raíz del proyecto)

### 4.3 Variables de Entorno en Amplify

1. En la consola: App → Configuración → Variables de entorno
2. Agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (URL del API de Lambda)

### 4.4 Configurar Dominio Personalizado (Opcional)

1. Amplify Console → Custom domain
2. Agregar dominio
3. Configurar registros DNS

## Paso 5: Configurar Continuo Deployment

### 5.1 GitHub Actions (Recomendado)

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main, production ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Amplify
        uses: aws-actions/amplify-cli-action@v2
        with:
          amplify_cli_version: latest
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 5.2 Configurar en Amplify

1. Amplify Console → Compilaciones
2. Habilitar "Compilación automática"
3. Seleccionar rama para despliegue

## Paso 6: Configurar Certificado SSL

### 6.1 AWS Certificate Manager

1. ACM Console → "Solicitar certificado"
2. Dominio: `rally.example.com`
3. Validar dominio vía DNS
4. Esperar validación (5-30 minutos)

### 6.2 Aplicar a CloudFront

En Amplify:
1. Custom domain
2. Usar certificado de ACM

## Paso 7: Configurar Monitoreo

### 7.1 CloudWatch

```bash
# Ver logs del Lambda
aws logs tail /aws/lambda/rally-competition-api-prod --follow

# Crear alarma para errores
aws cloudwatch put-metric-alarm \
  --alarm-name rally-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### 7.2 Amplify Analytics

1. Amplify Console → Analytics
2. Habilitar "CloudWatch RUM"
3. Crear grupo de monitoreo

## Paso 8: Optimizaciones de Producción

### Frontend

```bash
# Verificar tamaño de bundle con pnpm
pnpm build && pnpm analyze

# Optimizar imágenes
pnpm dlx next-image-export-optimizer
```

### Backend

```bash
# Ejecutar tests
pytest tests/

# Verificar performance
# Usar AWS X-Ray en Lambda
```

## Solución de Problemas

### Error: "Cannot find module 'fastapi'"

```bash
# Reinstalar dependencias con pip layer
pip install -r requirements.txt -t ./python/lib/python3.11/site-packages/
```

### Error: "CORS error from Lambda"

Verificar en `main.py`:
```python
allowed_origins = [
    "https://your-amplify-domain.amplifyapp.com",
    "https://rally.example.com"
]
```

### Error: "Supabase connection timeout"

1. Verificar variables de entorno en Lambda
2. Verificar seguridad del grupo VPC
3. Aumentar timeout de Lambda a 30 segundos

### Performance lento

1. Aumentar memoria de Lambda (512 MB → 1024 MB)
2. Habilitar Lambda provisioned concurrency
3. Cachear respuestas en CloudFront

## URLs Después del Despliegue

- **Frontend**: `https://your-amplify-domain.amplifyapp.com`
- **API**: `https://api-gateway-url.execute-api.us-east-1.amazonaws.com`
- **Base de datos**: Supabase dashboard

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos Supabase iniciada
- [ ] Tablas y políticas RLS creadas
- [ ] Backend deployado en Lambda
- [ ] Frontend deployado en Amplify
- [ ] Dominio personalizado configurado
- [ ] SSL/TLS habilitado
- [ ] Monitoreo configurado
- [ ] Tests pasados
- [ ] Backup de base de datos configurado
- [ ] Plan de disaster recovery

## Soporte y Mantenimiento

### Actualizaciones Regulares

```bash
# Actualizar dependencias de Node con pnpm
pnpm update

# Actualizar dependencias de Python
pip install --upgrade -r requirements.txt

# Limpiar cachés de pnpm
pnpm store prune
```

### Rotación de Secretos

1. Cambiar JWT_SECRET cada 90 días
2. Rotar claves de API Supabase
3. Actualizar AWS IAM credentials

## Rollback en Caso de Problema

```bash
# Amplify - revertir a versión anterior
# (En consola de Amplify: Compilaciones → Seleccionar versión anterior → Restaurar)

# Backend - revertir Lambda
serverless rollback --stage prod
```

---

**Última actualización**: Septiembre 2026
**Versión**: 1.0.0
