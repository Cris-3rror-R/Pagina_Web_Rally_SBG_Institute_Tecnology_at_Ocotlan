# 🤖 Esquema y Script de Base de Datos - Supabase (AWS CHALLENGE Rally)

Ejecuta este script SQL en el **SQL Editor** de tu proyecto Supabase para configurar la base de datos completa.

---

## 📋 Script SQL Completo

```sql
-- ============================================================================
-- 1. DESACTIVAR Y ELIMINAR TRIGGERS PREVIOS
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. LIMPIEZA DE TABLAS PREVIAS
-- ============================================================================
DROP TABLE IF EXISTS public.equipo_estaciones CASCADE;
DROP TABLE IF EXISTS public.stations CASCADE;
DROP TABLE IF EXISTS public.equipos CASCADE;
DROP TABLE IF EXISTS public.administradores CASCADE;

-- ============================================================================
-- 3. TABLA: ADMINISTRADORES
-- ============================================================================
CREATE TABLE public.administradores (
    admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLA: EQUIPOS
-- ============================================================================
CREATE TABLE public.equipos (
    equipo_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tiempo_inicio TIMESTAMP WITH TIME ZONE,
    tiempo_final TIMESTAMP WITH TIME ZONE,
    puntaje_actual INTEGER DEFAULT 0 CHECK (puntaje_actual >= 0),
    puntaje_total INTEGER DEFAULT 0 CHECK (puntaje_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX idx_equipos_puntaje_actual ON public.equipos(puntaje_actual DESC);
CREATE INDEX idx_equipos_puntaje_total ON public.equipos(puntaje_total DESC);

-- ============================================================================
-- 5. TABLA: STATIONS (Estaciones del Rally 1 a 4)
-- ============================================================================
CREATE TABLE public.stations (
    estacion_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    encargados TEXT,
    descripcion TEXT,
    ubicacion_palabra TEXT,
    puntos_totales INTEGER DEFAULT 0 CHECK (puntos_totales >= 0), -- Puntos máximos a otorgar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stations_nombre ON public.stations(nombre);

-- ============================================================================
-- 6. TABLA: EQUIPO_ESTACIONES (Puntos Ganados por Equipo por Estación)
-- ============================================================================
CREATE TABLE public.equipo_estaciones (
    id SERIAL PRIMARY KEY,
    equipo_id UUID NOT NULL REFERENCES public.equipos(equipo_id) ON DELETE CASCADE,
    estacion_id INTEGER NOT NULL REFERENCES public.stations(estacion_id) ON DELETE CASCADE,
    puntos_ganados INTEGER DEFAULT 0 CHECK (puntos_ganados >= 0), -- Puntos obtenidos por el equipo
    completado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(equipo_id, estacion_id) -- Garantiza solo un registro por estación por equipo
);

CREATE INDEX idx_equipo_estaciones_equipo ON public.equipo_estaciones(equipo_id);
CREATE INDEX idx_equipo_estaciones_estacion ON public.equipo_estaciones(estacion_id);

-- ============================================================================
-- 7. FUNCIONES Y TRIGGERS
-- ============================================================================

-- Helper para verificar si es Admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.administradores
        WHERE admin_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_administradores_updated_at
BEFORE UPDATE ON public.administradores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_equipos_updated_at
BEFORE UPDATE ON public.equipos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_stations_updated_at
BEFORE UPDATE ON public.stations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_equipo_estaciones_updated_at
BEFORE UPDATE ON public.equipo_estaciones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger automático al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_type TEXT;
BEGIN
    user_type := COALESCE(NEW.raw_user_meta_data->>'role', 'EQUIPO');

    IF user_type = 'ADMIN' THEN
        INSERT INTO public.administradores (admin_id, nombre, password)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'password', '')
        );
    ELSE
        INSERT INTO public.equipos (equipo_id, nombre)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipo_estaciones ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS ADMINISTRADORES
CREATE POLICY "Admins ver administradores" ON public.administradores
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden modificar administradores" ON public.administradores
FOR ALL USING (public.is_admin(auth.uid()));

-- POLÍTICAS EQUIPOS
CREATE POLICY "Cualquier usuario autenticado ve los equipos" ON public.equipos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Equipos actualizan su propio registro u admins" ON public.equipos
FOR UPDATE USING (auth.uid() = equipo_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins gestionan equipos" ON public.equipos
FOR ALL USING (public.is_admin(auth.uid()));

-- POLÍTICAS STATIONS
CREATE POLICY "Cualquier autenticado lee estaciones" ON public.stations
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins modifican estaciones" ON public.stations
FOR ALL USING (public.is_admin(auth.uid()));

-- POLÍTICAS EQUIPO_ESTACIONES
CREATE POLICY "Equipos ven sus propios puntos ganados u Admins ven todo" ON public.equipo_estaciones
FOR SELECT USING (auth.uid() = equipo_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins gestionan los puntos asignados" ON public.equipo_estaciones
FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================================================
-- 9. REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipo_estaciones;

-- ============================================================================
-- 10. DATOS INICIALES (ESTACIONES 1 A 4 Y MOCK DATA)
-- ============================================================================
DO $$
DECLARE
    admin1_id UUID := uuid_generate_v4();
    team1_id UUID := uuid_generate_v4();
    team2_id UUID := uuid_generate_v4();
    st1_id INTEGER;
    st2_id INTEGER;
    st3_id INTEGER;
    st4_id INTEGER;
BEGIN
    -- 1. Limpiar usuarios de prueba si existían
    DELETE FROM auth.users 
    WHERE email IN ('admin@rally.com', 'equipo1@rally.com', 'equipo2@rally.com');

    -- 2. Crear los usuarios de prueba
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES 
        (admin1_id, 'admin@rally.com', '$2a$10$UnusedPasswordHashForTest1234567890123', NOW(), '{"role":"ADMIN", "nombre":"Administrador Principal", "password":"AdminPassword123"}'),
        (team1_id, 'equipo1@rally.com', '$2a$10$UnusedPasswordHashForTest1234567890123', NOW(), '{"role":"EQUIPO", "nombre":"Los Rayos del Rally"}'),
        (team2_id, 'equipo2@rally.com', '$2a$10$UnusedPasswordHashForTest1234567890123', NOW(), '{"role":"EQUIPO", "nombre":"Escudería Fuego"}');

    -- 3. Estaciones de prueba (Estaciones 1 a 4)
    INSERT INTO public.stations (nombre, encargados, descripcion, ubicacion_palabra, puntos_totales)
    VALUES ('Estación 1: Fundamentos de Cloud & Ciberseguridad', 'Carlos Pérez, Ana Gómez', 'Desafíos de conceptos básicos de AWS IAM, VPC y cifrado', 'Edificio Central - Laboratorio 1', 100)
    RETURNING estacion_id INTO st1_id;

    INSERT INTO public.stations (nombre, encargados, descripcion, ubicacion_palabra, puntos_totales)
    VALUES ('Estación 2: Detección y Análisis de Vulnerabilidades', 'Luis Rodríguez, Sofia Vega', 'Búsqueda de brechas de seguridad y configuración de defensas', 'Terraza Norte - Punto Alfa', 150)
    RETURNING estacion_id INTO st2_id;

    INSERT INTO public.stations (nombre, encargados, descripcion, ubicacion_palabra, puntos_totales)
    VALUES ('Estación 3: Desafío de Respuestas a Incidentes', 'Mario Santos, Diana Soto', 'Simulación de ataque en tiempo real y mitigación', 'Auditorio Principal', 120)
    RETURNING estacion_id INTO st3_id;

    INSERT INTO public.stations (nombre, encargados, descripcion, ubicacion_palabra, puntos_totales)
    VALUES ('Estación 4: Criptografía y Reto Final', 'Elena Morales, Roberto Gil', 'Descifrado de claves y verificación de hash final', 'Plaza de las Ciencias', 200)
    RETURNING estacion_id INTO st4_id;

    -- 4. Registrar puntos ganados de prueba para los equipos
    INSERT INTO public.equipo_estaciones (equipo_id, estacion_id, puntos_ganados, completado)
    VALUES 
        (team1_id, st1_id, 90, true),
        (team1_id, st2_id, 120, true),
        (team2_id, st1_id, 100, true)
    ON CONFLICT (equipo_id, estacion_id) DO NOTHING;

    -- 5. Actualizar puntajes acumulados de los equipos de prueba
    UPDATE public.equipos SET puntaje_actual = 210, puntaje_total = 210 WHERE equipo_id = team1_id;
    UPDATE public.equipos SET puntaje_actual = 100, puntaje_total = 100 WHERE equipo_id = team2_id;

END $$;
```

---

## 🚀 Pasos para ejecutar en Supabase

1. Entra a tu consola de Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (`kmfxpiphhjkxdrqiteqd`).
3. En el menú lateral izquierdo, haz clic en **SQL Editor**.
4. Haz clic en **New query** (Nueva consulta).
5. Pega todo el script SQL anterior y haz clic en **Run** (Ejecutar).
