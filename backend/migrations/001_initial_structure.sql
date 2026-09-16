-- ===============================================
-- Migration: Initial Database Structure
-- Description: Creates core tables for Rally Competition Platform
-- ===============================================

-- Note: This migration file documents the intended schema.
-- In practice, Supabase tables should be created via the web console
-- or SQL editor to ensure proper configuration with Auth integration.

-- ===============================================
-- TABLA: Profiles
-- Descripción: Perfiles de usuario y información de equipo
-- ===============================================

CREATE TABLE IF NOT EXISTS Profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'EQUIPO') NOT NULL DEFAULT 'EQUIPO',
    team_name VARCHAR(100) UNIQUE,
    total_accumulated_points INTEGER NOT NULL DEFAULT 0,
    total_accumulated_time INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: Estaciones
-- Descripción: Estaciones de competencia con códigos QR asociados
-- ===============================================

CREATE TABLE IF NOT EXISTS Estaciones (
    estacion_id SMALLINT PRIMARY KEY,
    estacion_nombre VARCHAR(50) NOT NULL,
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: Registros_Estacion
-- Descripción: Registro de intentos de equipos en estaciones
-- ===============================================

CREATE TABLE IF NOT EXISTS Registros_Estacion (
    registro_id BIGSERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    estacion_id SMALLINT NOT NULL REFERENCES Estaciones(estacion_id),
    start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: Ubicaciones_Equipo
-- Descripción: Geolocalización GPS en tiempo real de equipos
-- ===============================================

CREATE TABLE IF NOT EXISTS Ubicaciones_Equipo (
    ubicacion_id BIGSERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(7, 2),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- INDEXES for Performance Optimization
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON Profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_team_name ON Profiles(team_name);

CREATE INDEX IF NOT EXISTS idx_registros_team_id ON Registros_Estacion(team_id);
CREATE INDEX IF NOT EXISTS idx_registros_estacion_id ON Registros_Estacion(estacion_id);
CREATE INDEX IF NOT EXISTS idx_registros_start_timestamp ON Registros_Estacion(start_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_team_id ON Ubicaciones_Equipo(team_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp ON Ubicaciones_Equipo(timestamp DESC);
