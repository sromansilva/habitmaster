/**
 * Definiciones de todos los logros disponibles en la aplicación
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  maxProgress: number;
  pointsBonus: number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  // Streak Achievements
  { id: '1', name: 'Primera Semana', description: 'Mantén una racha de 7 días consecutivos', icon: '🔥', category: 'Racha', requirement: 'racha_7', maxProgress: 7, pointsBonus: 50 },
  { id: '2', name: 'Mes Imparable', description: 'Mantén una racha de 30 días consecutivos', icon: '⚡', category: 'Racha', requirement: 'racha_30', maxProgress: 30, pointsBonus: 200 },
  { id: '3', name: 'Leyenda', description: 'Mantén una racha de 100 días consecutivos', icon: '👑', category: 'Racha', requirement: 'racha_100', maxProgress: 100, pointsBonus: 1000 },
  
  // Habit Achievements
  { id: '4', name: 'Coleccionista', description: 'Crea 5 hábitos diferentes', icon: '📝', category: 'Hábitos', requirement: 'habits_5', maxProgress: 5, pointsBonus: 100 },
  { id: '5', name: 'Maestro de Hábitos', description: 'Crea 10 hábitos diferentes', icon: '🎯', category: 'Hábitos', requirement: 'habits_10', maxProgress: 10, pointsBonus: 250 },
  { id: '16', name: 'Experto', description: 'Crea 20 hábitos diferentes', icon: '🎓', category: 'Hábitos', requirement: 'habits_20', maxProgress: 20, pointsBonus: 500 },
  
  // Completion Achievements
  { id: '6', name: 'Primeros Pasos', description: 'Completa 10 hábitos en total', icon: '✅', category: 'Completados', requirement: 'completed_10', maxProgress: 10, pointsBonus: 30 },
  { id: '7', name: 'Consistencia', description: 'Completa 50 hábitos en total', icon: '💪', category: 'Completados', requirement: 'completed_50', maxProgress: 50, pointsBonus: 150 },
  { id: '8', name: 'Imparable', description: 'Completa 100 hábitos en total', icon: '🚀', category: 'Completados', requirement: 'completed_100', maxProgress: 100, pointsBonus: 300 },
  { id: '9', name: 'Campeón', description: 'Completa 500 hábitos en total', icon: '🏆', category: 'Completados', requirement: 'completed_500', maxProgress: 500, pointsBonus: 1500 },
  
  // Points Achievements
  { id: '10', name: 'Novato', description: 'Alcanza 100 puntos totales', icon: '⭐', category: 'Puntos', requirement: 'points_100', maxProgress: 100, pointsBonus: 20 },
  { id: '11', name: 'Competidor', description: 'Alcanza 1000 puntos totales', icon: '💎', category: 'Puntos', requirement: 'points_1000', maxProgress: 1000, pointsBonus: 200 },
  { id: '12', name: 'Maestro', description: 'Alcanza 5000 puntos totales', icon: '🌟', category: 'Puntos', requirement: 'points_5000', maxProgress: 5000, pointsBonus: 1000 },
  { id: '17', name: 'Leyenda de Puntos', description: 'Alcanza 10000 puntos totales', icon: '💫', category: 'Puntos', requirement: 'points_10000', maxProgress: 10000, pointsBonus: 2500 },
  
  // Special Achievements
  { id: '13', name: 'Madrugador', description: 'Completa 10 hábitos antes de las 8 AM', icon: '🌅', category: 'Especial', requirement: 'early_bird_10', maxProgress: 10, pointsBonus: 150 },
  { id: '14', name: 'Fin de Semana Activo', description: 'Completa todos tus hábitos un sábado y domingo', icon: '🎉', category: 'Especial', requirement: 'weekend_warrior', maxProgress: 1, pointsBonus: 100 },
  { id: '15', name: 'Perfección', description: 'Completa todos tus hábitos del día por 7 días seguidos', icon: '✨', category: 'Especial', requirement: 'perfect_week', maxProgress: 7, pointsBonus: 500 },
];

/**
 * Obtiene la definición de un logro por su ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return achievementDefinitions.find(a => a.id === id);
}
