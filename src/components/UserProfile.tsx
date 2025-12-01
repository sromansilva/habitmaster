import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  Flame,
  Star,
  Edit2,
  Check,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import type { Habit, UserProfile as UserProfileType } from '../types';
import { calculateTotalCompletions, calculateLevelProgress, calculateUnlockedAchievements } from '../utils/habitCalculations';

// Avatares predeterminados disponibles
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
];

interface UserProfileProps {
  userProfile: UserProfileType;
  habits: Habit[];
  onUpdateProfile: (updates: Partial<UserProfileType>) => void;
}

export function UserProfile({ userProfile, habits, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    bio: userProfile.bio,
  });

  // Calcular datos derivados
  const habitsCreated = habits.length;
  const habitsCompleted = calculateTotalCompletions(habits);
  const levelProgress = calculateLevelProgress(userProfile.totalPoints);
  const achievementsData = calculateUnlockedAchievements(habits, userProfile.totalPoints, userProfile.maxStreak);

  const handleSave = () => {
    // Backend: PUT /api/profile/
    console.log('Save profile:', formData);
    onUpdateProfile({ name: formData.name, email: formData.email, bio: formData.bio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      bio: userProfile.bio,
    });
    setIsEditing(false);
  };

  // Cerrar menú de avatar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
        setShowAvatarGallery(false);
      }
    };

    if (isAvatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

  // Manejar selección de avatar predeterminado
  const handleSelectAvatar = (avatarUrl: string) => {
    // Backend: PUT /api/profile/ con { avatar: avatarUrl }
    console.log('Selected avatar:', avatarUrl);
    onUpdateProfile({ avatar: avatarUrl });
    setIsAvatarMenuOpen(false);
    setShowAvatarGallery(false);
  };

  // Manejar carga de imagen desde el dispositivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Backend: POST /api/profile/upload-avatar/ con FormData
      // Por ahora, convertimos a URL local para preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        console.log('Uploaded image:', file.name);
        onUpdateProfile({ avatar: imageUrl });
        setIsAvatarMenuOpen(false);
        setShowAvatarGallery(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenGallery = () => {
    setShowAvatarGallery(true);
  };

  const handleOpenFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-neutral-900 dark:text-white mb-2">Mi Perfil</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Gestiona tu información personal y revisa tus estadísticas
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-profile-main dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              {/* Avatar */}
              <div className="relative inline-block" ref={avatarMenuRef}>
                <Avatar className="w-32 h-32 border-4 border-white dark:border-neutral-700 shadow-lg">
                  <AvatarImage src={userProfile.avatar} alt={formData.name} />
                  <AvatarFallback className="text-2xl dark:bg-neutral-700 dark:text-white">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Mini menú flotante */}
                {isAvatarMenuOpen && !showAvatarGallery && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border-2 border-neutral-100 dark:border-neutral-700 z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={handleOpenGallery}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-900 dark:text-white text-sm">Avatar predeterminado</p>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Elige de nuestra galería</p>
                        </div>
                      </button>

                      <button
                        onClick={handleOpenFileUpload}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-900 dark:text-white text-sm">Subir imagen</p>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Desde tu dispositivo</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Galería de avatares predeterminados */}
                {isAvatarMenuOpen && showAvatarGallery && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border-2 border-neutral-100 dark:border-neutral-700 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-neutral-900 dark:text-white">Elige un avatar</h3>
                        <button
                          onClick={() => setShowAvatarGallery(false)}
                          className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {DEFAULT_AVATARS.map((avatarUrl, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectAvatar(avatarUrl)}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-600 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 transition-all"
                          >
                            <img
                              src={avatarUrl}
                              alt={`Avatar ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Input oculto para subir archivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Name & Bio */}
              {!isEditing ? (
                <>
                  <div>
                    <h2 className="text-neutral-900 dark:text-white mb-1">{formData.name}</h2>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm">{formData.email}</p>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm italic">{formData.bio}</p>
                </>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="profile-name" className="text-sm dark:text-neutral-200">Nombre</Label>
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-profile-name dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profile-email" className="text-sm dark:text-neutral-200">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-profile-email dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profile-bio" className="text-sm dark:text-neutral-200">Bio</Label>
                    <Input
                      id="profile-bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-profile-bio dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Level Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                <Star className="w-4 h-4" />
                <span>Nivel {userProfile.level}</span>
              </div>

              {/* Edit Buttons */}
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full btn-edit-profile gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 btn-cancel gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 btn-save gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card className="card-member-info dark:bg-neutral-800 dark:border-neutral-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">Miembro desde</p>
                <p className="text-neutral-900 dark:text-white">
                  {new Date(userProfile.memberSince).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <Card className="card-level-detail dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Progreso de nivel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
                    {userProfile.level}
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-white">Nivel {userProfile.level}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                      {userProfile.totalPoints} puntos totales
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="badge-next-level dark:bg-neutral-700 dark:text-neutral-200">
                  Nivel {userProfile.level + 1} próximo
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={levelProgress} className="h-3" />
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  {100 - (userProfile.totalPoints % 100)} puntos para el siguiente nivel
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="card-stat bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 dark:bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-orange-900 dark:text-orange-300">Racha actual</p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">{userProfile.currentStreak} días consecutivos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 dark:bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-purple-900 dark:text-purple-300">Racha máxima</p>
                  <p className="text-purple-600 dark:text-purple-400 text-sm">{userProfile.maxStreak} días alcanzados</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 dark:bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-900 dark:text-blue-300">Hábitos creados</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">{habitsCreated} hábitos activos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 dark:bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-green-900 dark:text-green-300">Completados</p>
                  <p className="text-green-600 dark:text-green-400 text-sm">{habitsCompleted} hábitos totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Summary */}
          <Card className="card-achievements-summary dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-white">Logros desbloqueados</CardTitle>
                <Badge variant="secondary" className="badge-achievement-count dark:bg-neutral-700 dark:text-neutral-200">
                  {achievementsData.unlocked}/{achievementsData.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-4xl">🏆</div>
                <div className="flex-1">
                  <p className="text-neutral-900 dark:text-white mb-1">
                    Has desbloqueado {achievementsData.unlocked} logros
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    {achievementsData.unlocked === achievementsData.total
                      ? '¡Completaste todos los logros disponibles!'
                      : 'Sigue completando hábitos para desbloquear más medallas'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700">
                  Ver todos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="card-activity-summary bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-0 dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Resumen de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-neutral-900 dark:text-white mb-1">{userProfile.totalPoints}</p>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">Puntos totales</p>
                </div>
                <div>
                  <p className="text-neutral-900 dark:text-white mb-1">{habitsCompleted}</p>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">Hábitos completados</p>
                </div>
                <div>
                  <p className="text-neutral-900 dark:text-white mb-1">{userProfile.currentStreak}</p>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">Días de racha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}