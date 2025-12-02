import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, TrendingUp, Target, Medal, Users } from 'lucide-react';
import type { Habit, UserProfile } from '../types';

/**
 * BACKEND INTEGRATION GUIDE
 * =========================
 * 
 * Esta sección está lista para integrarse con Neon PostgreSQL u otra base de datos.
 * 
 * API Endpoints necesarios:
 * 
 * 1. GET /api/ranking/weekly
 *    Descripción: Obtiene el ranking semanal de todos los usuarios registrados
 *    Response: {
 *      rankings: [
 *        {
 *          user_id: string,
 *          name: string,
 *          avatar: string,
 *          total_points: number,
 *          weekly_points: number,
 *          weekly_completions: number,
 *          current_streak: number
 *        }
 *      ],
 *      user_position: number,
 *      total_users: number,
 *      week_start: string (ISO date)
 *    }
 * 
 * 2. GET /api/ranking/global
 *    Descripción: Obtiene el ranking global por puntos totales
 *    Response: Similar a /api/ranking/weekly
 * 
 * 3. GET /api/users/me/stats
 *    Descripción: Obtiene estadísticas del usuario actual
 *    Response: {
 *      total_points: number,
 *      weekly_points: number,
 *      weekly_completions: number,
 *      current_streak: number,
 *      level: number,
 *      position_in_ranking: number
 *    }
 * 
 * Database Schema (Neon PostgreSQL):
 * 

interface RankingProps {
  habits: Habit[];
  userProfile: UserProfile;
  // TODO: Cuando se integre el backend, descomentar:
  // rankingData?: RankingEntry[];
  // isLoading?: boolean;
  // error?: string | null;
}
*/

interface RankingEntry {
  id: string;
  position: number;
  name: string;
  avatar: string;
  points: number;
  habitsCompleted: number;
  streak: number;
  isCurrentUser?: boolean;
}

// Función auxiliar para obtener el inicio de la semana actual (lunes)
function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Función para convertir fecha ISO string a Date para comparación
function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Función para calcular puntos semanales del usuario
// TODO: Reemplazar con datos del backend (GET /api/users/me/stats)
function calculateWeeklyPoints(habits: Habit[]): number {
  const weekStart = getWeekStart();
  let weeklyPoints = 0;

  habits.forEach(habit => {
    const weeklyCompletions = habit.completedDates.filter(dateStr => {
      const date = parseISODate(dateStr);
      return date >= weekStart;
    }).length;

    weeklyPoints += weeklyCompletions * habit.points;
  });

  return weeklyPoints;
}

// Función para calcular hábitos completados esta semana
// TODO: Reemplazar con datos del backend (GET /api/users/me/stats)
function calculateWeeklyCompletions(habits: Habit[]): number {
  const weekStart = getWeekStart();
  let total = 0;

  habits.forEach(habit => {
    const completionsThisWeek = habit.completedDates.filter(dateStr => {
      const date = parseISODate(dateStr);
      return date >= weekStart;
    }).length;
    total += completionsThisWeek;
  });

  return total;
}

export function Ranking({ habits, userProfile }: RankingProps) {
  // Calcular datos del usuario para la semana actual
  // TODO: Reemplazar con datos del backend
  const userWeeklyPoints = useMemo(() => calculateWeeklyPoints(habits), [habits]);
  const userWeeklyCompletions = useMemo(() => calculateWeeklyCompletions(habits), [habits]);

  // TODO: Cuando se integre el backend, usar:
  // const { data: rankingData, isLoading, error } = useFetchRanking();

  // Por ahora, crear entrada solo del usuario actual (sin datos mock)
  const rankingData = useMemo(() => {
    const userEntry: RankingEntry = {
      id: 'current-user',
      position: 1, // TODO: Obtener desde el backend
      name: userProfile.name,
      avatar: userProfile.avatar,
      points: userProfile.totalPoints,
      habitsCompleted: userWeeklyCompletions,
      streak: userProfile.currentStreak,
      isCurrentUser: true,
    };

    return [userEntry];
  }, [userProfile, userWeeklyCompletions]);

  const currentUser = rankingData.find(u => u.isCurrentUser);

  // Solo mostrar si hay datos del backend
  const hasRankingData = rankingData.length > 1; // Más de solo el usuario actual
  const topThree = rankingData.slice(0, 3);
  const restOfRanking = rankingData.slice(3);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 dark:text-white mb-2">Ranking Semanal</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Compite con otros usuarios y alcanza el top 3
          </p>
        </div>

        {/* Current User Stats Card */}
        {currentUser && (
          <Card className="card-user-position mb-6 bg-gradient-to-br from-blue-500 to-purple-500 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Posición actual */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-1">Tu posición</p>
                    <p className="text-white text-lg sm:text-xl">
                      {hasRankingData ? `#${currentUser.position}` : 'Esperando datos...'}
                    </p>
                  </div>
                </div>

                {/* Puntos totales */}
                <div className="text-center sm:border-l sm:border-white/20 pl-0 sm:pl-4">
                  <p className="text-blue-100 text-xs sm:text-sm mb-1">Puntos totales</p>
                  <p className="text-white text-2xl sm:text-3xl">{userProfile.totalPoints}</p>
                  <p className="text-blue-100 text-xs mt-1">Nivel {userProfile.level}</p>
                </div>

                {/* Puntos esta semana */}
                <div className="text-center sm:border-l sm:border-white/20 pl-0 sm:pl-4">
                  <p className="text-blue-100 text-xs sm:text-sm mb-1">Esta semana</p>
                  <p className="text-white text-2xl sm:text-3xl">{userWeeklyPoints}</p>
                  <p className="text-blue-100 text-xs mt-1">{userWeeklyCompletions} hábitos completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">
              Semana del {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          {hasRankingData && (
            <Badge variant="secondary" className="badge-week text-xs dark:bg-neutral-700 dark:text-neutral-200">
              Actualizado en vivo
            </Badge>
          )}
        </div>

        {/* Estado vacío - Sin datos del backend */}
        {!hasRankingData && (
          <Card className="card-empty-state bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 dark:bg-neutral-800 dark:border dark:border-neutral-700">
            <CardContent className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="space-y-3">
                <h3 className="text-neutral-900 dark:text-white text-xl sm:text-2xl">
                  Ranking en construcción
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-md mx-auto">
                  El ranking se activará cuando haya usuarios registrados en la base de datos.
                  Por ahora, solo puedes ver tus propias estadísticas.
                </p>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                    <span>Backend: Pendiente de integración</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                    <span>Base de datos: No conectada</span>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-neutral-700/50 rounded-lg p-4 max-w-lg mx-auto">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 text-left">
                    <strong className="text-neutral-900 dark:text-white">Para desarrolladores:</strong><br />
                    Esta sección está lista para integrarse con Neon PostgreSQL.
                    Consulta los comentarios en el código para ver la estructura de API y base de datos necesaria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium - Solo si hay datos del backend */}
        {hasRankingData && topThree.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {topThree.map((user) => (
              <Card
                key={user.id}
                className={`card-podium ${user.position === 1
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 dark:bg-neutral-800'
                    : user.position === 2
                      ? 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 border-2 border-gray-300 dark:border-gray-700 dark:bg-neutral-800'
                      : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-300 dark:border-orange-700 dark:bg-neutral-800'
                  }`}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white dark:border-neutral-700 shadow-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="dark:bg-neutral-700 dark:text-white">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="text-2xl sm:text-3xl">{getMedalIcon(user.position)}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-neutral-900 dark:text-white mb-1 truncate">{user.name}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">Posición {user.position}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <span className="text-yellow-700 dark:text-yellow-400 text-sm sm:text-base">{user.points} puntos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                      <Target className="w-4 h-4 flex-shrink-0" />
                      <span>{user.habitsCompleted} hábitos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rest of Ranking - Solo si hay más de 3 usuarios */}
        {hasRankingData && restOfRanking.length > 0 && (
          <Card className="card-ranking-list dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Ranking completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {restOfRanking.map((user) => (
                  <div
                    key={user.id}
                    className={`ranking-item flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors ${user.isCurrentUser
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700'
                        : 'bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                      }`}
                  >
                    {/* Position */}
                    <div className="w-8 sm:w-12 text-center flex-shrink-0">
                      <span className={`text-sm sm:text-base ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        #{user.position}
                      </span>
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${user.isCurrentUser ? 'border-2 border-blue-500 dark:border-blue-400' : ''}`}>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="dark:bg-neutral-700 dark:text-white">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-neutral-900 dark:text-white truncate text-sm sm:text-base">
                          {user.name}
                          {user.isCurrentUser && (
                            <Badge variant="secondary" className="ml-2 badge-you text-xs dark:bg-blue-700 dark:text-white">
                              Tú
                            </Badge>
                          )}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm truncate">
                          {user.habitsCompleted} hábitos completados
                        </p>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="hidden sm:flex items-center gap-2 text-orange-600 dark:text-orange-400 flex-shrink-0">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{user.streak} días</span>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm sm:text-base ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-900 dark:text-white'}`}>
                        {user.points}
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="card-ranking-info mt-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <CardContent className="p-4 sm:p-6 text-center space-y-3">
            <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto" />
            <h3 className="text-neutral-900 dark:text-white">Cómo funciona el ranking</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm max-w-2xl mx-auto">
              El ranking se actualiza en tiempo real basado en los puntos que ganas al completar tus hábitos.
              Cada lunes comienza una nueva semana de competencia. ¡Los top 3 reciben medallas especiales!
            </p>
            {!hasRankingData && (
              <p className="text-neutral-500 dark:text-neutral-400 text-xs italic pt-2">
                * El ranking se activará automáticamente cuando se conecte la base de datos y haya usuarios registrados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
