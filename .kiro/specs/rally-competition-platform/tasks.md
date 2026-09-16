## Plan de Implementación: Rally Competition Platform

## Descripción General

El Rally Competition Platform se implementará en tres fases principales: infraestructura de base de datos y autenticación, desarrollo del backend REST API, y desarrollo del frontend con Next.js. La arquitectura separa claramente el frontend (Next.js + TypeScript) del backend (Python FastAPI), ambos comunicándose con Supabase para persistencia de datos y autenticación. Se utilizarán Supabase Realtime para sincronización en tiempo real del leaderboard y ubicaciones, y se desplegarán en AWS Amplify con soporte SSR.

El equipo debe seguir el orden de tareas para garantizar dependencias correctas: primero la base de datos, luego APIs básicas, y finalmente características del frontend. Todas las tareas incluyen referencias específicas a requisitos para trazabilidad.

## Tareas

- [ ] 1. Configuración inicial de proyecto e infraestructura
  - [-] 1.1 Configurar estructura de directorios del frontend Next.js con App Router
    - Crear estructura de directorios: app/, components/, lib/, styles/, public/
    - Inicializar tsconfig.json con configuración para Next.js 14+
    - Configurar next.config.js con SSR y optimizaciones
    - _Requisitos: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [-] 1.2 Configurar estructura de proyecto del backend Python con FastAPI
    - Crear estructura: main.py, core/, api/, services/, migrations/
    - Configurar requirements.txt con dependencias (fastapi, sqlalchemy, python-jose, supabase-py)
    - Inicializar virtual environment y verificar dependencias
    - _Requisitos: 23.1, 23.2, 23.3_

  - [~] 1.3 Inicializar proyecto Supabase y crear tablas de base de datos
    - Crear proyecto en Supabase console
    - Crear tabla Profiles: user_id, role (ENUM), team_name (unique), total_accumulated_points, total_accumulated_time
    - Crear tabla Estaciones: estacion_id (1-4), estacion_nombre, qr_code_hash (unique)
    - Crear tabla Registros_Estacion: registro_id, team_id (FK), estacion_id (FK), start_timestamp, end_timestamp, duration_seconds, points
    - Crear tabla Ubicaciones_Equipo: ubicacion_id, team_id (FK), latitude, longitude, timestamp
    - Configurar índices para queries de rendimiento
    - _Requisitos: 16.1, 17.1, 18.1, 19.1_

  - [-] 1.4 Configurar autenticación en Supabase
    - Habilitar Email/Password authentication en Supabase
    - Configurar URL de redirección para login/logout
    - Crear tablas de extensión si es necesario
    - _Requisitos: 1.1, 1.2, 24.1, 24.2_

  - [~] 1.5 Configurar políticas de Row-Level Security (RLS)
    - Crear política RLS para Registros_Estacion: teams solo ven sus propios registros, admins ven todo
    - Crear política RLS para Ubicaciones_Equipo: teams solo ven sus propias ubicaciones, admins ven todo
    - Crear política RLS para Profiles: teams pueden leer su propio perfil y el leaderboard
    - Verificar políticas con queries de prueba
    - _Requisitos: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [~] 1.6 Configurar AWS Amplify para despliegue
    - Crear aplicación en AWS Amplify
    - Conectar repositorio Git
    - Configurar build settings para Next.js con SSR
    - Configurar variables de ambiente (Supabase URL, ANON KEY, API_URL)
    - _Requisitos: 26.1, 26.2, 26.3, 26.4_

- [ ] 2. Implementación del backend REST API - Autenticación y validación
  - [~] 2.1 Implementar módulo de autenticación JWT
    - Crear core/auth.py con funciones de validación JWT
    - Implementar función verify_jwt() para validar tokens de Supabase
    - Crear middleware FastAPI para verificar JWT en rutas protegidas
    - Implementar extracción de user_id y role del token
    - _Requisitos: 1.3, 23.2, 24.1, 24.2_

  - [~] 2.2 Implementar rutas de autenticación del backend
    - Crear api/routes/auth.py con endpoints: POST /auth/login, POST /auth/logout, POST /auth/refresh
    - Implementar login que interactúa con Supabase Auth
    - Implementar token refresh con Supabase
    - Retornar JWT token para uso en requests posteriores
    - _Requisitos: 1.2, 1.3, 24.1_

  - [~] 2.3 Implementar validación de QR codes
    - Crear services/qr_validator.py con función validate_qr_code()
    - Implementar búsqueda de QR en tabla Estaciones
    - Validar que QR sea válido y pertenezca a una estación existente
    - Retornar estacion_id si es válido, error si no existe
    - _Requisitos: 5.1, 5.2, 4.2, 27.1_

  - [~] 2.4 Implementar cálculo de puntos
    - Crear services/points_calculator.py con función calculate_points(duration_seconds)
    - Implementar fórmula: points = MAX(0, 100 - (duration_seconds / 10))
    - Implementar redondeo estándar (0.5 redondea hacia arriba)
    - Validar que puntos sean no-negativos
    - _Requisitos: 7.1, 7.2, 7.3, 7.4_

  - [~] 2.5 Implementar validación de datos de geolocalización
    - Crear lib/validation/geo_validators.ts y services/geo_validators.py
    - Implementar validación: -90 <= latitude <= 90, -180 <= longitude <= 180
    - Implementar validación de timestamp (no en futuro, no más de 24 horas atrás)
    - _Requisitos: 15.2, 19.4_

- [ ] 3. Implementación del backend - Rutas QR y Station
  - [~] 3.1 Implementar ruta POST para scan de QR inicio
    - Crear api/routes/stations.py con endpoint POST /stations/scan/start
    - Validar JWT del request
    - Validar QR code con validate_qr_code()
    - Verificar que team no tenga intento en progreso para esta estación
    - Insertar registro en Registros_Estacion con start_timestamp = NOW()
    - Retornar registro_id y confirmación
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [~] 3.2 Implementar ruta POST para scan de QR fin
    - Crear endpoint POST /stations/scan/end en api/routes/stations.py
    - Validar JWT y obtener team_id
    - Validar QR code y obtener estacion_id
    - Buscar registro activo para (team_id, estacion_id)
    - Validar que existe registro en progreso
    - Calcular duration_seconds = end_timestamp - start_timestamp
    - Calcular puntos con calculate_points()
    - Actualizar registro: end_timestamp, duration_seconds, points
    - Actualizar Profiles: total_accumulated_points y total_accumulated_time
    - Retornar puntos y duración
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1_

  - [~] 3.3 Implementar ruta GET para obtener detalles de estación
    - Crear endpoint GET /stations/{station_id} en api/routes/stations.py
    - Validar JWT
    - Buscar estación en tabla Estaciones
    - Retornar: estacion_id, estacion_nombre, estado (pending/in_progress/complete)
    - _Requisitos: 4.3_

  - [~] 3.4 Implementar ruta GET para listar todas las estaciones
    - Crear endpoint GET /stations en api/routes/stations.py
    - Validar JWT
    - Retornar listado de 4 estaciones con sus detalles
    - _Requisitos: 4.1, 4.3_

  - [~] 3.5 Implementar manejo de errores y validación de requests
    - Crear core/exceptions.py con excepciones personalizadas
    - Implementar handlers para: QRCodeNotFound, StationInProgress, InvalidToken, ValidationError
    - Retornar códigos HTTP apropiados: 400, 401, 403, 404, 500
    - Incluir mensajes de error descriptivos
    - _Requisitos: 23.4, 27.2_

- [ ] 4. Implementación del backend - Leaderboard y datos del equipo
  - [~] 4.1 Implementar ruta GET para leaderboard en tiempo real
    - Crear api/routes/leaderboard.py con endpoint GET /leaderboard
    - Validar JWT
    - Consultar tabla Profiles: SELECT * ORDER BY total_accumulated_points DESC, total_accumulated_time ASC
    - Agregar ranking (rank = row_number)
    - Retornar lista de: [rank, team_name, total_points, total_time]
    - Asegurar que respuesta es eficiente (usar índices)
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 12.1, 12.2_

  - [~] 4.2 Implementar ruta GET para perfil de equipo
    - Crear api/routes/profiles.py con endpoint GET /profiles/me
    - Validar JWT y obtener user_id
    - Consultar tabla Profiles para el user_id
    - Retornar: team_name, total_accumulated_points, total_accumulated_time, role
    - _Requisitos: 2.5_

  - [~] 4.3 Implementar ruta GET para historial de intentos de equipo
    - Crear endpoint GET /profiles/me/attempts en api/routes/profiles.py
    - Consultar tabla Registros_Estacion para team_id del usuario
    - Filtrar solo registros completados (end_timestamp NOT NULL)
    - Retornar: estacion_id, start_time, end_time, duration, points
    - Ordenar por start_timestamp DESC
    - _Requisitos: 9.2, 11.2_

  - [~] 4.4 Implementar trigger de base de datos para actualizar total_accumulated_points
    - Crear trigger PostgreSQL que se ejecuta después de INSERT/UPDATE en Registros_Estacion
    - Trigger calcula SUM(points) de todos los registros del team
    - Actualiza Profiles.total_accumulated_points
    - _Requisitos: 7.5, 7.6, 11.1, 11.3_

  - [~] 4.5 Implementar trigger de base de datos para actualizar total_accumulated_time
    - Crear trigger PostgreSQL que se ejecuta después de INSERT/UPDATE en Registros_Estacion
    - Trigger calcula SUM(duration_seconds) de todos los registros completados
    - Actualiza Profiles.total_accumulated_time
    - _Requisitos: 12.1, 12.3_

- [ ] 5. Implementación del backend - Geolocalización
  - [~] 5.1 Implementar ruta POST para registrar ubicación
    - Crear api/routes/locations.py con endpoint POST /locations
    - Validar JWT y obtener team_id
    - Validar latitude (-90 a 90) y longitude (-180 a 180)
    - Insertar registro en Ubicaciones_Equipo: team_id, latitude, longitude, timestamp=NOW()
    - Retornar confirmación con ubicacion_id
    - _Requisitos: 15.1, 15.2, 15.3, 19.1, 19.2_

  - [~] 5.2 Implementar ruta GET para obtener ubicaciones del equipo
    - Crear endpoint GET /locations/me en api/routes/locations.py
    - Validar JWT
    - Consultar tabla Ubicaciones_Equipo para team_id del usuario
    - Retornar últimas 10 ubicaciones ordenadas por timestamp DESC
    - Incluir RLS check (solo ver sus propias ubicaciones)
    - _Requisitos: 15.4, 19.3, 20.1_

  - [~] 5.3 Implementar ruta GET para obtener todas las ubicaciones (admin)
    - Crear endpoint GET /locations/admin en api/routes/locations.py
    - Validar JWT y verificar que user es ADMIN
    - Consultar tabla Ubicaciones_Equipo sin restricciones
    - Retornar ubicaciones agrupadas por team_id
    - Incluir team_name para cada ubicación
    - _Requisitos: 14.1, 14.2, 20.2, 20.3_

  - [~] 5.4 Implementar configuración de CORS en FastAPI
    - Configurar middleware CORS en main.py
    - Permitir requests solo desde dominio del frontend
    - Permitir headers: Authorization, Content-Type
    - _Requisitos: 23.5_

- [ ] 6. Implementación del frontend - Autenticación e inicio de sesión
  - [~] 6.1 Configurar cliente de Supabase en frontend
    - Crear lib/auth/client.ts con inicialización de Supabase client
    - Importar @supabase/supabase-js
    - Configurar con SUPABASE_URL y SUPABASE_ANON_KEY
    - Exportar cliente para uso en aplicación
    - _Requisitos: 24.1, 24.2_

  - [~] 6.2 Crear componente LoginForm
    - Crear components/auth/LoginForm.tsx con formulario de email/password
    - Implementar validación de entrada (email válido, password > 6 caracteres)
    - Implementar estado de loading durante auth
    - Mostrar mensajes de error si falla login
    - _Requisitos: 1.1_

  - [~] 6.3 Implementar flujo de login con Supabase Auth
    - Crear lib/auth/session.ts con funciones login() y logout()
    - Implementar signInWithPassword() usando Supabase Auth
    - Guardar JWT token en httpOnly cookie
    - Redireccionar a /dashboard después de login exitoso
    - _Requisitos: 1.2, 1.4, 1.5, 24.2, 24.3_

  - [~] 6.4 Crear contexto de autenticación global
    - Crear lib/context/AuthContext.tsx con AppContext provider
    - Implementar estados: user, isAuthenticated, userRole, isLoading
    - Implementar funciones: login(), logout(), refreshToken()
    - Inicializar desde cookie en mount
    - _Requisitos: 1.1, 1.4_

  - [~] 6.5 Implementar middleware de autenticación para rutas protegidas
    - Crear app/(protected)/middleware.ts
    - Verificar presencia de token en cookies
    - Verificar validez del JWT
    - Redireccionar a /login si no autenticado
    - _Requisitos: 1.1, 1.6_

  - [~] 6.6 Crear página de login
    - Crear app/(public)/login/page.tsx
    - Integrar componente LoginForm
    - Mostrar opciones: Login o Registrarse
    - Implementar validación de formularios con errores
    - _Requisitos: 1.1, 1.2, 21.1_

- [ ] 7. Implementación del frontend - Gestión de perfiles y roles
  - [~] 7.1 Crear hook personalizado useAuth
    - Crear lib/hooks/useAuth.ts
    - Retornar: user, isAuthenticated, userRole, loading
    - Permitir acceso a contexto de autenticación desde componentes
    - _Requisitos: 1.3, 1.4_

  - [~] 7.2 Implementar componente ProtectedRoute
    - Crear components/auth/ProtectedRoute.tsx
    - Verificar autenticación y rol requerido
    - Redireccionar a login si no autenticado
    - Mostrar error si rol no es suficiente
    - _Requisitos: 1.6_

  - [~] 7.3 Crear página de perfil de equipo
    - Crear app/(protected)/dashboard/profile/page.tsx
    - Mostrar: team_name, total_points, total_time, rank en leaderboard
    - Mostrar historial de intentos en tabla
    - _Requisitos: 2.5, 9.2, 11.2_

  - [~] 7.4 Implementar hook useProfile
    - Crear lib/hooks/useProfile.ts
    - Fetchear perfil del usuario desde GET /profiles/me
    - Cachear datos con revalidation periódica
    - Retornar: profile, isLoading, error
    - _Requisitos: 2.1_

- [ ] 8. Implementación del frontend - Escáner QR
  - [~] 8.1 Instalar y configurar librería html5-qrcode
    - npm install html5-qrcode
    - Verificar compatibilidad con navegadores móviles
    - Configurar permisos de cámara
    - _Requisitos: Arquitectura general_

  - [~] 8.2 Crear componente QRScanner
    - Crear components/scanner/QRScanner.tsx
    - Implementar inicialización de Html5QrcodeScanner
    - Configurar fps: 10, qrbox: 250x250
    - Manejar eventos: onScan (exitoso), onError
    - _Requisitos: 5.1, 8_

  - [~] 8.3 Implementar solicitud de permisos de cámara
    - Crear lib/hooks/useQRScanner.ts
    - Implementar requestCameraPermission()
    - Manejar casos: permiso concedido, denegado, no soportado
    - Mostrar UI diferente según estado de permiso
    - _Requisitos: 5_

  - [~] 8.4 Implementar lógica de escaneo de QR start
    - Crear servicio que llama a POST /stations/scan/start con QR leído
    - Enviar QR code string al backend
    - Manejar respuesta: registro_id, start_timestamp
    - Actualizar estado local: estación en progreso
    - Iniciar cronómetro
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

  - [~] 8.5 Implementar lógica de escaneo de QR end
    - Crear servicio que llama a POST /stations/scan/end con QR leído
    - Validar que QR coincida con estación actual
    - Manejar respuesta: points, duration_seconds
    - Actualizar estado local: estación completada
    - Detener cronómetro
    - Mostrar puntos ganados
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [~] 8.6 Crear página del escáner QR
    - Crear app/(protected)/scanner/page.tsx
    - Integrar componente QRScanner
    - Mostrar permisos de cámara cuando sea necesario
    - Mostrar resultados de scan: estación, tiempo, puntos
    - Mostrar errores si scan falla
    - _Requisitos: 5_

- [ ] 9. Implementación del frontend - Cronómetro y tarjetas de estación
  - [~] 9.1 Crear componente Chronometer
    - Crear components/stations/Chronometer.tsx
    - Implementar estados: stopped, running, paused
    - Implementar contador que incrementa cada segundo
    - Formatear en MM:SS o HH:MM:SS
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [~] 9.2 Crear componente StationCard
    - Crear components/stations/StationCard.tsx
    - Mostrar: estación_nombre, status, earned_points, elapsed_time
    - Integrar Chronometer cuando status = "In Progress"
    - Aplicar estilos Tailwind para responsive
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [~] 9.3 Crear componente StationList
    - Crear components/stations/StationList.tsx
    - Mostrar 4 StationCards en grid responsive
    - Fetchear datos de estaciones desde backend
    - _Requisitos: 9_

  - [~] 9.4 Crear hook useStations
    - Crear lib/hooks/useStations.ts
    - Fetchear lista de estaciones desde GET /stations
    - Cachear con revalidation
    - Retornar: stations, isLoading, error
    - _Requisitos: 3.4, 9_

  - [~] 9.5 Crear página de dashboard de equipo
    - Crear app/(protected)/dashboard/page.tsx
    - Integrar StationList
    - Integrar Chronometer para estación activa
    - Mostrar total de puntos acumulados
    - _Requisitos: 9_

  - [~] 9.6 Implementar actualización en tiempo real del estado de estación
    - Crear hook useStationUpdates
    - Suscribirse a cambios en Profiles via Supabase Realtime
    - Actualizar StationCards cuando cambien los datos
    - _Requisitos: 25.1, 25.2, 9.6_

- [ ] 10. Implementación del frontend - Leaderboard en tiempo real
  - [~] 10.1 Crear componente LeaderboardTable
    - Crear components/leaderboard/LeaderboardTable.tsx
    - Mostrar tabla con: rank, team_name, total_points, total_time
    - Aplicar estilos Tailwind responsive
    - _Requisitos: 10.1, 10.4_

  - [~] 10.2 Crear componente TeamRank
    - Crear components/leaderboard/TeamRank.tsx
    - Mostrar fila individual de equipo con su información
    - Resaltar equipo actual si aplica
    - _Requisitos: 10_

  - [~] 10.3 Implementar hook useLeaderboard
    - Crear lib/hooks/useLeaderboard.ts
    - Fetchear leaderboard inicial desde GET /leaderboard
    - Suscribirse a actualizaciones en tiempo real (Supabase Realtime)
    - Mantener leaderboard ordenado correctamente
    - Retornar: leaderboard[], isLoading, lastUpdate
    - _Requisitos: 10.1, 10.2, 10.3, 10.5, 25.1, 25.2_

  - [~] 10.4 Crear página de leaderboard
    - Crear app/(protected)/dashboard/leaderboard/page.tsx
    - Integrar componente LeaderboardTable
    - Mostrar timestamp de última actualización
    - Implementar refresh manual si es necesario
    - _Requisitos: 10_

  - [~] 10.5 Implementar sincronización en tiempo real del leaderboard
    - Configurar suscripción Supabase a tabla Profiles
    - Escuchar eventos: INSERT, UPDATE en Profiles
    - Actualizar leaderboard cuando cambien points o time
    - Respetar orden de clasificación: points DESC, time ASC
    - _Requisitos: 25.1, 25.2, 10.6_

- [ ] 11. Implementación del frontend - Mapa en vivo (admin)
  - [~] 11.1 Instalar y configurar Leaflet
    - npm install leaflet react-leaflet
    - Importar estilos CSS de Leaflet
    - Configurar center inicial en coordenadas de rally
    - _Requisitos: Arquitectura general_

  - [~] 11.2 Crear componente LiveMap
    - Crear components/map/LiveMap.tsx
    - Inicializar mapa Leaflet en div
    - Usar OpenStreetMap como tile provider
    - Configurar zoom inicial: 13
    - _Requisitos: 14.1, 14.2_

  - [~] 11.3 Crear componente TeamMarker
    - Crear components/map/TeamMarker.tsx
    - Mostrar marcador en lat/lng
    - Mostrar popup con: team_name, timestamp
    - Colorear distintivamente
    - _Requisitos: 14.3, 14.5_

  - [~] 11.4 Implementar hook useLocations
    - Crear lib/hooks/useLocations.ts
    - Fetchear ubicaciones iniciales desde GET /locations/admin (si admin)
    - Suscribirse a cambios en tiempo real (Supabase Realtime)
    - Manejar actualización de marcadores en mapa
    - Retornar: locations[], isLoading, lastUpdate
    - _Requisitos: 14, 25.3, 25.4_

  - [~] 11.5 Implementar actualización de marcadores en tiempo real
    - Configurar suscripción Supabase a tabla Ubicaciones_Equipo (solo admin)
    - Escuchar eventos INSERT en Ubicaciones_Equipo
    - Actualizar posición de TeamMarker existente o crear nuevo
    - Verificar que actualización llegue en < 15 segundos
    - _Requisitos: 14.3, 14.4, 25.3, 25.4_

  - [~] 11.6 Crear página de mapa en vivo (admin)
    - Crear app/(protected)/admin/locations/page.tsx
    - Integrar componente LiveMap
    - Integrar hook useLocations
    - Mostrar solo si usuario es ADMIN
    - Mostrar timestamp de última actualización
    - _Requisitos: 14_

  - [~] 11.7 Crear dashboard de admin con mapa y leaderboard
    - Crear app/(protected)/admin/page.tsx
    - Mostrar acceso a: locations map, leaderboard view, station config
    - Verificar rol ADMIN
    - _Requisitos: 3.3, 3.4_

- [ ] 12. Implementación del frontend - Geolocalización y tracking
  - [~] 12.1 Crear hook useGeolocation
    - Crear lib/hooks/useGeolocation.ts
    - Implementar navigator.geolocation.watchPosition()
    - Configurar enableHighAccuracy: true
    - Capturar: latitude, longitude, accuracy, timestamp
    - Retornar: location, error, isTracking, startTracking(), stopTracking()
    - _Requisitos: 13.1, 13.2_

  - [~] 12.2 Implementar envío periódico de ubicación al backend
    - Crear servicio que llama a POST /locations cada 10 segundos
    - Enviar coordenadas capturadas desde useGeolocation
    - Manejar errores de red (reintentos con backoff)
    - Incluir JWT token en Authorization header
    - _Requisitos: 13.3, 15.1, 15.2, 15.3_

  - [~] 12.3 Implementar manejo de permisos de geolocalización
    - Solicitar permiso al iniciar intento de estación
    - Mostrar dialog si permiso es denegado
    - Permitir continuar sin tracking si se deniega
    - Mostrar estado: "Tracking: ON/OFF"
    - _Requisitos: 13.1, 13.4_

  - [~] 12.4 Integrar tracking con inicio/fin de estación
    - Iniciar tracking en useGeolocation cuando se escanea QR start
    - Detener tracking cuando se escanea QR end
    - Mostrar estado de tracking en UI
    - _Requisitos: 13, 5.1, 6.1_

- [ ] 13. Implementación del frontend - Gestión de estado global
  - [~] 13.1 Crear AppContext para estado global
    - Crear lib/context/AppContext.tsx
    - Definir interfaz AppState con: user, profile, leaderboard, stations, notifications
    - Implementar reducer para acciones: SET_USER, SET_LEADERBOARD, UPDATE_LOCATION, etc.
    - _Requisitos: Arquitectura general_

  - [~] 13.2 Crear AppProvider component
    - Implementar AppProvider que envuelve toda la aplicación
    - Inicializar estado desde localStorage si existe
    - Persistir cambios de estado a localStorage
    - _Requisitos: 1.4_

  - [~] 13.3 Implementar hook useApp
    - Crear lib/hooks/useApp.ts
    - Retornar: state, dispatch
    - Permitir acceso a estado global desde cualquier componente
    - _Requisitos: Arquitectura general_

- [ ] 14. Implementación del frontend - Manejo de errores y validación
  - [~] 14.1 Crear componente ErrorBoundary
    - Crear components/shared/ErrorBoundary.tsx
    - Capturar errores no controlados
    - Mostrar fallback UI con opción de reintentar
    - Loguear errores a Sentry si está configurado
    - _Requisitos: Arquitectura general_

  - [~] 14.2 Implementar validación de entradas
    - Crear lib/validation/validators.ts
    - Implementar validadores: email, password, teamName, coordinates
    - Validar antes de enviar al backend
    - Mostrar mensajes de error específicos
    - _Requisitos: 2.2, 19.4_

  - [~] 14.3 Crear componente FormField reutilizable
    - Crear components/forms/FormField.tsx
    - Mostrar input, label, y mensajes de error
    - Integrar con validación
    - _Requisitos: Arquitectura general_

  - [~] 14.4 Implementar manejo de errores de API
    - Crear lib/api/interceptors.ts
    - Capturar errores HTTP (4xx, 5xx)
    - Reintentar automáticamente en case de 5xx
    - Mostrar toast notifications para errores
    - _Requisitos: 23.4_

- [ ] 15. Implementación del frontend - UI y componentes compartidos
  - [~] 15.1 Crear componentes base con Tailwind
    - Crear components/shared/Button.tsx, Input.tsx, Card.tsx, Badge.tsx
    - Implementar variantes de estilo usando Tailwind
    - Aplicar diseño responsive
    - _Requisitos: 22.1, 22.2, 22.3_

  - [~] 15.2 Crear componente Header
    - Crear components/shared/Header.tsx
    - Mostrar: logo, navegación, user menu
    - Mostrar rol del usuario (ADMIN/EQUIPO)
    - Implementar logout
    - _Requisitos: 1.5, 22.1_

  - [~] 15.3 Crear componente Navigation
    - Crear components/shared/Navigation.tsx
    - Mostrar navegación diferente según rol
    - Links: Dashboard, Leaderboard, Scanner (para EQUIPO)
    - Links: Dashboard, Locations, Stations (para ADMIN)
    - _Requisitos: 1.6, 3_

  - [~] 15.4 Crear componente LoadingSpinner
    - Crear components/shared/LoadingSpinner.tsx
    - Mostrar spinner animado durante carga
    - Aplicar estilos con Tailwind
    - _Requisitos: 22.1_

  - [~] 15.5 Configurar diseño responsive con Tailwind
    - Configurar tailwind.config.ts con breakpoints
    - Aplicar mobile-first design
    - Probar en múltiples screen sizes
    - _Requisitos: 22.2_

- [ ] 16. Configuración de Supabase Realtime y suscripciones
  - [~] 16.1 Configurar canales de Realtime en Supabase
    - Habilitar Realtime en Supabase project
    - Crear configuración de canales para: Profiles, Ubicaciones_Equipo, Registros_Estacion
    - Verificar que los cambios de base de datos disparen eventos
    - _Requisitos: 25.1, 25.2, 25.3, 25.4_

  - [~] 16.2 Crear servicio de suscripciones reutilizable
    - Crear lib/realtime/subscriptionManager.ts
    - Implementar funciones: subscribe(), unsubscribe(), on()
    - Manejar reconexiones automáticas
    - _Requisitos: 25.5_

  - [~] 16.3 Configurar suscripciones para Profiles (leaderboard)
    - Escuchar cambios en tabla Profiles
    - Filtrar por eventos: INSERT, UPDATE
    - Llamar callback para actualizar leaderboard UI
    - _Requisitos: 10.5, 25.2_

  - [~] 16.4 Configurar suscripciones para Ubicaciones_Equipo (mapa)
    - Escuchar cambios en tabla Ubicaciones_Equipo
    - Filtrar por eventos: INSERT
    - Llamar callback para actualizar marcadores en mapa
    - _Requisitos: 11.5, 25.4_

- [~] 17. Pruebas e integración del sistema
  - [~] 17.1* Escribir pruebas unitarias para servicios de backend
    - Crear tests para: points_calculator.py, qr_validator.py
    - Verificar cálculo correcto de puntos
    - Verificar validación de QR codes
    - Tests: test_calculate_points(), test_validate_qr()
    - _Requisitos: 7, 5_

  - [~] 17.2* Escribir pruebas unitarias para componentes del frontend
    - Crear tests para: StationCard.test.tsx, Chronometer.test.tsx
    - Verificar renderizado correcto
    - Verificar eventos y callbacks
    - _Requisitos: 9_

  - [~] 17.3* Escribir pruebas de integración para flujos completos
    - Test: Login -> Scan QR start -> Scan QR end -> Leaderboard actualizado
    - Test: Admin visualiza mapa con ubicaciones en tiempo real
    - Verificar que datos se sincronicen correctamente
    - _Requisitos: 1, 5, 6, 10, 14_

  - [~] 17.4* Escribir pruebas de API con pytest
    - Test endpoints: POST /stations/scan/start, POST /stations/scan/end
    - Test: GET /leaderboard con diferentes órdenes
    - Verificar respuestas HTTP correctas
    - _Requisitos: 23_

  - [~] 17.5* Escribir pruebas E2E con Cypress
    - Test flujo completo de usuario EQUIPO
    - Test flujo completo de usuario ADMIN
    - Verificar permiso denegado para rutas no autorizadas
    - _Requisitos: 1.6, 21.1, 26.1_

- [ ] 18. Validación y despliegue
  - [~] 18.1 Ejecutar linting y formateo de código
    - Ejecutar eslint en frontend
    - Ejecutar black/flake8 en backend
    - Formatear código con prettier/black
    - _Requisitos: Calidad de código_

  - [~] 18.2 Compilar y construir proyectos
    - Ejecutar npm run build en frontend
    - Verificar no haya errores TypeScript
    - Verificar que todas las páginas se construyan correctamente
    - _Requisitos: 21.1_

  - [~] 18.3 Verificar que AWS Amplify build sea exitoso
    - Configurar CI/CD pipeline en Amplify
    - Ejecutar build automático en merge a main
    - Verificar que SSR funcione correctamente
    - _Requisitos: 26.1, 26.2, 26.3_

  - [~] 18.4 Realizar prueba de humo post-despliegue
    - Verificar que aplicación se cargue
    - Verificar que login funcione
    - Verificar que leaderboard se actualice en tiempo real
    - _Requisitos: 1, 10, 25_

  - [~] 18.5 Verificar que todas las pruebas pasen
    - Ejecutar npm test en frontend
    - Ejecutar pytest en backend
    - Verificar cobertura de código >= 80%
    - _Requisitos: 17_

- [~] 19. Punto de control - Verificar sistema completo
  - Asegurar que todas las pruebas pasen, pregunta al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden saltarse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los puntos de control garantizan validación incremental
- El backend debe estar completado antes de iniciar frontend
- Los triggers de base de datos son críticos para mantener totales consistentes
- Las suscripciones en tiempo real son esenciales para la experiencia competitiva
- Todos los comentarios y documentación deben estar en español

## Dependencias de Tareas

**Orden crítico de ejecución:**

1. **Fase de Infraestructura (Tasks 1.1-1.6)**: Deben completarse primero
   - Base de datos debe estar lista antes de cualquier backend
   - Autenticación de Supabase debe estar configurada
   - RLS policies son críticas para seguridad

2. **Fase de Backend (Tasks 2-5)**: Después de infraestructura
   - Auth debe estar antes que endpoints de estaciones
   - Points calculator debe estar antes de scan endpoints
   - Triggers de base de datos antes de usar endpoints

3. **Fase de Frontend - Autenticación (Tasks 6-7)**: Después de backend auth
   - LoginForm y contexto de autenticación base
   - ProtectedRoute para bloquear acceso no autenticado

4. **Fase de Frontend - Funcionalidad (Tasks 8-12)**: Después de auth del frontend
   - Scanner -> Chronometer -> StationCards
   - Leaderboard -> Realtime sync
   - Geolocation -> Mapa en vivo

5. **Fase de Testing (Task 17)**: Después de implementación
   - Pruebas unitarias de servicios aislados
   - Pruebas de integración de flujos completos
   - Pruebas E2E del sistema completo

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "1.6", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 7, "tasks": ["6.4", "6.5", "6.6"] },
    { "id": 8, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 10, "tasks": ["8.4", "8.5", "8.6"] },
    { "id": 11, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 12, "tasks": ["9.4", "9.5", "9.6"] },
    { "id": 13, "tasks": ["10.1", "10.2"] },
    { "id": 14, "tasks": ["10.3", "10.4", "10.5"] },
    { "id": 15, "tasks": ["11.1", "11.2"] },
    { "id": 16, "tasks": ["11.3", "11.4", "11.5"] },
    { "id": 17, "tasks": ["11.6", "11.7"] },
    { "id": 18, "tasks": ["12.1", "12.2"] },
    { "id": 19, "tasks": ["12.3", "12.4"] },
    { "id": 20, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 21, "tasks": ["14.1", "14.2", "14.3", "14.4"] },
    { "id": 22, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5"] },
    { "id": 23, "tasks": ["16.1", "16.2", "16.3", "16.4"] },
    { "id": 24, "tasks": ["17.1", "17.2", "17.3", "17.4", "17.5"] },
    { "id": 25, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5"] }
  ]
}
```

---

**Próximos pasos:** 

Puede comenzar a ejecutar las tareas abriendo el archivo `tasks.md` y haciendo clic en "Iniciar tarea" junto a los elementos de la tarea. Recomendamos seguir el orden de las olas (waves) de dependencia para garantizar que cada tarea tenga sus prerequisitos completados.

El equipo debe mantener comunicación regular para resolver bloqueos. Cada ola de tareas puede ejecutarse en paralelo una vez que todas sus dependencias están completadas.
