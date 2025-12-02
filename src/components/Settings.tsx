import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Bell,
  Globe,
  Moon,
  Shield,
  Trash2,
  LogOut,
  Download,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { api, Preferences } from '../services/api';
import type { Habit, UserProfile } from '../types';

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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

    } catch (error) {
      console.error(`Error updating preference ${key}:`, error);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) return;

    setIsChangingPassword(true);
    try {
      await api.auth.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      alert('Contraseña actualizada correctamente');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const msg = error.old_password ? error.old_password[0] : (error.message || 'Error al actualizar la contraseña');
      alert(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!userProfile) return;

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // --- Header ---
      // Background for header
      doc.setFillColor(59, 130, 246); // Blue-500
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Logo (Text for now)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('HabitMaster', margin, 28);

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 28, { align: 'right' });

      yPos = 60;

      // --- User Info ---
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Perfil de Usuario', margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre de usuario: ${userProfile.name}`, margin, yPos);
      yPos += 8;
      doc.text(`Email: ${userProfile.email}`, margin, yPos);
      yPos += 8;
      if (userProfile.bio) {
        doc.text(`Biografía: ${userProfile.bio}`, margin, yPos);
        yPos += 8;
      }
      yPos += 10;

      // --- Stats ---
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Estadísticas', margin, yPos);
      yPos += 10;

      // Draw a box for stats
      const statBoxWidth = (pageWidth - (margin * 3)) / 2;
      const statBoxHeight = 25;

      // Row 1
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(249, 250, 251); // Gray-50

      // Stat 1: Nivel
      doc.rect(margin, yPos, statBoxWidth, statBoxHeight, 'FD');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Nivel', margin + 5, yPos + 8);
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(`${userProfile.level}`, margin + 5, yPos + 18);

      // Stat 2: Puntos
      doc.rect(margin + statBoxWidth + margin, yPos, statBoxWidth, statBoxHeight, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Puntos Totales', margin + statBoxWidth + margin + 5, yPos + 8);
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(`${userProfile.totalPoints}`, margin + statBoxWidth + margin + 5, yPos + 18);

      yPos += statBoxHeight + 5;

      // Row 2
      // Stat 3: Racha
      doc.rect(margin, yPos, statBoxWidth, statBoxHeight, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Racha Actual', margin + 5, yPos + 8);
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(`${userProfile.currentStreak} días`, margin + 5, yPos + 18);

      // Stat 4: Completados
      doc.rect(margin + statBoxWidth + margin, yPos, statBoxWidth, statBoxHeight, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Hábitos Completados', margin + statBoxWidth + margin + 5, yPos + 8);
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(`${userProfile.habitsCompleted}`, margin + statBoxWidth + margin + 5, yPos + 18);

      yPos += statBoxHeight + 20;

      // --- Habits List ---
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text('Mis Hábitos', margin, yPos);
      yPos += 10;

      // Table Header
      doc.setFillColor(229, 231, 235); // Gray-200
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
      doc.setFontSize(10);
      doc.text('Hábito', margin + 5, yPos + 7);
      doc.text('Categoría', margin + 80, yPos + 7);
      doc.text('Puntos', margin + 130, yPos + 7);
      yPos += 10;

      // Table Body
      doc.setFont('helvetica', 'normal');
      habits.forEach((habit, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Zebra striping
        if (index % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
        }

        doc.text(habit.name, margin + 5, yPos + 7);
        doc.text(habit.category, margin + 80, yPos + 7);
        doc.text(`${habit.points} pts`, margin + 130, yPos + 7);

        yPos += 10;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

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
        await api.auth.deleteAccount();
        onLogout();
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Notifications */}
        <Card className="card-settings-section dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="dark:text-white">Notificaciones</CardTitle>
                <CardDescription className="dark:text-neutral-300">
                  Gestiona cómo recibes las alertas
                </CardDescription>
              </div>
            </div>
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
                  setSettings({ ...settings, pushNotifications: checked });
                  onPushNotificationsChange(checked);
                  localStorage.setItem('habitmaster_pushnotifications', checked.toString());
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="dark:text-white">Apariencia</CardTitle>
                <CardDescription className="dark:text-neutral-300">
                  Personaliza la interfaz visual
                </CardDescription>
              </div>
            </div>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="dark:text-white">Idioma y Región</CardTitle>
                <CardDescription className="dark:text-neutral-300">
                  Ajusta tus preferencias regionales
                </CardDescription>
              </div>
            </div>
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

                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <input
                      id="current-password"
                      type="password"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="********"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <input
                      id="new-password"
                      type="password"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="********"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-change-password"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !passwordForm.oldPassword || !passwordForm.newPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar contraseña'
                    )}
                  </Button>
                </div>
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