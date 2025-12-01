import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import type { Habit, UserProfile } from '../types';
import { calculateTotalCompletions } from '../utils/habitCalculations';
import { achievementDefinitions } from '../utils/achievementDefinitions';

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/achievements/ - Lista de todos los logros posibles
 * - GET /api/achievements/user/ - Logros desbloqueados del usuario
 * - Modelo Achievement:
 *   - id, nombre, descripcion, icono, tipo
 *   - requisito (ej: "racha_7", "racha_30", "racha_100")
 *   - puntos_bonus
 * - Modelo UserAchievement:
 *   - id, user_id, achievement_id, fecha_desbloqueo
 * 
 * Lógica de backend:
 * - Al completar hábitos, verificar si se cumplen requisitos de logros
 * - Crear UserAchievement cuando se desbloquea
 * - Sumar puntos bonus al Profile del usuario
 * - Notificar al usuario cuando desbloquea un logro
 */

interface AchievementsProps {
  habits: Habit[];
  userProfile: UserProfile;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  pointsBonus: number;
}

// Función para calcular el progreso de cada logro basado en los datos del usuario
function calculateAchievements(habits: Habit[], userProfile: UserProfile): Achievement[] {
  const totalCompletions = calculateTotalCompletions(habits);
  const habitsCount = habits.length;
  const currentStreak = userProfile.currentStreak;
  const maxStreak = userProfile.maxStreak;
  const totalPoints = userProfile.totalPoints;

  return achievementDefinitions.map(def => {
    let progress = 0;

    // Calcular progreso según el tipo de logro
    if (def.requirement.startsWith('racha_')) {
      progress = Math.min(maxStreak, def.maxProgress);
    } else if (def.requirement.startsWith('habits_')) {
      progress = Math.min(habitsCount, def.maxProgress);
    } else if (def.requirement.startsWith('completed_')) {
      progress = Math.min(totalCompletions, def.maxProgress);
    } else if (def.requirement.startsWith('points_')) {
      progress = Math.min(totalPoints, def.maxProgress);
    } else {
      // Logros especiales - por ahora sin implementar
      progress = 0;
    }

    const unlocked = progress >= def.maxProgress;

    return {
      ...def,
      progress,
      unlocked,
      unlockedDate: unlocked ? new Date().toISOString().split('T')[0] : undefined,
    };
  });
}

export function Achievements({ habits, userProfile }: AchievementsProps) {
  // Calcular logros dinámicamente basados en los datos del usuario
  const achievements = useMemo(() =>
    calculateAchievements(habits, userProfile),
    [habits, userProfile.currentStreak, userProfile.maxStreak, userProfile.totalPoints]
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-neutral-900 dark:text-white mb-2">Logros y Medallas</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Desbloquea medallas especiales completando desafíos
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="card-achievements-progress mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 dark:bg-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-neutral-900 dark:text-white mb-2">
                Progreso general de logros
              </p>
              <div className="flex items-center gap-4">
                <Progress value={(unlockedCount / totalCount) * 100} className="h-3 flex-1" />
                <span className="text-neutral-900 dark:text-white">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
            Has desbloqueado {unlockedCount} de {totalCount} logros disponibles. ¡Sigue así para completar la colección!
          </p>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {categories.map((category) => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => a.unlocked).length;

        return (
          <div key={category} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-900 dark:text-white">{category}</h2>
              <Badge variant="secondary" className="badge-category-progress dark:bg-neutral-700 dark:text-neutral-200">
                {categoryUnlocked}/{categoryAchievements.length}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`card-achievement ${achievement.unlocked
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 dark:bg-neutral-800'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${achievement.unlocked
                            ? 'bg-white dark:bg-neutral-700 shadow-sm'
                            : 'bg-neutral-200 dark:bg-neutral-700 grayscale opacity-50'
                          }`}
                      >
                        {achievement.icon}
                      </div>
                      {achievement.unlocked ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3
                        className={
                          achievement.unlocked
                            ? 'text-neutral-900 dark:text-white mb-1'
                            : 'text-neutral-600 dark:text-neutral-400 mb-1'
                        }
                      >
                        {achievement.name}
                      </h3>
                      <p
                        className={`text-sm ${achievement.unlocked ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                      >
                        {achievement.description}
                      </p>
                    </div>

                    {/* Progress or Unlocked Date */}
                    {achievement.unlocked ? (
                      <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                        <span className="text-green-700 dark:text-green-400 text-sm">
                          Desbloqueado
                        </span>
                        <Badge variant="secondary" className="badge-points bg-green-600 dark:bg-green-700 text-white">
                          +{achievement.pointsBonus} pts
                        </Badge>
                      </div>
                    ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-300">Progreso</span>
                          <span className="text-neutral-900 dark:text-white">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                            {achievement.maxProgress - achievement.progress} restantes
                          </span>
                          <Badge variant="outline" className="badge-bonus text-xs dark:border-neutral-600">
                            +{achievement.pointsBonus} pts
                          </Badge>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Motivational Card */}
      <Card className="card-achievement-motivation bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 dark:bg-neutral-800 dark:border-neutral-700">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl">🎯</div>
          <h3 className="text-neutral-900 dark:text-white">¡Sigue desbloqueando logros!</h3>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Cada logro desbloqueado te otorga puntos bonus y te acerca a convertirte en un maestro de los hábitos.
            Mantén tu racha activa y completa tus hábitos diarios para desbloquear medallas especiales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}