import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Target, TrendingUp, Flame, Star, CheckCircle2, Circle, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyGoalSelector } from './DailyGoalSelector';
import type { Screen, Habit, UserProfile } from '../types';
import {
  calculateLevelProgress,
  calculateWeeklyActivity,
  calculateCompletedToday
} from '../utils/habitCalculations';

interface DashboardProps {
  habits: Habit[];
  userProfile: UserProfile;
  onNavigate: (screen: Screen) => void;
  onDailyGoalUpdate?: (newGoal: number) => Promise<void>;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/dashboard/ - Obtiene datos del usuario actual
 * - Datos requeridos:
 *   - Profile: puntos_totales, racha_actual, nivel, progreso_nivel, meta_diaria
 *   - HabitLog: registros últimos 7 días (para gráfico)
 *   - Habit: lista de hábitos activos del usuario
 *   - Achievement: logros desbloqueados
 * - Cálculos:
 *   - Nivel basado en puntos (ej: nivel = puntos // 100)
 *   - Progreso = (puntos % 100) para barra de nivel
 *   - Racha se calcula verificando HabitLog consecutivos
 */

export function Dashboard({ habits, userProfile, onNavigate, onDailyGoalUpdate }: DashboardProps) {
  // Load daily goal from userProfile (backend) instead of localStorage
  const [dailyGoal, setDailyGoal] = useState(userProfile.dailyGoal || 3);
  const [showGoalSelector, setShowGoalSelector] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // ===== CALCULAR DATOS EN TIEMPO REAL =====

  // Usar puntos del backend (fuente de verdad) en lugar de calcular localmente
  const currentPoints = userProfile.totalPoints;
  const currentLevel = userProfile.level;
  const levelProgress = calculateLevelProgress(currentPoints);
  const pointsForNextLevel = currentLevel * 100;

  // Calcular racha desde el perfil del backend
  const currentStreak = userProfile.currentStreak;

  // Calcular hábitos completados hoy
  const completedToday = calculateCompletedToday(habits);
  const totalToday = habits.length;

  // Calcular actividad semanal con datos reales
  const weeklyData = calculateWeeklyActivity(habits);

  // Calcular próximo logro de racha
  const nextStreakMilestone = currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : currentStreak < 100 ? 100 : (Math.floor(currentStreak / 100) + 1) * 100;
  const daysUntilMilestone = nextStreakMilestone - currentStreak;
  const streakProgress = (currentStreak / nextStreakMilestone) * 100;

  // Calcular hábitos faltantes para la meta diaria
  const habitsRemaining = Math.max(0, dailyGoal - completedToday);
  const dailyGoalProgress = totalToday > 0 ? (completedToday / dailyGoal) * 100 : 0;

  // Hábitos con estado de hoy
  const habitsWithTodayStatus = habits.map(habit => ({
    ...habit,
    completedToday: habit.completedDates.includes(today)
  }));

  // Guardar meta diaria en backend
  const handleGoalChange = async (newGoal: number) => {
    setDailyGoal(newGoal);
    if (onDailyGoalUpdate) {
      await onDailyGoalUpdate(newGoal);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 dark:text-white mb-2">
            ¡Bienvenido de vuelta, {userProfile.name}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Aquí está tu progreso de hoy. ¡Sigue así!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Points Card */}
          <Card className="card-stat bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Total
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Puntos totales</p>
                <p className="text-white truncate">{currentPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Streak Card */}
          <Card className="card-stat bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  🔥 Activa
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-orange-100 text-sm">Racha actual</p>
                <p className="text-white truncate">{currentStreak} días</p>
              </div>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card className="card-stat bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Nivel
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-green-100 text-sm">Nivel actual</p>
                <p className="text-white truncate">{currentLevel}</p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress Card */}
          <Card className="card-stat bg-gradient-to-br from-purple-500 to-indigo-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Hoy
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm">Hábitos completados</p>
                <p className="text-white truncate">{completedToday}/{totalToday}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card className="card-level-progress dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="dark:text-white">Progreso de nivel</CardTitle>
                  <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {currentPoints} / {pointsForNextLevel} pts
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {Math.max(0, pointsForNextLevel - currentPoints)} puntos para nivel {currentLevel + 1}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity Chart */}
            <Card className="card-weekly-chart dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Actividad semanal</CardTitle>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Hábitos completados en los últimos 7 días
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[300px]">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="day"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        name="Hábitos completados"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Today's Habits */}
            <Card className="card-habits-list dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Hábitos del día</CardTitle>
                  <Button onClick={() => onNavigate('progress')} variant="ghost" size="sm" className="dark:text-neutral-300 dark:hover:text-white">
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {habits.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      No tienes hábitos todavía
                    </p>
                    <Button onClick={() => onNavigate('habits')} size="sm" className="btn-primary">
                      Crear mi primer hábito
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habitsWithTodayStatus.map((habit) => (
                      <div
                        key={habit.id}
                        className="habit-item-today flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {habit.completedToday ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
                          )}
                          <span className={`truncate ${habit.completedToday ? 'text-neutral-500 dark:text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'}`}>
                            {habit.name}
                          </span>
                        </div>
                        <Badge variant={habit.completedToday ? "secondary" : "default"} className="badge-points flex-shrink-0 text-xs">
                          +{habit.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Daily Goal Card */}
            <Card className="card-daily-goal bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0 dark:border dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Meta diaria</CardTitle>
                  <Button
                    onClick={() => setShowGoalSelector(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 dark:text-neutral-300 dark:hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-neutral-900 dark:text-white">
                      {dailyGoal} hábitos al día
                    </span>
                  </div>
                  <Progress value={Math.min(100, dailyGoalProgress)} className="h-2" />
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm text-center">
                    {completedToday} / {dailyGoal} completados hoy
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Card - "Casi llegas" */}
            {habitsRemaining > 0 && totalToday > 0 ? (
              <Card className="card-motivation border-2 border-yellow-200 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">
                    {habitsRemaining === 1 ? '🎯' : habitsRemaining <= 3 ? '💪' : '🚀'}
                  </div>
                  <h3 className="text-neutral-900 dark:text-white">
                    {habitsRemaining === 1 ? '¡Último esfuerzo!' : '¡Casi llegas!'}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    {habitsRemaining === 1
                      ? 'Completa 1 hábito más para alcanzar tu meta diaria'
                      : `Completa ${habitsRemaining} hábitos más para alcanzar tu meta diaria`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : completedToday >= dailyGoal && totalToday > 0 ? (
              <Card className="card-motivation border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">🎉</div>
                  <h3 className="text-neutral-900 dark:text-white">¡Meta alcanzada!</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    Has completado tu meta diaria. ¡Excelente trabajo!
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {/* Quick Actions Card */}
            <Card className="card-quick-actions bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-700 border-0 dark:border dark:border-slate-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => onNavigate('progress')} className="w-full btn-primary justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Registrar progreso</span>
                </Button>
                <Button onClick={() => onNavigate('habits')} variant="outline" className="w-full btn-secondary justify-start gap-2 dark:border-slate-600 dark:text-neutral-300 dark:hover:text-white">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Mis hábitos</span>
                </Button>
                <Button onClick={() => onNavigate('ranking')} variant="outline" className="w-full btn-secondary justify-start gap-2 dark:border-slate-600 dark:text-neutral-300 dark:hover:text-white">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Ver ranking</span>
                </Button>
                <Button onClick={() => onNavigate('achievements')} variant="outline" className="w-full btn-secondary justify-start gap-2 dark:border-slate-600 dark:text-neutral-300 dark:hover:text-white">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Mis logros</span>
                </Button>
              </CardContent>
            </Card>

            {/* Next Achievement - Racha */}
            <Card className="card-next-achievement dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base dark:text-white">Próximo logro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-white mb-1">
                      Racha de {nextStreakMilestone} días
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {daysUntilMilestone === 0
                        ? '¡Logro alcanzado!'
                        : `${daysUntilMilestone} ${daysUntilMilestone === 1 ? 'día restante' : 'días restantes'}`
                      }
                    </p>
                  </div>
                  <Progress value={Math.min(100, streakProgress)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Daily Goal Selector Modal */}
      {showGoalSelector && (
        <DailyGoalSelector
          currentGoal={dailyGoal}
          onGoalChange={handleGoalChange}
          onClose={() => setShowGoalSelector(false)}
        />
      )}
    </div>
  );
}