# Ejemplos de Código para Integración Backend

Este archivo contiene ejemplos prácticos de código para integrar HabitMaster con Neon PostgreSQL.

---

## 📦 Ejemplo 1: Servicio de API (Frontend)

Crear archivo `/services/api.ts`:

```typescript
// /services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper para manejar errores
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// Helper para headers con autenticación
function getHeaders(): HeadersInit {
  const token = localStorage.getItem('habitmaster_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// ==================== AUTENTICACIÓN ====================

export async function register(data: { email: string; password: string; name: string }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<{ user: any; token: string }>(response);
  localStorage.setItem('habitmaster_token', result.token);
  return result.user;
}

export async function login(data: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<{ user: any; token: string }>(response);
  localStorage.setItem('habitmaster_token', result.token);
  return result.user;
}

export async function logout() {
  localStorage.removeItem('habitmaster_token');
}

// ==================== USUARIOS ====================

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateProfile(data: Partial<{ name: string; bio: string; avatar: string }>) {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// ==================== HÁBITOS ====================

export async function getHabits() {
  const response = await fetch(`${API_URL}/habits`, {
    headers: getHeaders(),
  });
  return handleResponse<{ habits: any[] }>(response);
}

export async function createHabit(data: {
  name: string;
  description: string;
  category: string;
  frequency: number;
  points: number;
}) {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateHabit(id: string, data: Partial<{
  name: string;
  description: string;
  category: string;
  frequency: number;
  points: number;
}>) {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteHabit(id: string) {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function completeHabit(id: string, date?: string) {
  const response = await fetch(`${API_URL}/habits/${id}/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] }),
  });
  return handleResponse(response);
}

export async function uncompleteHabit(id: string, date: string) {
  const response = await fetch(`${API_URL}/habits/${id}/complete/${date}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// ==================== RANKING ====================

export async function getWeeklyRanking() {
  const response = await fetch(`${API_URL}/ranking/weekly`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getGlobalRanking() {
  const response = await fetch(`${API_URL}/ranking/global`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// ==================== LOGROS ====================

export async function getAllAchievements() {
  const response = await fetch(`${API_URL}/achievements`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getUserAchievements() {
  const response = await fetch(`${API_URL}/users/me/achievements`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// ==================== ESTADÍSTICAS ====================

export async function getWeeklyStats() {
  const response = await fetch(`${API_URL}/stats/weekly`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}
```

---

## 🔧 Ejemplo 2: Actualizar App.tsx

```typescript
// /App.tsx - Fragmentos actualizados

import { getCurrentUser, getHabits } from './services/api';

export default function App() {
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);

  // Cargar usuario desde backend
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('habitmaster_token');
      if (!token) return;

      setIsLoadingUser(true);
      try {
        const userData = await getCurrentUser();
        setUserProfile({
          name: userData.name,
          email: userData.email,
          bio: userData.bio,
          avatar: userData.avatar,
          totalPoints: userData.stats.total_points,
          level: userData.stats.level,
          currentStreak: userData.stats.current_streak,
          maxStreak: userData.stats.max_streak,
          memberSince: userData.member_since,
          unlockedAchievements: userData.unlocked_achievements,
          achievementPoints: userData.stats.achievement_points,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('habitmaster_token');
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // Cargar hábitos desde backend
  useEffect(() => {
    const loadHabits = async () => {
      if (!isAuthenticated) return;

      setIsLoadingHabits(true);
      try {
        const data = await getHabits();
        setHabits(data.habits.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description,
          category: h.category,
          frequency: h.frequency,
          points: h.points,
          streak: h.streak,
          lastCompleted: h.last_completed,
          completedDates: h.completed_dates,
          createdAt: h.created_at,
        })));
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setIsLoadingHabits(false);
      }
    };

    loadHabits();
  }, [isAuthenticated]);

  // Actualizar login
  const handleLogin = async (name?: string, email?: string, password?: string) => {
    try {
      let userData;
      if (name && email && password) {
        // Registro
        userData = await register({ name, email, password });
      } else if (email && password) {
        // Login
        userData = await login({ email, password });
      }

      // Actualizar estado local
      setUserProfile({
        name: userData.name,
        email: userData.email,
        bio: userData.bio || '',
        avatar: userData.avatar,
        totalPoints: userData.stats.total_points,
        level: userData.stats.level,
        currentStreak: userData.stats.current_streak,
        maxStreak: userData.stats.max_streak,
        memberSince: userData.created_at,
        unlockedAchievements: userData.unlocked_achievements || [],
        achievementPoints: userData.stats.achievement_points,
      });

      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
    }
  };

  // Actualizar handleSaveHabit
  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabitId) {
        const updated = await updateHabit(editingHabitId, habitData);
        setHabits(prev => prev.map(h => h.id === editingHabitId ? updated : h));
      } else {
        const created = await createHabit(habitData);
        setHabits(prev => [...prev, created]);
      }
      setCurrentScreen('habits');
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error('Error al guardar hábito');
    }
  };

  // Actualizar handleToggleHabitComplete
  const handleToggleHabitComplete = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.completedDates.includes(today);

    try {
      if (isCompleted) {
        await uncompleteHabit(habitId, today);
      } else {
        const result = await completeHabit(habitId);
        
        // Verificar si desbloqueó logros
        if (result.new_achievements && result.new_achievements.length > 0) {
          result.new_achievements.forEach(achievement => {
            if (pushNotifications) {
              toast.success('🏆 ¡Nuevo logro desbloqueado!', {
                description: `${achievement.name} - +${achievement.points_bonus} puntos`,
              });
            }
          });
        }
      }

      // Recargar hábitos
      const data = await getHabits();
      setHabits(data.habits);
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Error al actualizar hábito');
    }
  };
}
```

---

## 🗄️ Ejemplo 3: Backend API (Node.js + Express)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Configurar Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTENTICACIÓN ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const userResult = await pool.query(
      `INSERT INTO users (email, name, avatar, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, name, avatar, created_at`,
      [email, name, `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`]
    );

    const user = userResult.rows[0];

    // Crear estadísticas iniciales
    await pool.query(
      `INSERT INTO user_stats (user_id, total_points, achievement_points, level, current_streak, max_streak)
       VALUES ($1, 0, 0, 1, 0, 0)`,
      [user.id]
    );

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, us.total_points, us.achievement_points, us.current_streak, us.max_streak, us.level
       FROM users u
       JOIN user_stats us ON u.id = us.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña (por ahora asumimos que está guardada)
    // En producción, verificar con bcrypt.compare(password, user.password_hash)

    // Obtener logros desbloqueados
    const achievementsResult = await pool.query(
      `SELECT a.achievement_key
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        stats: {
          total_points: user.total_points,
          achievement_points: user.achievement_points,
          current_streak: user.current_streak,
          max_streak: user.max_streak,
          level: user.level,
        },
        unlocked_achievements: achievementsResult.rows.map(r => r.achievement_key),
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// ==================== HÁBITOS ====================

app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, 
              COALESCE(
                json_agg(hl.completed_date ORDER BY hl.completed_date) FILTER (WHERE hl.completed_date IS NOT NULL),
                '[]'
              ) as completed_dates
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id
       WHERE h.user_id = $1
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    const habits = result.rows.map(h => ({
      id: h.id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      points: h.points,
      streak: h.streak,
      last_completed: h.last_completed,
      completed_dates: h.completed_dates,
      created_at: h.created_at,
    }));

    res.json({ habits });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Error al obtener hábitos' });
  }
});

app.post('/api/habits', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, frequency, points } = req.body;

    const result = await pool.query(
      `INSERT INTO habits (user_id, name, description, category, frequency, points, streak, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, NOW())
       RETURNING *`,
      [req.user.id, name, description, category, frequency, points]
    );

    const habit = result.rows[0];

    res.json({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      points: habit.points,
      streak: 0,
      last_completed: null,
      completed_dates: [],
      created_at: habit.created_at,
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Error al crear hábito' });
  }
});

app.post('/api/habits/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const completedDate = date || new Date().toISOString().split('T')[0];

    // Verificar que el hábito pertenece al usuario
    const habitResult = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    const habit = habitResult.rows[0];

    // Insertar log de completación
    await pool.query(
      `INSERT INTO habit_logs (habit_id, user_id, completed_date, points_earned)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (habit_id, completed_date) DO NOTHING`,
      [id, req.user.id, completedDate, habit.points]
    );

    // Actualizar last_completed del hábito
    await pool.query(
      'UPDATE habits SET last_completed = $1 WHERE id = $2',
      [completedDate, id]
    );

    // Actualizar puntos del usuario
    await pool.query(
      'UPDATE user_stats SET total_points = total_points + $1 WHERE user_id = $2',
      [habit.points, req.user.id]
    );

    // Actualizar estadísticas semanales
    await pool.query(
      `INSERT INTO weekly_stats (user_id, week_start, points_earned, habits_completed)
       VALUES ($1, DATE_TRUNC('week', CURRENT_DATE), $2, 1)
       ON CONFLICT (user_id, week_start)
       DO UPDATE SET
         points_earned = weekly_stats.points_earned + EXCLUDED.points_earned,
         habits_completed = weekly_stats.habits_completed + 1`,
      [req.user.id, habit.points]
    );

    // TODO: Verificar logros y desbloquear si corresponde

    res.json({ success: true });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ message: 'Error al completar hábito' });
  }
});

// ==================== RANKING ====================

app.get('/api/ranking/weekly', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH current_week AS (
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
      SELECT 
        *,
        CASE WHEN id = $1 THEN true ELSE false END as is_current_user
      FROM user_rankings
      ORDER BY position
      LIMIT 50`,
      [req.user.id]
    );

    res.json({
      week_start: new Date().toISOString().split('T')[0],
      rankings: result.rows,
      total_users: result.rows.length,
    });
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ message: 'Error al obtener ranking' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## 🎯 Ejemplo 4: Hook Personalizado para Fetching

```typescript
// /hooks/useApi.ts
import { useState, useEffect } from 'react';

export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

// Uso en componentes:
import { useApi } from '../hooks/useApi';
import { getHabits } from '../services/api';

function HabitList() {
  const { data, loading, error, refetch } = useApi(() => getHabits(), []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.habits.map(habit => (
        <div key={habit.id}>{habit.name}</div>
      ))}
    </div>
  );
}
```

---

Estos ejemplos proporcionan una base sólida para integrar HabitMaster con Neon PostgreSQL. Adapta según tus necesidades específicas.
