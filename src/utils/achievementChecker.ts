import type { Habit } from '../App';
import { calculateTotalCompletions } from './habitCalculations';
import { achievementDefinitions } from './achievementDefinitions';

/**
 * Verifica qué logros deben estar desbloqueados según los datos actuales del usuario
 * Retorna array de IDs de logros que cumplen los requisitos
 */
export function checkUnlockedAchievements(
  habits: Habit[],
  totalPoints: number,
  maxStreak: number
): string[] {
  const unlockedIds: string[] = [];
  const totalCompletions = calculateTotalCompletions(habits);
  const habitsCount = habits.length;

  achievementDefinitions.forEach(achievement => {
    let isUnlocked = false;

    // Verificar requisito según el tipo
    if (achievement.requirement.startsWith('racha_')) {
      const requiredStreak = achievement.maxProgress;
      isUnlocked = maxStreak >= requiredStreak;
    } else if (achievement.requirement.startsWith('habits_')) {
      const requiredHabits = achievement.maxProgress;
      isUnlocked = habitsCount >= requiredHabits;
    } else if (achievement.requirement.startsWith('completed_')) {
      const requiredCompletions = achievement.maxProgress;
      isUnlocked = totalCompletions >= requiredCompletions;
    } else if (achievement.requirement.startsWith('points_')) {
      const requiredPoints = achievement.maxProgress;
      // Usar totalPoints sin incluir achievementPoints para evitar recursión
      isUnlocked = totalPoints >= requiredPoints;
    }
    // Logros especiales por ahora no implementados

    if (isUnlocked) {
      unlockedIds.push(achievement.id);
    }
  });

  return unlockedIds;
}

/**
 * Detecta nuevos logros que se acaban de desbloquear
 * Retorna array de IDs de logros nuevos
 */
export function detectNewAchievements(
  previousUnlocked: string[],
  currentUnlocked: string[]
): string[] {
  return currentUnlocked.filter(id => !previousUnlocked.includes(id));
}
