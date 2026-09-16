# 🔒 PNPM - Política de Seguridad

**IMPORTANTE**: Este proyecto usa **PNPM exclusivamente** por razones de seguridad en el manejo de dependencias.

## ¿Por qué PNPM?

### Problemas de npm/yarn
- ❌ Vulnerabilidades en cadena de suministro (supply-chain attacks)
- ❌ "Phantom dependencies" - acceso a dependencias que no deberían acceder
- ❌ Lockfile inconsistentes
- ❌ Ineficiencia de espacio

### Ventajas de pnpm
- ✅ Almacenamiento centralizado (content-addressed)
- ✅ Strict dependency isolation
- ✅ Lockfile perfecto (pnpm-lock.yaml verificado)
- ✅ Menos vulnerabilidades de seguridad
- ✅ Cumple con supply-chain policies
- ✅ Mejor performance

---

## ✅ REGLA DE ORO

### NUNCA usar npm o yarn en este proyecto

```bash
# ❌ NO HACER ESTO
npm install
npm ci
npm run build
yarn install

# ✅ HACER ESTO
pnpm install
pnpm add <package>
pnpm run build
```

---

## Instalación de pnpm

Si aún no lo tienes:

```bash
npm install -g pnpm

# Verificar instalación
pnpm --version
# Debería mostrar: 12.4.2 o superior
```

---

## Comandos Comunes con pnpm

### Instalación

```bash
# Instalar todas las dependencias
pnpm install

# Instalar un paquete específico
pnpm add express

# Instalar solo dependencias (sin dev)
pnpm install --prod

# Instalar como dev dependency
pnpm add -D typescript
```

### Scripts

```bash
# Ejecutar scripts del package.json
pnpm dev          # pnpm run dev
pnpm build        # pnpm run build
pnpm start        # pnpm run start
pnpm lint         # pnpm run lint
pnpm type-check   # pnpm run type-check
```

### Mantenimiento

```bash
# Ver qué dependencias pueden actualizarse
pnpm outdated

# Actualizar todas las dependencias
pnpm update

# Limpiar el almacén pnpm
pnpm store prune

# Verificar integridad del lock file
pnpm install --frozen-lockfile
```

---

## Verificación de Seguridad

### Verificar que pnpm-lock.yaml es legítimo

```bash
# Supabase ya verifica esto:
# "Lockfile passes supply-chain policies (verified 19m ago)"

# Esto significa:
# ✅ Las dependencias son legítimas
# ✅ No hay dependencias maliciosas detectadas
# ✅ El hash es válido
```

### Auditar dependencias

```bash
# Ver vulnerabilidades conocidas
pnpm audit

# Intentar arreglarlo automáticamente
pnpm audit --fix
```

---

## Workflow Correcto

### 1. Instalación Inicial

```bash
cd frontend
pnpm install
# Esto crea: node_modules/ y pnpm-lock.yaml
```

### 2. Agregar Dependencia

```bash
# Siempre con pnpm
pnpm add axios
# Actualiza package.json y pnpm-lock.yaml
```

### 3. Commit a Git

```bash
git add package.json pnpm-lock.yaml
git commit -m "Add new dependency"
git push
```

### 4. Desarrollar

```bash
pnpm dev
# El build respeta pnpm-lock.yaml
```

### 5. Deploy

```bash
# Amplify automáticamente usa pnpm-lock.yaml
# No necesita hacer nada especial
```

---

## Problemas Comunes

### Error: "ERR_PNPM_IGNORED_BUILDS"

**Problema**: 
```
Ignored build scripts: unrs-resolver@1.12.2
```

**Solución**:
```bash
# El script de build es ignorado por seguridad
# Ignorar es OK en este caso
# No necesitas hacer nada

# Si REALMENTE necesitas el build script:
pnpm install --allow-scripts
```

### node_modules es enorme

**Problema**: Carpeta `node_modules` muy grande

**Solución**:
```bash
# pnpm es más eficiente, pero:
pnpm store prune  # Limpiar almacén

# En Amplify, se reconstruye limpio en cada deploy
```

### No encuentro un módulo

**Problema**: 
```
Module not found: Can't resolve 'xyz'
```

**Solución**:
```bash
# 1. Verificar que la dependencia está en package.json
cat package.json | grep xyz

# 2. Si no está, instalarla
pnpm add xyz

# 3. Si está, reinstalar
pnpm install
```

---

## Amplify + pnpm

### Build Commands en Amplify

Amplify automáticamente detecta pnpm si existe `pnpm-lock.yaml`:

```yaml
# amplify.yml (automático)
frontend:
  phases:
    preBuild:
      commands:
        - pnpm install
    build:
      commands:
        - pnpm run build
```

### Verificación en Amplify

En Amplify Console, verás:

```
✓ Installing pnpm
✓ Running pnpm install
✓ Build completed successfully
```

---

## GitHub + pnpm

### Archivos a Commitear

```bash
# SIEMPRE incluir
git add package.json      ← Versiones de dependencias
git add pnpm-lock.yaml    ← Lock file verificado
git add frontend/app/     ← Código fuente

# NUNCA incluir
# node_modules/           ← Generado automáticamente
# .pnpm-debug.log         ← Logs de debug
```

### Evitar npm en GitHub

Si otros colaboradores usan npm:

```bash
# Crear hook pre-commit para evitar npm
# En .git/hooks/pre-commit:

#!/bin/bash
if grep -q "npm-shrinkwrap.json\|package-lock.json" .gitignore; then
    exit 0
else
    echo "❌ npm lock files detected"
    echo "❌ Use pnpm instead: pnpm install"
    exit 1
fi
```

---

## Migración desde npm

Si vienes de un proyecto con npm:

```bash
# 1. Eliminar lock files viejos
rm package-lock.json
rm node_modules -r

# 2. Instalar con pnpm
pnpm install

# 3. Verificar que funciona
pnpm dev

# 4. Commit de la migración
git add package.json pnpm-lock.yaml
git commit -m "Switch to pnpm for security"
```

---

## ✅ Checklist de Seguridad

Antes de cada deploy:

- [ ] ¿Usé `pnpm install` (no npm)?
- [ ] ¿Existe `pnpm-lock.yaml`?
- [ ] ¿Muestra "Lockfile passes supply-chain policies"?
- [ ] ¿Hice `pnpm audit` (sin vulnerabilidades críticas)?
- [ ] ¿Commiteé `pnpm-lock.yaml`?
- [ ] ¿El build local funciona con `pnpm dev`?
- [ ] ¿Amplify detecta pnpm automáticamente?

---

## 📚 Referencias

- [pnpm Official](https://pnpm.io)
- [pnpm Security](https://pnpm.io/security)
- [npm Vulnerabilities](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Dependency Confusion](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)

---

## 🔐 Resumen

| Aspecto | npm | pnpm |
|---------|-----|------|
| Security | ⚠️ Medio | ✅ Alto |
| Supply-chain | ⚠️ Riesgo | ✅ Verificado |
| Lock file | ⚠️ Inconsistente | ✅ Perfecto |
| Isolation | ⚠️ Phantom deps | ✅ Strict |
| Storage | ⚠️ 500GB+ | ✅ 50GB |
| Performance | ⚠️ Lento | ✅ Rápido |

---

**REGLA**: Este proyecto = pnpm solamente 🔒

**Violación**: No usar pnpm = riesgo de seguridad ⚠️

