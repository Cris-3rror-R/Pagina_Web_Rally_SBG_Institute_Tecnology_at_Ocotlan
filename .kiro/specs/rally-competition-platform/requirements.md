# Rally Competition Platform - Requirements Document

## Introduction

The Rally Competition Platform is a web-based system designed to manage team-based rally competitions. The platform enables teams to register completion times at multiple stations via QR code scanning, accumulate points based on performance metrics, and compete on a real-time global leaderboard. Administrators can monitor team locations in real-time through GPS tracking. The system integrates with Supabase for authentication and data persistence, and provides live chronometers and status tracking for each station.

## Glossary

- **System**: The Rally Competition Platform application
- **Admin**: A user with administrative privileges to manage stations, view leaderboard, and monitor team locations
- **EQUIPO (Team)**: A registered team participating in the rally competition
- **Station**: A physical or virtual checkpoint in the rally (Estación 1, 2, 3, or 4)
- **QR Code**: A unique identifier linked to each station's start and end points
- **Registration**: The process of a team scanning a start QR code at a station
- **Completion**: The process of a team scanning an end QR code at a station
- **Duration**: The elapsed time between station start QR scan and end QR scan
- **Points**: Performance score earned by a team at a station
- **Leaderboard**: Real-time ranking of teams sorted by accumulated points and time
- **Chronometer**: A real-time timer displayed in the UI showing elapsed time for an active station attempt
- **Geolocation**: GPS coordinates of a team device during an active test
- **RLS (Row Level Security)**: Database-level security policies enforcing data access control
- **Supabase**: Cloud database and authentication service (PostgreSQL-based)
- **Profile**: Extended user record containing role (ADMIN or EQUIPO) and team name

---

## Requirements

### Requirement 1: User Authentication and Role-Based Authorization

**User Story:** As a user, I want to authenticate using secure credentials, so that I can access the platform with appropriate permissions based on my role.

#### Acceptance Criteria

1. WHEN a user attempts to access the System, THE System SHALL redirect unauthenticated users to the authentication page
2. WHEN valid credentials are provided, THE System SHALL authenticate the user via Supabase Auth and create a session
3. WHEN an authenticated user logs in, THE System SHALL assign the user a role (ADMIN or EQUIPO) from the Profiles table
4. WHILE a user is authenticated, THE System SHALL maintain the session across page navigation
5. WHEN a user clicks logout, THE System SHALL terminate the session and redirect to the authentication page
6. IF a user attempts to access a resource requiring a different role, THEN THE System SHALL deny access and display an error message

**Testable As:** Property-based test - Test authentication with various credential combinations; test role assignment consistency; test session persistence across multiple navigation patterns.

---

### Requirement 2: Team Registration and Profile Management

**User Story:** As a new team, I want to register with a unique team name, so that I can participate in the rally competition.

#### Acceptance Criteria

1. WHEN a new user signs up, THE System SHALL create a profile record in the Profiles table with role set to EQUIPO
2. WHEN a team enters a team name during registration, THE System SHALL validate that the name is unique across all registered teams
3. IF a team name is not unique, THEN THE System SHALL reject the registration and display an error message
4. WHEN a team registers successfully, THE System SHALL store the team name, user ID, and role (EQUIPO) in the Profiles table
5. WHEN an EQUIPO user accesses their profile, THE System SHALL display their team name and current leaderboard position

**Testable As:** Integration test with 2-3 representative examples (happy path: valid unique name; error path: duplicate name; edge case: empty/whitespace name).

---

### Requirement 3: Admin User Setup and Authorization

**User Story:** As an administrator, I want to have elevated privileges, so that I can manage stations and monitor all team activities.

#### Acceptance Criteria

1. WHEN an administrator account is created (via direct database seeding or admin panel), THE System SHALL assign the role ADMIN to that user profile
2. WHEN an ADMIN user accesses the System, THE System SHALL grant access to admin-only features including station management and live location monitoring
3. WHILE an ADMIN user is logged in, THE System SHALL display the admin dashboard with access to leaderboard, locations, and station management
4. IF a non-ADMIN user attempts to access admin features, THEN THE System SHALL deny access and redirect to the team dashboard

**Testable As:** Integration test with representative examples (admin login flow, permission denial for non-admin, admin dashboard access).

---

### Requirement 4: Station Configuration and QR Code Association

**User Story:** As an administrator, I want to configure stations with unique QR codes, so that teams can register their attempts at specific checkpoints.

#### Acceptance Criteria

1. THE System SHALL maintain 4 predefined stations (Estación 1, Estación 2, Estación 3, Estación 4) in the Estaciones table
2. EACH station SHALL have a unique QR code hash stored in the Estaciones table
3. WHEN an administrator accesses the station configuration panel, THE System SHALL display all 4 stations with their QR code identifiers
4. WHILE the System is running, THE System SHALL ensure that each station QR code hash is immutable and uniquely linked to exactly one station

**Testable As:** Integration test with representative station data; property-based test to verify uniqueness constraint on QR code hashes.

---

### Requirement 5: QR Code Scanning - Start Station Attempt

**User Story:** As a team participant, I want to scan a start QR code at a station, so that I can begin an attempt and activate the chronometer.

#### Acceptance Criteria

1. WHEN a team scans the start QR code of a station, THE System SHALL identify the QR code hash and validate it matches a known station
2. IF the QR code is invalid or unrecognized, THEN THE System SHALL display an error message and not record the attempt
3. WHEN a valid start QR code is scanned, THE System SHALL create a new record in Registros_Estacion with start_timestamp set to the current time
4. WHEN a start QR code is scanned, THE System SHALL initialize the Chronometer displaying elapsed time starting from 0:00
5. WHILE a station attempt is in progress, THE System SHALL display the station status as "In Progress"
6. IF a team attempts to scan a start QR code for a station that is already in progress, THEN THE System SHALL prevent the duplicate registration and display a warning

**Testable As:** Integration test with representative scan sequences; edge case testing for invalid/duplicate QR codes.

---

### Requirement 6: QR Code Scanning - End Station Attempt

**User Story:** As a team participant, I want to scan an end QR code at a station, so that I can complete the attempt and record my duration.

#### Acceptance Criteria

1. WHEN a team scans the end QR code of a station, THE System SHALL validate the QR code hash matches the currently in-progress station
2. IF the QR code does not match the in-progress station, THEN THE System SHALL reject the end scan and display an error
3. WHEN a valid end QR code is scanned, THE System SHALL update the Registros_Estacion record with end_timestamp set to the current time
4. WHEN end_timestamp is recorded, THE System SHALL calculate duration_seconds as the difference between end_timestamp and start_timestamp
5. WHEN end_timestamp is recorded, THE System SHALL update the station status to "Complete"
6. WHEN end_timestamp is recorded, THE System SHALL stop the Chronometer and display the final duration
7. WHEN a station attempt is complete, THE System SHALL immediately record the duration in the Registros_Estacion table

**Testable As:** Integration test with representative scan sequences; edge cases for mismatched stations, timing calculations.

---

### Requirement 7: Points Calculation and Assignment

**User Story:** As a platform administrator, I want the system to automatically calculate and assign points to teams based on their performance, so that leaderboard rankings are accurate.

#### Acceptance Criteria

1. WHEN a station attempt is completed (end QR scanned), THE System SHALL calculate points based on the duration_seconds
2. THE System SHALL assign points using the following algorithm: points = MAX(0, 100 - (duration_seconds / 10))
3. THE System SHALL round calculated points to the nearest integer using standard rounding (0.5 rounds up)
4. WHEN points are calculated, THE System SHALL store the points value in the Registros_Estacion record
5. WHEN a station attempt is completed, THE System SHALL accumulate the points to the team's total points in the Profiles table
6. WHEN multiple attempts are recorded for the same team at different stations, THE System SHALL sum all points and display the total accumulated points in the leaderboard

**Testable As:** Property-based test - Test points calculation with various duration values; verify accumulated points consistency; test rounding correctness; property: (accumulated_points of single station) + (accumulated points of another station) == total_accumulated_points.

---

### Requirement 8: Real-Time Chronometer Display

**User Story:** As a team participant, I want to see a live chronometer during a station attempt, so that I can track elapsed time in real-time.

#### Acceptance Criteria

1. WHEN a team scans the start QR code, THE System SHALL display a Chronometer on the UI showing elapsed time starting from 0:00
2. WHILE a station attempt is in progress, THE Chronometer SHALL increment every second to display the elapsed time in MM:SS format
3. WHEN the end QR code is scanned, THE Chronometer SHALL freeze and display the final duration
4. WHILE the chronometer is running, THE System SHALL update the elapsed time in real-time without requiring page refresh
5. IF the user navigates away from the station card and returns, THE Chronometer SHALL resume from the correct elapsed time

**Testable As:** Integration test with real-time clock verification; edge case for network latency and navigation.

---

### Requirement 9: Station Status Display and Station Card UI

**User Story:** As a team participant, I want to see the status of each station and my performance metrics, so that I can track my progress throughout the rally.

#### Acceptance Criteria

1. THE System SHALL display 4 station cards labeled "Estación 1", "Estación 2", "Estación 3", "Estación 4" on the team dashboard
2. EACH station card SHALL display: status, earned points, and elapsed time for the most recent attempt
3. WHEN a station has not been attempted, THE System SHALL display status as "Pending", earned points as "0", and elapsed time as "—"
4. WHEN a station is being attempted, THE System SHALL display status as "In Progress", earned points as "0", and elapsed time as the live chronometer
5. WHEN a station attempt is complete, THE System SHALL display status as "Complete", earned points as the calculated value, and elapsed time as the final duration
6. WHILE a team is viewing the station cards, THE System SHALL update all status displays in real-time as new attempts are recorded

**Testable As:** Integration test with representative station state transitions; property: (sum of earned points on all cards) == total_accumulated_points.

---

### Requirement 10: Real-Time Global Leaderboard

**User Story:** As a platform user (Admin or Team), I want to see the current rankings of all participating teams, so that I can track performance and competition progress.

#### Acceptance Criteria

1. THE System SHALL display a real-time leaderboard showing all registered teams
2. WHEN the leaderboard is displayed, THE System SHALL sort teams by total accumulated points in descending order (highest points first)
3. WHEN two teams have equal accumulated points, THE System SHALL apply a tiebreaker sorting by total accumulated time in ascending order (lowest time first)
4. EACH leaderboard entry SHALL display: team rank, team name, total accumulated points, and total accumulated time
5. WHEN a team completes a station attempt, THE System SHALL immediately update the leaderboard rankings
6. WHILE the leaderboard is displayed, THE System SHALL refresh the rankings in real-time without requiring page reload

**Testable As:** Property-based test - Test leaderboard sorting with various point/time combinations; verify tiebreaker logic; property: leaderboard order is consistent with sort criteria; metamorphic property: adding a new team does not change order of existing teams if new team's metrics don't affect their position.

---

### Requirement 11: Team Total Accumulated Points Calculation

**User Story:** As a team, I want my total points to reflect all completed station attempts, so that my leaderboard position is accurate.

#### Acceptance Criteria

1. WHEN a team completes a station attempt, THE System SHALL add the earned points to the team's total accumulated points
2. WHEN a team views their profile, THE System SHALL display the total accumulated points as the sum of all points from completed attempts across all stations
3. WHEN multiple teams are compared on the leaderboard, THE System SHALL ensure each team's total accumulated points is correctly calculated as the sum of their individual station points
4. THE System SHALL persist total accumulated points in the Profiles table and update it after each station completion

**Testable As:** Property-based test - Test accumulated points calculation with various station completion sequences; idempotence: calculating total points multiple times yields same result; round-trip: sum of individual points equals stored total.

---

### Requirement 12: Team Total Accumulated Time Calculation

**User Story:** As the system, I want to track total time spent across all stations, so that tiebreaker sorting on the leaderboard is accurate.

#### Acceptance Criteria

1. WHEN a team completes a station attempt, THE System SHALL record the duration_seconds in the Registros_Estacion table
2. WHEN the leaderboard is displayed, THE System SHALL calculate each team's total accumulated time as the sum of all duration_seconds from completed attempts
3. WHEN multiple teams have equal points, THE System SHALL use total accumulated time to determine ranking (lower time ranks higher)
4. THE System SHALL update total accumulated time calculations in real-time as new station attempts are completed

**Testable As:** Property-based test - Test total time calculation with various duration sequences; verify tiebreaker correctness; metamorphic property: adding a new attempt increases total time by exactly the new attempt's duration.

---

### Requirement 13: Real-Time Geolocation Tracking for Teams

**User Story:** As an administrator, I want to see the real-time GPS location of all active teams during the rally, so that I can monitor their progress and ensure safety.

#### Acceptance Criteria

1. WHEN a team begins a station attempt (starts chronometer), THE System SHALL request permission to access the team device's GPS location
2. WHEN GPS permission is granted, THE System SHALL capture the team's current coordinates (latitude, longitude)
3. WHILE a station attempt is in progress, THE System SHALL update the team's location in the Ubicaciones_Equipo table at regular intervals (every 10 seconds or upon significant movement)
4. WHEN GPS permission is denied, THE System SHALL display a warning and allow the team to continue without location tracking
5. WHEN a station attempt is completed, THE System SHALL continue tracking location data until the next attempt begins
6. WHILE geolocation data is being collected, THE System SHALL securely transmit coordinates to the backend and store in the Ubicaciones_Equipo table with team_id, latitude, longitude, and timestamp

**Testable As:** Integration test with 2-3 representative scenarios (GPS permission granted, GPS denied, location update intervals); edge cases for permission handling.

---

### Requirement 14: Admin Live Location Map View

**User Story:** As an administrator, I want to view all team locations on a live map, so that I can monitor team progress and ensure the rally is proceeding safely.

#### Acceptance Criteria

1. WHEN an admin user accesses the live location dashboard, THE System SHALL display a map showing the current locations of all active teams
2. WHEN the map is displayed, THE System SHALL mark each team's location with a unique identifier (team name or icon)
3. WHILE teams are completing station attempts, THE System SHALL update team location markers on the map in real-time (refresh every 10 seconds)
4. WHEN a team's location data is updated in the Ubicaciones_Equipo table, THE System SHALL reflect the new position on the admin map within 15 seconds
5. WHEN an admin hovers over or clicks a team marker, THE System SHALL display the team name and most recent location timestamp

**Testable As:** Integration test with representative map scenarios (multiple teams, location updates, marker displays); edge case for stale location data.

---

### Requirement 15: Geolocation Data Persistence to Supabase

**User Story:** As the system, I want to persist team location data to the database, so that location history can be retained and analyzed.

#### Acceptance Criteria

1. WHEN a team's GPS coordinates are captured, THE System SHALL insert a record into the Ubicaciones_Equipo table containing: team_id, latitude, longitude, timestamp
2. WHEN location data is persisted, THE System SHALL use the server's current time as the timestamp (not client time) to ensure consistency
3. WHILE a team is active, THE System SHALL create one Ubicaciones_Equipo record every 10 seconds or upon significant movement (>50 meters)
4. WHEN location records are queried for a specific team, THE System SHALL return records ordered by timestamp in descending order (most recent first)
5. THE System SHALL enforce RLS policies ensuring teams can only view their own location data and admins can view all location data

**Testable As:** Integration test with representative data persistence scenarios; round-trip property: data written to database can be read back with exact values.

---

### Requirement 16: Profiles Table Schema and Data Integrity

**User Story:** As the system, I want to maintain accurate user profile data, so that authentication, authorization, and leaderboard calculations are correct.

#### Acceptance Criteria

1. THE System SHALL maintain a Profiles table in Supabase containing: user_id (primary key, foreign key to auth.users), role (ENUM: ADMIN or EQUIPO), team_name (unique string, nullable for ADMIN), total_accumulated_points (integer, default 0), total_accumulated_time (integer, default 0)
2. WHEN a user authenticates, THE System SHALL create a profile record with role and team_name populated
3. WHEN a station attempt is completed, THE System SHALL update the profile's total_accumulated_points and total_accumulated_time columns
4. WHILE the System is running, THE System SHALL enforce that team_name is unique across all EQUIPO profiles
5. IF a duplicate team_name is attempted to be inserted, THEN THE System SHALL reject the insert and return a constraint violation error

**Testable As:** Integration test with representative profile data; property-based test for unique constraint on team_name across multiple profile creations.

---

### Requirement 17: Estaciones Table Schema and QR Code Management

**User Story:** As the system, I want to maintain accurate station configurations, so that QR code scanning can identify stations correctly.

#### Acceptance Criteria

1. THE System SHALL maintain an Estaciones table in Supabase containing: estacion_id (primary key, fixed values 1-4), estacion_nombre (string: "Estación 1", "Estación 2", "Estación 3", "Estación 4"), qr_code_hash (unique string)
2. WHEN the System starts, THE System SHALL ensure exactly 4 records exist in the Estaciones table, one for each station
3. WHILE the System is running, THE System SHALL enforce that qr_code_hash is unique and cannot be modified
4. WHEN a team scans a QR code, THE System SHALL query the Estaciones table to validate the QR code hash matches a known station

**Testable As:** Integration test with representative QR code validation scenarios; uniqueness property for qr_code_hash.

---

### Requirement 18: Registros_Estacion Table Schema and Attempt Recording

**User Story:** As the system, I want to record all station attempts, so that points can be calculated and leaderboards can be generated.

#### Acceptance Criteria

1. THE System SHALL maintain a Registros_Estacion table in Supabase containing: registro_id (primary key, auto-increment), team_id (foreign key to Profiles), estacion_id (foreign key to Estaciones), start_timestamp (timestamp), end_timestamp (timestamp, nullable), duration_seconds (integer, nullable), points (integer, nullable)
2. WHEN a team scans a start QR code, THE System SHALL insert a record with team_id, estacion_id, and start_timestamp populated, with end_timestamp, duration_seconds, and points as NULL
3. WHEN a team scans the end QR code, THE System SHALL update the record by setting end_timestamp, calculating duration_seconds, and calculating points
4. WHEN a record is queried for a specific team, THE System SHALL return all attempts ordered by start_timestamp in descending order (most recent first)
5. THE System SHALL enforce RLS policies ensuring teams can only view their own attempts and admins can view all attempts

**Testable As:** Integration test with representative attempt recording scenarios; round-trip property for attempt data; invariant: end_timestamp >= start_timestamp for completed attempts.

---

### Requirement 19: Ubicaciones_Equipo Table Schema and GPS Data Storage

**User Story:** As the system, I want to store GPS coordinates for each team, so that location history can be tracked and displayed.

#### Acceptance Criteria

1. THE System SHALL maintain an Ubicaciones_Equipo table in Supabase containing: ubicacion_id (primary key, auto-increment), team_id (foreign key to Profiles), latitude (decimal), longitude (decimal), timestamp (timestamp)
2. WHEN GPS coordinates are captured, THE System SHALL insert a record with team_id, latitude, longitude, and server-generated timestamp
3. WHEN location records are queried, THE System SHALL return records ordered by timestamp in descending order (most recent first)
4. THE System SHALL validate that latitude values are between -90 and 90, and longitude values are between -180 and 180
5. THE System SHALL enforce RLS policies ensuring teams can only view their own location data and admins can view all location data

**Testable As:** Property-based test for latitude/longitude bounds validation; integration test with representative location data insertion and retrieval.

---

### Requirement 20: Row-Level Security (RLS) for Data Privacy

**User Story:** As the system, I want to enforce data access control at the database level, so that teams cannot access other teams' data and security is maximized.

#### Acceptance Criteria

1. WHEN a team user queries the Registros_Estacion table, THE System SHALL only return records where team_id matches their user_id
2. WHEN a team user queries the Ubicaciones_Equipo table, THE System SHALL only return records where team_id matches their user_id
3. WHEN an admin user queries any table, THE System SHALL return all records without restriction
4. IF a team user attempts to update a record belonging to another team, THEN THE System SHALL reject the update at the database level
5. WHILE RLS policies are active, THE System SHALL prevent unauthorized data access even if the application layer has a vulnerability

**Testable As:** Integration test with representative access scenarios (team accessing own data, team accessing other's data, admin access); edge cases for policy enforcement.

---

### Requirement 21: Next.js Frontend with App Router and TypeScript

**User Story:** As a developer, I want the frontend to be built with Next.js App Router and TypeScript, so that the codebase is type-safe and benefits from server-side rendering.

#### Acceptance Criteria

1. THE System SHALL be built using Next.js with the App Router (app/ directory structure)
2. THE System SHALL use TypeScript for all frontend code to ensure type safety
3. WHEN the application is built, THE System SHALL support Server-Side Rendering (SSR) for dynamic pages
4. WHILE the System is running, THE System SHALL leverage Next.js middleware for authentication checks on protected routes
5. THE System SHALL organize code with clear separation: app/ for pages and layouts, components/ for reusable UI components, lib/ for utilities

**Testable As:** Integration test verifying build succeeds and SSR pages render correctly; edge case for authentication middleware on various route types.

---

### Requirement 22: Tailwind CSS Styling

**User Story:** As a developer, I want to use Tailwind CSS for styling, so that the UI is responsive and maintainable.

#### Acceptance Criteria

1. THE System SHALL use Tailwind CSS for all component styling
2. WHEN components are built, THE System SHALL ensure the UI is responsive and works on mobile, tablet, and desktop devices
3. WHILE the System is running, THE System SHALL apply consistent styling using Tailwind utility classes
4. THE System SHALL configure Tailwind to include custom colors and spacing matching the rally competition branding

**Testable As:** Integration test with visual regression testing; edge case for responsive design on various screen sizes.

---

### Requirement 23: REST API Backend for Server Operations

**User Story:** As the frontend, I want to communicate with a REST API backend, so that I can perform operations like QR validation and leaderboard retrieval.

#### Acceptance Criteria

1. THE System SHALL provide a REST API backend (Python FastAPI or Flask) with endpoints for: QR code validation, leaderboard retrieval, location data updates, and authentication
2. WHEN the frontend makes a request to the API, THE System SHALL authenticate the request using Supabase JWT tokens
3. WHILE the backend is running, THE System SHALL return responses in JSON format with appropriate HTTP status codes
4. IF the backend receives invalid data, THEN THE System SHALL return a 400 Bad Request response with a descriptive error message
5. THE System SHALL enforce CORS policies to allow requests only from the frontend domain

**Testable As:** Integration test with representative API endpoints; edge cases for authentication, CORS, and error responses.

---

### Requirement 24: Supabase Integration for Authentication

**User Story:** As the system, I want to integrate Supabase for user authentication, so that credentials are securely managed.

#### Acceptance Criteria

1. THE System SHALL use Supabase Auth for user registration and login
2. WHEN a user registers or logs in, THE System SHALL obtain a JWT token from Supabase Auth
3. WHILE a user is authenticated, THE System SHALL store the JWT token securely (in cookies or secure storage)
4. WHEN the frontend makes API requests, THE System SHALL include the JWT token in the Authorization header
5. IF a JWT token is invalid or expired, THE System SHALL refresh the token automatically or redirect to login

**Testable As:** Integration test with representative authentication flows; edge cases for token expiration and refresh.

---

### Requirement 25: Supabase Integration for Real-Time Data Synchronization

**User Story:** As the system, I want to use Supabase real-time subscriptions, so that leaderboard and location data updates are pushed to clients without polling.

#### Acceptance Criteria

1. WHEN a team or admin user is viewing the leaderboard, THE System SHALL subscribe to changes in the Profiles table using Supabase real-time
2. WHEN a profile record is updated (points or time), THE System SHALL emit a real-time event that updates the leaderboard on connected clients
3. WHEN an admin is viewing the live location map, THE System SHALL subscribe to changes in the Ubicaciones_Equipo table using Supabase real-time
4. WHEN location records are inserted, THE System SHALL emit a real-time event that updates team positions on the admin map
5. WHILE a subscription is active, THE System SHALL handle reconnection events gracefully if the connection is interrupted

**Testable As:** Integration test with representative real-time subscription scenarios; edge cases for connection loss and recovery.

---

### Requirement 26: AWS Amplify Deployment with SSR

**User Story:** As the operations team, I want to deploy the application to AWS Amplify with SSR support, so that the application is scalable and highly available.

#### Acceptance Criteria

1. THE System SHALL be deployed to AWS Amplify with SSR enabled for Next.js
2. WHEN the application is deployed, THE System SHALL provision necessary AWS resources (CloudFront, Lambda, and S3)
3. WHILE the System is running, THE System SHALL serve static assets from CloudFront for optimal performance
4. WHEN environment variables (Supabase URL, API keys) are needed, THE System SHALL store them securely in AWS Amplify environment configuration
5. IF a deployment fails, THE System SHALL provide clear error logs in the AWS Amplify console

**Testable As:** Integration test verifying deployment succeeds; smoke test for application availability after deployment.

---

### Requirement 27: QR Code Validation and Error Handling

**User Story:** As the system, I want to validate QR codes before processing, so that invalid scans are rejected gracefully.

#### Acceptance Criteria

1. WHEN a team scans a QR code, THE System SHALL attempt to decode and extract the QR code hash
2. IF the QR code cannot be decoded, THEN THE System SHALL display an error message and request a rescan
3. WHEN the QR code hash is extracted, THE System SHALL query the Estaciones table to validate the hash exists
4. IF the QR code hash does not match any known station, THEN THE System SHALL display an error and log the invalid scan attempt
5. WHEN a valid QR code is scanned, THE System SHALL proceed with start or end registration as appropriate

**Testable As:** Integration test with representative valid and invalid QR codes; edge cases for malformed QR codes.

---

### Requirement 28: Duplicate Station Attempt Prevention

**User Story:** As the system, I want to prevent teams from scanning the same start QR code twice, so that a station attempt cannot be registered twice.

#### Acceptance Criteria

1. WHEN a team scans a start QR code for a station, THE System SHALL check if an in-progress attempt exists for that team and station
2. IF an in-progress attempt exists, THEN THE System SHALL reject the new start scan and display a warning message
3. WHEN a start scan is rejected, THE System SHALL suggest the team complete or cancel the existing attempt before starting a new one
4. WHILE an attempt is in progress, THE System SHALL maintain the in-progress status until an end QR code is scanned

**Testable As:** Integration test with representative duplicate scan scenarios; edge case for rapid successive scans.

---

### Requirement 29: Session Management and Automatic Logout

**User Story:** As the platform, I want to manage user sessions securely, so that inactive users are automatically logged out and unauthorized access is prevented.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL create a session with an appropriate timeout duration (recommend 30 minutes for inactivity)
2. WHILE a user is active, THE System SHALL refresh the session timeout
3. IF a user is inactive for the timeout duration, THE System SHALL automatically log out the user
4. WHEN a user is logged out, THE System SHALL redirect them to the login page and clear all session data
5. WHILE a session is active, THE System SHALL prevent concurrent sessions for the same user account

**Testable As:** Integration test with representative session scenarios; edge case for timeout edge conditions.

---

### Requirement 30: Error Logging and Monitoring

**User Story:** As the operations team, I want errors to be logged and monitored, so that issues can be diagnosed and resolved quickly.

#### Acceptance Criteria

1. WHEN an error occurs in the backend, THE System SHALL log the error with: timestamp, error message, stack trace, and user context
2. WHEN an error occurs in the frontend, THE System SHALL report it to an error tracking service (e.g., Sentry)
3. WHILE the System is running, THE System SHALL monitor system health metrics (response times, error rates, uptime)
4. WHEN critical errors occur, THE System SHALL trigger alerts to the operations team
5. THE System SHALL provide an admin panel to view recent error logs and system health status

**Testable As:** Integration test with representative error scenarios; smoke test for error logging functionality.

---

### Requirement 31: Input Validation and Sanitization

**User Story:** As the system, I want to validate all user inputs, so that invalid or malicious data is rejected.

#### Acceptance Criteria

1. WHEN a team enters a team name during registration, THE System SHALL validate the input: non-empty, length <= 100 characters, no special characters
2. WHEN GPS coordinates are received from a device, THE System SHALL validate latitude (-90 to 90) and longitude (-180 to 180)
3. IF input validation fails, THEN THE System SHALL reject the input and display a specific error message
4. WHEN the backend receives API requests, THE System SHALL sanitize string inputs to prevent injection attacks
5. THE System SHALL use parameterized queries for all database operations to prevent SQL injection

**Testable As:** Property-based test for input validation (various lengths, characters, boundary values); edge cases for special characters.

---

### Requirement 32: Data Export for Administrators

**User Story:** As an administrator, I want to export competition results and location data, so that I can analyze performance and create reports.

#### Acceptance Criteria

1. WHEN an admin accesses the data export panel, THE System SHALL provide options to export: leaderboard results, individual team results, and location history
2. WHEN an admin initiates an export, THE System SHALL generate a CSV or JSON file containing the requested data
3. WHEN export data is generated, THE System SHALL include all relevant fields: team name, points, time, and timestamps
4. WHILE export is in progress, THE System SHALL display a progress indicator
5. WHEN export is complete, THE System SHALL allow the admin to download the file

**Testable As:** Integration test with representative export scenarios; edge case for large datasets.

---

## Constraints

### Technical Constraints

- The frontend MUST use Next.js App Router and TypeScript
- The backend MUST be implemented in Python (FastAPI or Flask)
- The database MUST use Supabase (PostgreSQL) with RLS enabled
- The deployment MUST target AWS Amplify with SSR support
- The frontend MUST use Tailwind CSS for styling
- The system MUST support real-time updates via Supabase subscriptions

### Functional Constraints

- Exactly 4 stations must be available in the system
- Points calculation formula: MAX(0, 100 - (duration_seconds / 10))
- Leaderboard tiebreaker: Total accumulated time (ascending) when points are equal
- Team names must be globally unique
- Location updates must occur every 10 seconds or upon significant movement (>50 meters)
- Session timeout: 30 minutes of inactivity

### Security Constraints

- All user authentication must go through Supabase Auth
- RLS policies must enforce team-level data isolation
- JWT tokens must be included in all API requests
- Database passwords and API keys must not be committed to version control
- CORS must be configured to allow only the frontend domain
- All passwords must be securely hashed (Supabase Auth handles this)

### Performance Constraints

- Leaderboard must update in real-time with latency < 2 seconds
- Map location updates must reflect within 15 seconds
- API response times must be < 500ms for most endpoints
- The system must support at least 100 concurrent teams

### Data Retention Constraints

- Location history must be retained for a minimum of 30 days
- Attempt records must be retained indefinitely for historical analysis
- User authentication logs must be retained for 90 days

---

## Acceptance Criteria Analysis Summary

This requirements document has been structured to be compliant with EARS patterns and INCOSE quality rules:

- **Active Voice**: All requirements use clear "THE System SHALL" statements
- **No Vague Terms**: Specific, measurable criteria are provided (e.g., "within 15 seconds", "every 10 seconds")
- **Testability**: All requirements include explicit conditions and measurable criteria
- **No Escape Clauses**: Requirements do not use "where possible" or "if feasible"
- **Solution-Free**: Requirements focus on what the system must do, not implementation details
- **Positive Statements**: Primary focus on desired behavior, with error handling as separate criteria

Each requirement has been tagged with the most appropriate testing strategy to maximize bug detection during implementation.
