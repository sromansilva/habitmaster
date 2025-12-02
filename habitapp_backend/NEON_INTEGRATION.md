# Integración con Base de Datos Neon PostgreSQL

## 🎯 Resumen

El backend de **HabitMaster** está completamente integrado con **Neon PostgreSQL**, una base de datos serverless en la nube. Todos los hábitos, usuarios y datos se guardan automáticamente en Neon.

## 🔧 Configuración Actual

### Conexión a Base de Datos

La conexión está configurada en `habitapp_backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-weathered-mountain-adhqy5k7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Tablas en Neon

La base de datos contiene las siguientes tablas:

- **usuarios** - Información de usuarios registrados
- **perfiles** - Perfiles de usuario (puntos, rachas, etc.)
- **preferencias** - Configuración de usuario (modo oscuro, notificaciones, etc.)
- **habitos** - Hábitos creados
- **usuario_habito** - Relación entre usuarios y sus hábitos
- **logros** - Definición de logros disponibles
- **usuario_logro** - Logros desbloqueados por usuarios
- **usuario_logs** - Registro de actividad

## 📡 API Endpoints

### Crear Hábito
```http
POST http://localhost:8000/api/habitos/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nombre": "Ejercicio Matutino",
  "descripcion": "30 minutos de ejercicio",
  "categoria": "Salud",
  "puntos": 10,
  "dias": "Lun,Mar,Mie,Jue,Vie",
  "estado": "pendiente"
}
```

### Listar Hábitos del Usuario
```http
GET http://localhost:8000/api/habitos/
Authorization: Bearer {access_token}
```

### Actualizar Hábito
```http
PATCH http://localhost:8000/api/habitos/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "estado": "completado"
}
```

### Eliminar Hábito
```http
DELETE http://localhost:8000/api/habitos/{id}/
Authorization: Bearer {access_token}
```

## 🧪 Verificación

### Script 1: Verificar Conexión a Neon

```bash
cd habitapp_backend
python verify_neon.py
```

**Salida esperada:**
```
🔍 VERIFICACIÓN DE BASE DE DATOS NEON - HABITMASTER
✅ Conexión exitosa a Neon PostgreSQL

📋 Tablas en la base de datos:
   - usuarios
   - perfiles
   - habitos
   ...

📊 Estadísticas de la base de datos:
   👥 Usuarios: 5
   ✅ Hábitos: 12
   🔗 Relaciones Usuario-Hábito: 12

🎯 Últimos 5 hábitos creados:
   ID: 12 | Ejercicio | Salud | 10 pts | Estado: completado
   ...
```

### Script 2: Probar Creación de Hábito

```bash
cd habitapp_backend
python test_habit_creation.py
```

**Este script:**
1. Crea un usuario de prueba
2. Inicia sesión y obtiene token JWT
3. Crea un hábito vía API
4. Verifica que el hábito se guardó en Neon

## 🌐 Flujo Frontend → Backend → Neon

### 1. Usuario crea hábito en el frontend

El usuario llena el formulario en `http://localhost:3000` y hace clic en "Guardar".

### 2. Frontend envía petición a la API

```typescript
// src/services/api.ts
const newHabit = await api.habits.create({
  nombre: "Ejercicio Matutino",
  descripcion: "30 minutos de ejercicio",
  categoria: "Salud",
  dias: "Lun,Mar,Mie,Jue,Vie",
  puntos: 10
});
```

### 3. Backend procesa la petición

```python
# core/views.py - HabitoViewSet
def perform_create(self, serializer):
    # Crea el hábito en Neon
    habito = serializer.save()
    
    # Crea la relación usuario-hábito
    UsuarioHabito.objects.create(
        usuario=self.request.user, 
        habito=habito
    )
    
    # Actualiza estadísticas del perfil
    perfil = Perfil.objects.get(usuario=self.request.user)
    perfil.num_habitos_creados += 1
    perfil.save()
```

### 4. Datos guardados en Neon

El hábito queda almacenado permanentemente en la base de datos Neon PostgreSQL en la nube.

## 🔐 Autenticación

Todos los endpoints de hábitos requieren autenticación JWT:

1. Usuario se registra o inicia sesión
2. Backend genera token JWT
3. Frontend guarda el token en `localStorage`
4. Cada petición incluye el token en el header `Authorization: Bearer {token}`

## 📊 Verificar en Neon Console

Puedes ver los datos directamente en [Neon Console](https://console.neon.tech/):

1. Inicia sesión en Neon
2. Selecciona tu proyecto
3. Abre el SQL Editor
4. Ejecuta consultas:

```sql
-- Ver todos los hábitos
SELECT * FROM habitos ORDER BY id_habito DESC;

-- Ver hábitos de un usuario específico
SELECT h.* 
FROM habitos h
JOIN usuario_habito uh ON h.id_habito = uh.id_habito
WHERE uh.id_usuario = 1;

-- Ver estadísticas
SELECT 
    COUNT(*) as total_habitos,
    COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes
FROM habitos;
```

## ✅ Confirmación

Para confirmar que todo funciona:

1. ✅ Backend corriendo: `python manage.py runserver`
2. ✅ Frontend corriendo: `npm run dev`
3. ✅ Crear un hábito desde el frontend
4. ✅ Ejecutar `python verify_neon.py` para ver el hábito en Neon
5. ✅ Verificar en Neon Console que el hábito existe

**¡La integración con Neon está completa y funcionando!** 🎉
