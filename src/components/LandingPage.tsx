import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Target, TrendingUp, Award, Users, CheckCircle, Heart, Star, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onNavigateToAuth: () => void;
  onNavigate?: (screen: string) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - No requiere autenticación
 * - Información estática servida desde template
 * - Botones redirigen a /auth/login o /auth/register
 */

export function LandingPage({ onNavigateToAuth, onNavigate }: LandingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-neutral-900">HabitMaster</span>
        </div>
        
        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollToSection('inicio')} className="text-neutral-600 hover:text-blue-600 transition-colors">
            Inicio
          </button>
          <button onClick={() => scrollToSection('caracteristicas')} className="text-neutral-600 hover:text-blue-600 transition-colors">
            Características
          </button>
          <button onClick={() => scrollToSection('quienes-somos')} className="text-neutral-600 hover:text-blue-600 transition-colors">
            Quiénes somos
          </button>
          <button onClick={() => scrollToSection('testimonios')} className="text-neutral-600 hover:text-blue-600 transition-colors">
            Testimonios
          </button>
          <button onClick={() => scrollToSection('faq')} className="text-neutral-600 hover:text-blue-600 transition-colors">
            FAQ
          </button>
        </nav>

        <Button onClick={onNavigateToAuth} variant="outline" className="btn-secondary">
          Iniciar sesión
        </Button>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 border border-blue-200 w-fit">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                🚀 La app #1 de seguimiento de hábitos
              </span>
            </div>

            <h1 className="text-neutral-900">
              Construye mejores hábitos, 
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                alcanza tus metas
              </span>
            </h1>
            
            <p className="text-neutral-600 text-lg">
              HabitMaster te ayuda a crear rutinas consistentes con gamificación, seguimiento de progreso y rankings motivacionales. Convierte tus objetivos en logros diarios.
            </p>

            {/* Features rápidos */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Seguimiento diario</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Rachas motivadoras</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">Logros desbloqueables</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onNavigateToAuth} size="lg" className="btn-primary text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
                Crear cuenta gratis
              </Button>
              <Button onClick={onNavigateToAuth} variant="outline" size="lg" className="btn-secondary text-base border-2">
                Iniciar sesión
              </Button>
            </div>
            
            {/* Stats mejoradas */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="text-blue-600 mb-1">+10K</div>
                <p className="text-neutral-700 text-sm">Usuarios activos</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="text-green-600 mb-1">85%</div>
                <p className="text-neutral-700 text-sm">Tasa de éxito</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="text-purple-600 mb-1">2M+</div>
                <p className="text-neutral-700 text-sm">Hábitos completados</p>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Imagen principal con borde y sombra */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 shadow-2xl border-4 border-white">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1633284377026-12dfd762d4ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHklMjBoYWJpdHMlMjBzdWNjZXNzfGVufDF8fHx8MTc2MzQ0NDY0OHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Productivity and habits concept"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Cards flotantes decorativas */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border-2 border-blue-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Tu racha</p>
                  <p className="text-neutral-900">🔥 25 días</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border-2 border-green-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Hoy</p>
                  <p className="text-neutral-900">✅ 8/10 completados</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-6 bg-white rounded-xl shadow-xl p-3 border-2 border-purple-100 hidden lg:block">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-neutral-900">Nivel 12</p>
              </div>
            </div>

            {/* Círculos decorativos de fondo */}
            <div className="absolute -z-10 top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -z-10 bottom-10 right-10 w-40 h-40 bg-green-200 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-neutral-900 mb-4">
            Todo lo que necesitas para el éxito
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Herramientas diseñadas para mantener tu motivación alta y tus hábitos consistentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-feature border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-neutral-900">Seguimiento de hábitos</h3>
              <p className="text-neutral-600 text-sm">
                Registra tus hábitos diarios y visualiza tu progreso en tiempo real con gráficos claros
              </p>
            </CardContent>
          </Card>

          <Card className="card-feature border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-neutral-900">Rachas y puntos</h3>
              <p className="text-neutral-600 text-sm">
                Mantén tu racha activa y acumula puntos para subir de nivel y desbloquear logros
              </p>
            </CardContent>
          </Card>

          <Card className="card-feature border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-neutral-900">Medallas y logros</h3>
              <p className="text-neutral-600 text-sm">
                Gana medallas especiales por rachas de 7, 30 y 100 días consecutivos
              </p>
            </CardContent>
          </Card>

          <Card className="card-feature border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-neutral-900">Ranking semanal</h3>
              <p className="text-neutral-600 text-sm">
                Compite con otros usuarios y alcanza el top 3 del ranking semanal
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quiénes somos Section */}
      <section id="quienes-somos" className="bg-gradient-to-br from-blue-50 to-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 w-fit">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Nuestra misión</span>
              </div>
              
              <h2 className="text-neutral-900">
                Transformamos vidas a través de hábitos consistentes
              </h2>
              
              <p className="text-neutral-600 text-lg">
                En HabitMaster creemos que los pequeños cambios diarios generan grandes transformaciones. Nuestro equipo está dedicado a crear la mejor herramienta para el desarrollo personal.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-neutral-900 mb-1">Basado en ciencia</h4>
                    <p className="text-neutral-600 text-sm">
                      Métodos probados de formación de hábitos respaldados por investigación
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-neutral-900 mb-1">Comunidad activa</h4>
                    <p className="text-neutral-600 text-sm">
                      Más de 10,000 usuarios comprometidos con su crecimiento personal
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-neutral-900 mb-1">Mejora continua</h4>
                    <p className="text-neutral-600 text-sm">
                      Actualizaciones constantes basadas en feedback de nuestra comunidad
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576267423048-15c0040fec78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzYzNDQ2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Stat Card decorativa */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 border-2 border-blue-100">
                <div className="text-center">
                  <div className="text-blue-600 mb-1">2020</div>
                  <p className="text-neutral-700 text-sm">Fundada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section id="testimonios" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 border border-blue-200 w-fit mx-auto mb-6">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">Lo que dicen nuestros usuarios</span>
          </div>
          
          <h2 className="text-neutral-900 mb-4">
            Historias de éxito reales
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Miles de personas ya están construyendo mejores hábitos cada día con HabitMaster
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-neutral-700">
                "HabitMaster cambió mi vida. Llevo 90 días de racha en ejercicio y nunca me había sentido mejor. ¡El sistema de gamificación es súper motivador!"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white">MA</span>
                </div>
                <div>
                  <p className="text-neutral-900">María Álvarez</p>
                  <p className="text-neutral-500 text-sm">Diseñadora</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-neutral-700">
                "Como desarrollador, siempre busqué la app perfecta de hábitos. HabitMaster lo tiene todo: diseño limpio, gamificación y sincronización perfecta."
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white">CR</span>
                </div>
                <div>
                  <p className="text-neutral-900">Carlos Rodríguez</p>
                  <p className="text-neutral-500 text-sm">Desarrollador</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-neutral-700">
                "Los logros desbloqueables y el ranking semanal me motivan constantemente. Ya conseguí la medalla de 30 días y voy por los 100. ¡Increíble!"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white">LG</span>
                </div>
                <div>
                  <p className="text-neutral-900">Laura García</p>
                  <p className="text-neutral-500 text-sm">Emprendedora</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-neutral-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 w-fit mx-auto mb-6">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">Preguntas frecuentes</span>
            </div>
            
            <h2 className="text-neutral-900 mb-4">
              ¿Tienes dudas?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Aquí encontrarás respuestas a las preguntas más comunes sobre HabitMaster
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  ¿Es realmente gratis HabitMaster?
                </h3>
                <p className="text-neutral-600 ml-8">
                  Sí, HabitMaster es completamente gratuito. Puedes crear y seguir todos tus hábitos sin límites, acceder al sistema de gamificación y competir en el ranking semanal sin costo alguno.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  ¿Cómo funciona el sistema de puntos y niveles?
                </h3>
                <p className="text-neutral-600 ml-8">
                  Ganas puntos cada vez que completas un hábito. Estos puntos te permiten subir de nivel. Además, mantener rachas consecutivas multiplica tus puntos y desbloquea medallas especiales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  ¿Qué pasa si pierdo mi racha?
                </h3>
                <p className="text-neutral-600 ml-8">
                  No te preocupes, todos tenemos días difíciles. Tu progreso general se mantiene y puedes empezar una nueva racha. Lo importante es la consistencia a largo plazo, no la perfección.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                  ¿Cómo funciona el ranking semanal?
                </h3>
                <p className="text-neutral-600 ml-8">
                  El ranking se resetea cada lunes y clasifica a los usuarios según los puntos ganados durante la semana. Los 3 primeros lugares reciben medallas especiales y reconocimiento en la comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  ¿Puedo modificar o eliminar hábitos creados?
                </h3>
                <p className="text-neutral-600 ml-8">
                  ¡Por supuesto! Puedes editar, archivar o eliminar tus hábitos en cualquier momento desde la sección "Mis Hábitos". Tu progreso histórico se mantendrá guardado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-neutral-900 mb-3 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  ¿Necesito conexión a internet para usar HabitMaster?
                </h3>
                <p className="text-neutral-600 ml-8">
                  La app funciona parcialmente offline. Puedes registrar tus hábitos sin conexión y se sincronizarán automáticamente cuando vuelvas a estar online.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <Card className="bg-gradient-to-br from-blue-500 to-green-500 border-0 overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-white">
              ¿Listo para transformar tus hábitos?
            </h2>
            <p className="text-blue-50 max-w-2xl mx-auto">
              Únete a miles de personas que están construyendo mejores rutinas cada día
            </p>
            <Button onClick={onNavigateToAuth} size="lg" variant="secondary" className="btn-primary-inverse">
              Comenzar ahora - Es gratis
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-neutral-700">HabitMaster</span>
            </div>
            <p className="text-neutral-500 text-sm">
              © 2025 HabitMaster. Construye mejores hábitos, día a día.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}