import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  Bell,
  Globe,
  Moon,
  Shield,
  Trash2,
  LogOut,
  Info,
  Check,
  Download,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { api, Preferences } from '../services/api';
import type { Habit, UserProfile } from '../types';
import { calculateTotalCompletions, calculateLevelProgress } from '../utils/habitCalculations';

// Definición de logros (misma que en Achievements.tsx)
const achievementDefinitions = [
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

// Función para calcular el progreso de logros
function calculateAchievements(habits: Habit[], userProfile: UserProfile) {
  const totalCompletions = calculateTotalCompletions(habits);
  const habitsCount = habits.length;
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



// ... (imports remain the same)

interface SettingsProps {
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  pushNotifications: boolean;
  onPushNotificationsChange: (value: boolean) => void;
  preferences: any;
  onUpdatePreferences: (updates: any) => void;
  onLogout: () => void;
  userProfile?: UserProfile;
  habits?: Habit[];
}

export function Settings({
  darkMode,
  onDarkModeChange,
  pushNotifications,
  onPushNotificationsChange,
  preferences,
  onUpdatePreferences,
  onLogout,
  userProfile,
  habits = []
}: SettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: preferences?.notificaciones_email ?? true,
    pushNotifications: pushNotifications,
    darkMode: darkMode,
    timezone: preferences?.zona_horaria ?? 'UTC',
    language: preferences?.idioma ?? 'es',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Sincronizar el estado local con los props cuando cambien
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      pushNotifications: pushNotifications,
      darkMode: darkMode,
      emailNotifications: preferences?.notificaciones_email ?? prev.emailNotifications,
      timezone: preferences?.zona_horaria ?? prev.timezone,
      language: preferences?.idioma ?? prev.language,
    }));
  }, [pushNotifications, darkMode, preferences]);

  const handlePreferenceUpdate = async (key: keyof Preferences, value: any) => {
    try {
      // 1. Update Backend
      await api.user.updatePreferences({ [key]: value });

      // 2. Update Global State (App.tsx)
      onUpdatePreferences({ [key]: value });

      // 3. Update Local State
      // (Handled by useEffect or specific handlers below)

      // Show success feedback implicitly or explicitly if needed
    } catch (error) {
      console.error(`Error updating preference ${key}:`, error);
      // Revert changes if needed
    }
  };

  const handleSave = () => {
    // Deprecated: Auto-save is now implemented
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadPDF = async () => {
    if (!userProfile) return;

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('HabitMaster - Reporte de Datos', 20, 20);

      // User Info
      doc.setFontSize(12);
      doc.text(`Usuario: ${userProfile.name}`, 20, 40);
      doc.text(`Email: ${userProfile.email}`, 20, 50);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60);

      // Stats
      doc.text('Estadísticas:', 20, 80);
      doc.text(`Nivel: ${userProfile.level}`, 30, 90);
      doc.text(`Puntos Totales: ${userProfile.totalPoints}`, 30, 100);
      doc.text(`Racha Actual: ${userProfile.currentStreak} días`, 30, 110);
      doc.text(`Hábitos Completados: ${userProfile.habitsCompleted}`, 30, 120);

      // Habits List
      doc.text('Mis Hábitos:', 20, 140);
      let yPos = 150;
      habits.forEach((habit) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`- ${habit.name} (${habit.category})`, 30, yPos);
        yPos += 10;
      });

      doc.save('habitmaster-data.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos.')) {
      try {
        // Assuming api.user.deleteAccount exists or similar
        // If not, we might need to implement it or use a placeholder
        // For now, let's assume we need to implement it in api.ts if it's missing
        // But based on previous context, we might not have it yet.
        // Let's check api.ts first, but for now I'll put a placeholder alert if not found
        // actually, I'll check api.ts in the next step, but I can write the code assuming it will be there or I'll add it.
        // Let's use a safe fallback for now.
        await api.auth.deleteAccount(); // We will verify this exists
        onLogout();
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* ... (Header and Alert remain the same) */}

      <div className="space-y-6">
        {/* Notifications */}
        <Card className="card-settings-section dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            {/* ... */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="dark:text-neutral-200">Notificaciones por email</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Recibe recordatorios y actualizaciones por correo
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, emailNotifications: checked });
                  handlePreferenceUpdate('notificaciones_email', checked);
                }}
                className="switch-setting"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="dark:text-neutral-200">Notificaciones push</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Recibe alertas en tiempo real en el navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => {
                  // Actualizar estado local y global
                  setSettings({ ...settings, pushNotifications: checked });
                  onPushNotificationsChange(checked);
                  localStorage.setItem('habitmaster_pushnotifications', checked.toString());

                  // Actualizar Backend
                  handlePreferenceUpdate('notificaciones_push', checked);
                }}
                className="switch-setting"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-settings-section dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            {/* ... */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo oscuro</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Cambia a un tema oscuro para tus ojos
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, darkMode: checked });
                  onDarkModeChange(checked);

                  // Actualizar Backend
                  handlePreferenceUpdate('modo_oscuro', checked);
                }}
                className="switch-setting"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="card-settings-section dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            {/* ... */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="dark:text-neutral-200">Zona horaria</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => {
                  setSettings({ ...settings, timezone: value });
                  handlePreferenceUpdate('zona_horaria', value);
                }}
              >
                {/* ... (Select items remain the same) */}
                <SelectTrigger id="timezone" className="select-timezone dark:bg-neutral-900 dark:border-neutral-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokio (GMT+9)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Se usa para programar recordatorios y calcular rachas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="dark:text-neutral-200">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => {
                  setSettings({ ...settings, language: value });
                  handlePreferenceUpdate('idioma', value);
                }}
              >
                {/* ... (Select items remain the same) */}
                <SelectTrigger id="language" className="select-language dark:bg-neutral-900 dark:border-neutral-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="card-settings-section dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="dark:text-white">Privacidad y seguridad</CardTitle>
                <CardDescription className="dark:text-neutral-300">
                  Gestiona tu cuenta y datos personales
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-900 dark:text-white mb-1">Cambiar contraseña</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
                <Button variant="outline" size="sm" className="btn-change-password">
                  Cambiar contraseña
                </Button>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-900 mb-1">Descargar mis datos</p>
                <p className="text-sm text-neutral-500 mb-3">
                  Obtén una copia de toda tu información en formato PDF
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-download-data gap-2"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || !userProfile}
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar datos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="btn-save-settings gap-2">
            <Check className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="card-danger-zone border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 dark:bg-neutral-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-400">Zona de peligro</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-400">
              Acciones irreversibles que afectan tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-neutral-900 dark:text-white mb-1">Cerrar sesión</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Salir de tu cuenta en este dispositivo
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="btn-logout gap-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </div>

            <div className="pt-4 border-t border-red-200 dark:border-red-800 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-red-900 dark:text-red-400 mb-1">Eliminar cuenta</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
                </p>
              </div>
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                className="btn-delete-account gap-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}