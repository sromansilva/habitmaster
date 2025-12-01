import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Target, Check } from 'lucide-react';

interface DailyGoalSelectorProps {
  currentGoal: number;
  onGoalChange: (goal: number) => void;
  onClose: () => void;
}

const GOAL_OPTIONS = [
  { value: 1, label: 'Casual', description: '1 hábito al día', emoji: '☕' },
  { value: 3, label: 'Regular', description: '3 hábitos al día', emoji: '🎯' },
  { value: 5, label: 'Serio', description: '5 hábitos al día', emoji: '💪' },
  { value: 7, label: 'Intenso', description: '7 hábitos al día', emoji: '🔥' },
];

/**
 * DJANGO BACKEND NOTES:
 * - POST /api/profile/daily-goal/ - Actualiza la meta diaria del usuario
 * - Campo: Profile.daily_goal (Integer)
 * - Esta meta se usa para calcular el progreso diario
 */

export function DailyGoalSelector({ currentGoal, onGoalChange, onClose }: DailyGoalSelectorProps) {
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);

  const handleSave = () => {
    onGoalChange(selectedGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Establece tu meta diaria
          </CardTitle>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            ¿Cuántos hábitos quieres completar cada día?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal Options */}
          <div className="space-y-3">
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedGoal(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedGoal === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <p className="text-neutral-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {selectedGoal === option.value && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Goal Input */}
          <div className="border-t pt-4 dark:border-neutral-700">
            <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              O elige una meta personalizada:
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-neutral-700 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 btn-primary">
              Guardar meta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
