import { useState } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Target, ArrowLeft, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthScreenProps {
  onLogin: (name?: string, email?: string) => void;
  onBack: () => void;
}

/**
 * BACKEND INTEGRATION NOTES:
 * - POST /api/auth/register - Crea User + Profile
 * - POST /api/auth/login - Autentica y devuelve token
 * - POST /api/auth/google - OAuth con Google (futuro)
 * - Validaciones: email único, contraseña segura
 * - Crear Profile automáticamente al registrar User
 * - Inicializar puntos=0, nivel=1, racha_actual=0
 * 
 * NOTA: Esta pantalla siempre se muestra en modo claro, 
 * independientemente de la configuración de modo oscuro del usuario.
 */

export function AuthScreen({ onLogin, onBack }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        if (registerPassword !== registerConfirm) {
          throw new Error('Las contraseñas no coinciden');
        }
        // 1. Register
        await api.auth.register(registerName, registerEmail, registerPassword);

        // 2. Auto-login after register
        const data = await api.auth.login(registerName, registerPassword);

        // 3. Save tokens
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 4. Notify parent
        onLogin(data.user.username, data.user.email);

      } else {
        // Login
        const data = await api.auth.login(loginEmail, loginPassword); // Note: loginEmail is actually username in backend, need to fix UI or Backend
        // Wait, backend expects 'username'. The UI asks for 'email'.
        // User might type email or username. 
        // Let's assume for now the user types their username in the "Email" field or we change the label.
        // The prompt said "usuario" and "contraseña" for login.
        // But the UI says "Correo electrónico".
        // I will change the UI label to "Usuario" to match backend requirement.

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        onLogin(data.user.username, data.user.email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </header>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-neutral-900 mb-2">HabitMaster</h1>
            <p className="text-neutral-600">
              Tu compañero para construir mejores hábitos
            </p>
          </motion.div>

          {/* Auth Form */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setError(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Login Tab */}
              {activeTab === 'login' && (
                <TabsContent value="login" asChild>
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="border-0 shadow-lg bg-white">
                      <CardHeader>
                        <CardTitle className="text-neutral-900">Bienvenido de nuevo</CardTitle>
                        <CardDescription className="text-neutral-600">
                          Ingresa tus credenciales para continuar
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 form-auth">
                          {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                              {error}
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="login-username" className="text-neutral-700">Usuario</Label>
                            <Input
                              id="login-username"
                              type="text"
                              placeholder="Tu nombre de usuario"
                              value={loginEmail} // Reusing state variable for simplicity, but semantically it's username
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              className="input-email bg-white border-neutral-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-neutral-700">Contraseña</Label>
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              className="input-password bg-white border-neutral-200"
                            />
                          </div>

                          <Button type="submit" disabled={isLoading} className="w-full btn-primary bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-2 text-neutral-500">
                                O continuar con
                              </span>
                            </div>
                          </div>

                          {/* Google Auth - Preparado para futura integración */}
                          <Button type="button" variant="outline" className="w-full btn-google gap-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            Continuar con Google
                          </Button>

                          <p className="text-center text-sm text-neutral-500">
                            ¿Olvidaste tu contraseña?{' '}
                            <button type="button" className="text-blue-600 hover:underline">
                              Recuperar
                            </button>
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}

              {/* Register Tab */}
              {activeTab === 'register' && (
                <TabsContent value="register" asChild>
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="border-0 shadow-lg bg-white">
                      <CardHeader>
                        <CardTitle className="text-neutral-900">Crear cuenta</CardTitle>
                        <CardDescription className="text-neutral-600">
                          Comienza tu viaje hacia mejores hábitos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 form-auth">
                          {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                              {error}
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="register-name" className="text-neutral-700">Nombre de usuario</Label>
                            <Input
                              id="register-name"
                              type="text"
                              placeholder="JuanPerez"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              required
                              className="input-name bg-white border-neutral-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-email" className="text-neutral-700">Correo electrónico</Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="tu@email.com"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                              className="input-email bg-white border-neutral-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-password" className="text-neutral-700">Contraseña</Label>
                            <Input
                              id="register-password"
                              type="password"
                              placeholder="••••••••"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                              className="input-password bg-white border-neutral-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-confirm" className="text-neutral-700">Confirmar contraseña</Label>
                            <Input
                              id="register-confirm"
                              type="password"
                              placeholder="••••••••"
                              value={registerConfirm}
                              onChange={(e) => setRegisterConfirm(e.target.value)}
                              required
                              className="input-password-confirm bg-white border-neutral-200"
                            />
                          </div>

                          <Button type="submit" disabled={isLoading} className="w-full btn-primary bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-2 text-neutral-500">
                                O continuar con
                              </span>
                            </div>
                          </div>

                          {/* Google Auth - Preparado para futura integración */}
                          <Button type="button" variant="outline" className="w-full btn-google gap-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            Registrarse con Google
                          </Button>

                          <p className="text-center text-sm text-neutral-500">
                            Al crear una cuenta, aceptas nuestros{' '}
                            <button type="button" className="text-blue-600 hover:underline">
                              Términos y Condiciones
                            </button>
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
