import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, Info, Save } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import type { Habit } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

interface HabitFormProps {
  habitId: string | null; // null = crear, string = editar
  existingHabit?: Habit;
  onSave: (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'lastCompleted' | 'createdAt'>) => void;
  onBack: () => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - POST /api/habits/ - Crear nuevo hábito
 * - PUT /api/habits/{id}/ - Actualizar hábito existente
 * - GET /api/habits/{id}/ - Obtener datos del hábito (si editing)
 * 
 * Campos del modelo Habit:
 * - nombre (CharField, max_length=200)
 * - descripcion (TextField, opcional)
 * - frecuencia_semanal (IntegerField, 1-7)
 * - user (ForeignKey a User)
 * - activo (BooleanField, default=True)
 * - fecha_creacion (DateTimeField, auto_now_add)
 * 
 * Validaciones:
 * - nombre no vacío
 * - frecuencia entre 1 y 7
 * - usuario debe estar autenticado
 */

const categories = [
  'Salud',
  'Educación',
  'Bienestar',
  'Productividad',
  'Finanzas',
  'Relaciones',
  'Creatividad',
];

const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function HabitForm({ habitId, existingHabit, onSave, onBack }: HabitFormProps) {
  const isEditing = habitId !== null;
  const { showNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    frequency: 3,
    points: 10, // puntos base por completar
  });

  // Estado para controlar qué días de la semana están seleccionados
  // [Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo]
  const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, false, false, false, false]);

  // Cargar datos del hábito existente si estamos editando
  useEffect(() => {
    if (isEditing && existingHabit) {
      setFormData({
        name: existingHabit.name,
        description: existingHabit.description,
        category: existingHabit.category,
        frequency: existingHabit.frequency,
        points: existingHabit.points,
      });

      // Convertir la frecuencia en días seleccionados (por defecto desde el lunes)
      const newSelectedDays = daysOfWeek.map((_, index) => index < existingHabit.frequency);
      setSelectedDays(newSelectedDays);
    }
  }, [isEditing, existingHabit]);

  // Calcular automáticamente la frecuencia basándose en los días seleccionados
  useEffect(() => {
    const totalSelectedDays = selectedDays.filter(day => day).length;
    setFormData(prev => ({ ...prev, frequency: totalSelectedDays }));
  }, [selectedDays]);

  // Función para alternar la selección de un día
  const toggleDay = (index: number) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend: POST /api/habits/ o PUT /api/habits/{habitId}/
    onSave(formData);

    // Notificar creación de hábito (solo si no estamos editando)
    if (!isEditing) {
      showNotification('habit-created', `Hábito "${formData.name}" creado exitosamente`);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2 mb-4 dark:hover:bg-neutral-800">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-neutral-900 dark:text-white mb-2">
            {isEditing ? 'Editar hábito' : 'Crear nuevo hábito'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            {isEditing
              ? 'Actualiza la información de tu hábito'
              : 'Define tu nuevo hábito y establece tu frecuencia objetivo'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 form-habit">
          {/* Basic Information */}
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Información básica</CardTitle>
              <CardDescription className="dark:text-neutral-300">
                Dale un nombre y descripción a tu hábito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name" className="dark:text-neutral-200">Nombre del hábito *</Label>
                <Input
                  id="habit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Meditar 10 minutos"
                  required
                  className="input-habit-name dark:bg-neutral-900 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Sé específico sobre qué quieres lograr
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description" className="dark:text-neutral-200">Descripción (opcional)</Label>
                <Textarea
                  id="habit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Meditación diaria para reducir estrés y mejorar concentración"
                  rows={3}
                  className="input-habit-description resize-none dark:bg-neutral-900 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="dark:text-neutral-200">Categoría</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={formData.category === category ? 'default' : 'outline'}
                      className="cursor-pointer badge-category-select text-xs sm:text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                      onClick={() => setFormData({ ...formData, category })}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week Days Selection */}
          <Card className="card-frequency-example bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-0 dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Días de la semana</CardTitle>
              <CardDescription className="dark:text-neutral-300">
                Selecciona los días en los que quieres realizar este hábito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {daysOfWeek.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm transition-all cursor-pointer hover:scale-105 ${selectedDays[index]
                        ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 text-neutral-400 dark:text-neutral-400 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="text-center pt-2">
                <p className="text-neutral-900 dark:text-white mb-1 text-sm sm:text-base">
                  {formData.frequency === 0 && 'Selecciona al menos un día'}
                  {formData.frequency === 1 && '1 día seleccionado'}
                  {formData.frequency > 1 && `${formData.frequency} días seleccionados`}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">
                  {formData.frequency === 7
                    ? '¡Compromiso máximo! Todos los días de la semana'
                    : formData.frequency > 0
                      ? 'Haz clic en los días para cambiar tu selección'
                      : 'Debes seleccionar al menos un día para continuar'}
                </p>
              </div>

              <Alert className="alert-info bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>Cómo funciona:</strong> Cada vez que completes este hábito en los días seleccionados ganarás puntos.
                  Cumplir con todos los días de tu semana te dará bonificaciones extras y mantendrá tu racha activa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" onClick={onBack} variant="outline" className="flex-1 btn-cancel">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-save gap-2"
              disabled={formData.frequency === 0}
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Guardar cambios' : 'Crear hábito'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}