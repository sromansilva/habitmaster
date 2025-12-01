# Guía de Integración con Backend (Neon PostgreSQL)

Esta aplicación está **completamente preparada** para integrarse con un backend real y base de datos Neon PostgreSQL.

## 🎯 Estado Actual

- ✅ **Datos mock eliminados**: No hay usuarios ficticios ni datos hardcodeados
- ✅ **Estructura preparada**: Todos los estados están listos para recibir datos del backend
- ✅ **Estados vacíos por defecto**: La app muestra placeholders cuando no hay datos
- ✅ **Comentarios de integración**: Cada componente tiene notas sobre endpoints necesarios

---

## 📊 Estructura de Base de Datos (Neon PostgreSQL)

### 1. Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. Tabla: `user_stats`
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_stats_total_points ON user_stats(total_points DESC);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

### 3. Tabla: `habits`
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  frequency INTEGER DEFAULT 7,
  points INTEGER DEFAULT 10,
  streak INTEGER DEFAULT 0,
  last_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);
```

### 4. Tabla: `habit_logs`
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(completed_date DESC);
```

### 5. Tabla: `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(100),
  requirement VARCHAR(100),
  max_progress INTEGER,
  points_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poblar con logros predefinidos
INSERT INTO achievements (achievement_key, name, description, icon, category, requirement, max_progress, points_bonus) VALUES
('racha_7', 'Primera Semana', 'Mantén una racha de 7 días consecutivos', '🔥', 'Racha', 'racha_7', 7, 50),
('racha_30', 'Mes Imparable', 'Mantén una racha de 30 días consecutivos', '⚡', 'Racha', 'racha_30', 30, 200),
('racha_100', 'Leyenda', 'Mantén una racha de 100 días consecutivos', '👑', 'Racha', 'racha_100', 100, 1000),
('habits_5', 'Coleccionista', 'Crea 5 hábitos diferentes', '📝', 'Hábitos', 'habits_5', 5, 100),
('habits_10', 'Maestro de Hábitos', 'Crea 10 hábitos diferentes', '🎯', 'Hábitos', 'habits_10', 10, 250),
('habits_20', 'Experto', 'Crea 20 hábitos diferentes', '🎓', 'Hábitos', 'habits_20', 20, 500),
('completed_10', 'Primeros Pasos', 'Completa 10 hábitos en total', '✅', 'Completados', 'completed_10', 10, 30),
('completed_50', 'Consistencia', 'Completa 50 hábitos en total', '💪', 'Completados', 'completed_50', 50, 150),
('completed_100', 'Imparable', 'Completa 100 hábitos en total', '🚀', 'Completados', 'completed_100', 100, 300),
('completed_500', 'Campeón', 'Completa 500 hábitos en total', '🏆', 'Completados', 'completed_500', 500, 1500),
('points_100', 'Novato', 'Alcanza 100 puntos totales', '⭐', 'Puntos', 'points_100', 100, 20),
('points_1000', 'Competidor', 'Alcanza 1000 puntos totales', '💎', 'Puntos', 'points_1000', 1000, 200),
('points_5000', 'Maestro', 'Alcanza 5000 puntos totales', '🌟', 'Puntos', 'points_5000', 5000, 1000),
('points_10000', 'Leyenda de Puntos', 'Alcanza 10000 puntos totales', '💫', 'Puntos', 'points_10000', 10000, 2500);
```

### 6. Tabla: `user_achievements`
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

### 7. Tabla: `weekly_stats`
```sql
CREATE TABLE weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_weekly_stats_week ON weekly_stats(week_start DESC);
CREATE INDEX idx_weekly_stats_points ON weekly_stats(week_start, points_earned DESC);
```

---

## 🔌 API Endpoints Necesarios

### Autenticación

#### `POST /api/auth/register`
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Juan Pérez"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "avatar": "https://...",
    "created_at": "2024-12-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "avatar": "https://...",
    "bio": "..."
  },
  "token": "jwt_token_here"
}
```

---

### Usuarios

#### `GET /api/users/me`
Obtener perfil del usuario autenticado

```json
Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Juan Pérez",
  "avatar": "https://...",
  "bio": "Construyendo mejores hábitos cada día",
  "stats": {
    "total_points": 1250,
    "achievement_points": 200,
    "current_streak": 15,
    "max_streak": 30,
    "level": 13
  },
  "unlocked_achievements": ["racha_7", "habits_5", "completed_10"],
  "member_since": "2024-01-01T00:00:00Z"
}
```

#### `PATCH /api/users/me`
Actualizar perfil del usuario

```json
Request:
{
  "name": "Nuevo Nombre",
  "bio": "Nueva biografía",
  "avatar": "https://..."
}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nuevo Nombre",
  "bio": "Nueva biografía",
  "avatar": "https://...",
  "updated_at": "2024-12-01T00:00:00Z"
}
```

---

### Hábitos

#### `GET /api/habits`
Obtener todos los hábitos del usuario

```json
Response:
{
  "habits": [
    {
      "id": "uuid",
      "name": "Ejercicio matutino",
      "description": "30 minutos de ejercicio",
      "category": "Salud",
      "frequency": 7,
      "points": 10,
      "streak": 5,
      "last_completed": "2024-12-01",
      "completed_dates": ["2024-11-27", "2024-11-28", "2024-11-29", "2024-11-30", "2024-12-01"],
      "created_at": "2024-11-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/habits`
Crear un nuevo hábito

```json
Request:
{
  "name": "Leer 30 minutos",
  "description": "Leer libros de desarrollo personal",
  "category": "Educación",
  "frequency": 5,
  "points": 15
}

Response:
{
  "id": "uuid",
  "name": "Leer 30 minutos",
  "description": "Leer libros de desarrollo personal",
  "category": "Educación",
  "frequency": 5,
  "points": 15,
  "streak": 0,
  "last_completed": null,
  "completed_dates": [],
  "created_at": "2024-12-01T10:30:00Z"
}
```

#### `PATCH /api/habits/:id`
Actualizar un hábito existente

#### `DELETE /api/habits/:id`
Eliminar un hábito

#### `POST /api/habits/:id/complete`
Marcar hábito como completado

```json
Request:
{
  "date": "2024-12-01" // Opcional, por defecto hoy
}

Response:
{
  "habit": {
    "id": "uuid",
    "streak": 6,
    "last_completed": "2024-12-01",
    "completed_dates": ["...", "2024-12-01"]
  },
  "points_earned": 10,
  "new_total_points": 1260,
  "new_achievements": [] // Array de logros desbloqueados (si hay)
}
```

#### `DELETE /api/habits/:id/complete/:date`
Desmarcar hábito como completado

---

### Ranking

#### `GET /api/ranking/weekly`
Obtener ranking semanal

```json
Response:
{
  "week_start": "2024-11-25",
  "rankings": [
    {
      "position": 1,
      "user_id": "uuid",
      "name": "María García",
      "avatar": "https://...",
      "weekly_points": 450,
      "habits_completed": 35,
      "current_streak": 22,
      "is_current_user": false
    },
    {
      "position": 2,
      "user_id": "uuid",
      "name": "Juan Pérez",
      "avatar": "https://...",
      "weekly_points": 420,
      "habits_completed": 30,
      "current_streak": 15,
      "is_current_user": true
    }
  ],
  "total_users": 150,
  "user_position": 2
}
```

#### `GET /api/ranking/global`
Obtener ranking global por puntos totales

---

### Logros

#### `GET /api/achievements`
Obtener todos los logros disponibles

```json
Response:
{
  "achievements": [
    {
      "id": "uuid",
      "achievement_key": "racha_7",
      "name": "Primera Semana",
      "description": "Mantén una racha de 7 días consecutivos",
      "icon": "🔥",
      "category": "Racha",
      "requirement": "racha_7",
      "max_progress": 7,
      "points_bonus": 50
    }
  ]
}
```

#### `GET /api/users/me/achievements`
Obtener logros desbloqueados del usuario

```json
Response:
{
  "unlocked": [
    {
      "achievement_key": "racha_7",
      "unlocked_at": "2024-11-15T08:30:00Z"
    },
    {
      "achievement_key": "habits_5",
      "unlocked_at": "2024-11-20T14:20:00Z"
    }
  ],
  "progress": [
    {
      "achievement_key": "racha_30",
      "current_progress": 15,
      "max_progress": 30
    }
  ]
}
```

---

### Estadísticas

#### `GET /api/stats/weekly`
Obtener estadísticas semanales del usuario

```json
Response:
{
  "week_start": "2024-11-25",
  "points_earned": 420,
  "habits_completed": 30,
  "daily_activity": [
    { "date": "2024-11-25", "completed": 5 },
    { "date": "2024-11-26", "completed": 4 },
    { "date": "2024-11-27", "completed": 6 },
    { "date": "2024-11-28", "completed": 3 },
    { "date": "2024-11-29", "completed": 5 },
    { "date": "2024-11-30", "completed": 4 },
    { "date": "2024-12-01", "completed": 3 }
  ]
}
```

---

## 🔄 Queries SQL Útiles

### Obtener ranking semanal con posiciones
```sql
WITH current_week AS (
  SELECT DATE_TRUNC('week', CURRENT_DATE) AS week_start
),
user_rankings AS (
  SELECT 
    u.id,
    u.name,
    u.avatar,
    ws.points_earned as weekly_points,
    ws.habits_completed as weekly_completions,
    us.current_streak,
    RANK() OVER (ORDER BY ws.points_earned DESC) as position
  FROM users u
  JOIN weekly_stats ws ON u.id = ws.user_id
  JOIN user_stats us ON u.id = us.user_id
  CROSS JOIN current_week cw
  WHERE ws.week_start = cw.week_start
)
SELECT * FROM user_rankings
ORDER BY position
LIMIT 50;
```

### Verificar logros desbloqueados
```sql
-- Verificar logro de racha
SELECT 
  u.id,
  us.max_streak,
  CASE 
    WHEN us.max_streak >= 7 AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = u.id 
      AND ua.achievement_id = (SELECT id FROM achievements WHERE achievement_key = 'racha_7')
    ) THEN TRUE
    ELSE FALSE
  END as should_unlock_racha_7
FROM users u
JOIN user_stats us ON u.id = us.user_id;
```

### Actualizar estadísticas semanales
```sql
-- Esta query se debería ejecutar cada vez que se completa un hábito
INSERT INTO weekly_stats (user_id, week_start, points_earned, habits_completed)
VALUES ($1, DATE_TRUNC('week', CURRENT_DATE), $2, 1)
ON CONFLICT (user_id, week_start)
DO UPDATE SET 
  points_earned = weekly_stats.points_earned + EXCLUDED.points_earned,
  habits_completed = weekly_stats.habits_completed + 1,
  updated_at = NOW();
```

---

## 📝 Pasos para Integración

### 1. **Configurar Neon PostgreSQL**
   - Crear proyecto en [Neon](https://neon.tech)
   - Ejecutar los scripts SQL de creación de tablas
   - Guardar la connection string

### 2. **Implementar API Backend**
   - Crear servidor (Express/Fastify/etc.)
   - Conectar a Neon usando `pg` o un ORM (Prisma/Drizzle)
   - Implementar los endpoints listados arriba
   - Añadir autenticación JWT

### 3. **Actualizar Frontend**
   - Reemplazar localStorage con llamadas a API
   - Implementar estados de loading
   - Manejar errores de red
   - Actualizar useEffects para fetching de datos

### 4. **Testing**
   - Probar cada endpoint
   - Verificar sincronización de datos
   - Testear concurrencia (múltiples usuarios)

---

## 🎨 Archivos Frontend a Modificar

Al integrar el backend, actualizar estos archivos:

1. **`/App.tsx`**
   - Línea 57-67: Reemplazar estado inicial con fetch de `/api/users/me`
   - useEffect de habits: Reemplazar localStorage con `/api/habits`

2. **`/components/Ranking.tsx`**
   - Línea 156+: Implementar fetch de `/api/ranking/weekly`
   - Eliminar funciones de cálculo local si backend las provee

3. **`/components/Dashboard.tsx`**
   - Implementar fetch de `/api/stats/weekly`

4. **`/components/Achievements.tsx`**
   - Fetch de `/api/achievements` y `/api/users/me/achievements`

5. **`/components/HabitList.tsx`**
   - POST/PATCH/DELETE a `/api/habits`
   - POST a `/api/habits/:id/complete`

---

## ✅ Checklist de Integración

- [ ] Base de datos Neon creada
- [ ] Todas las tablas creadas
- [ ] Índices agregados
- [ ] Backend API implementado
- [ ] Autenticación JWT configurada
- [ ] Endpoints de usuarios implementados
- [ ] Endpoints de hábitos implementados
- [ ] Endpoints de ranking implementados
- [ ] Endpoints de logros implementados
- [ ] Frontend actualizado para usar API
- [ ] Estados de loading implementados
- [ ] Manejo de errores implementado
- [ ] Testing completo realizado

---

## 📞 Soporte

Para dudas sobre la integración, revisar los comentarios en cada componente marcados con `TODO BACKEND` y `BACKEND INTEGRATION NOTES`.
