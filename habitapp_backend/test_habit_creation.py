"""
Script para probar la creación de hábitos vía API y verificar que se guarden en Neon.
"""
import os
import sys
import requests
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

API_URL = "http://localhost:8000/api"

def test_habit_creation():
    """Prueba completa de creación de hábito"""
    print("=" * 60)
    print("🧪 PRUEBA DE CREACIÓN DE HÁBITOS - HABITMASTER")
    print("=" * 60)
    print()
    
    # 1. Registrar usuario de prueba
    print("1️⃣  Registrando usuario de prueba...")
    test_username = f"test_user_{os.urandom(4).hex()}"
    test_email = f"{test_username}@test.com"
    test_password = "TestPassword123"
    
    try:
        response = requests.post(f"{API_URL}/auth/register/", json={
            "username": test_username,
            "email": test_email,
            "password": test_password
        })
        
        if response.status_code == 201:
            print(f"   ✅ Usuario creado: {test_username}")
        else:
            print(f"   ❌ Error al crear usuario: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 2. Iniciar sesión
    print("\n2️⃣  Iniciando sesión...")
    try:
        response = requests.post(f"{API_URL}/auth/login/", json={
            "username": test_username,
            "password": test_password
        })
        
        if response.status_code == 200:
            data = response.json()
            access_token = data['access']
            print(f"   ✅ Sesión iniciada correctamente")
        else:
            print(f"   ❌ Error al iniciar sesión: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 3. Crear hábito
    print("\n3️⃣  Creando hábito de prueba...")
    habit_data = {
        "nombre": "Ejercicio Matutino - Prueba",
        "descripcion": "30 minutos de ejercicio cada mañana",
        "categoria": "Salud",
        "puntos": 10,
        "dias": "Lun,Mar,Mie,Jue,Vie",
        "estado": "pendiente"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(f"{API_URL}/habitos/", json=habit_data, headers=headers)
        
        if response.status_code == 201:
            habit = response.json()
            habit_id = habit['id_habito']
            print(f"   ✅ Hábito creado con ID: {habit_id}")
            print(f"   📝 Nombre: {habit['nombre']}")
            print(f"   📂 Categoría: {habit['categoria']}")
            print(f"   ⭐ Puntos: {habit['puntos']}")
        else:
            print(f"   ❌ Error al crear hábito: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 4. Verificar en base de datos
    print("\n4️⃣  Verificando en base de datos Neon...")
    try:
        database_url = os.getenv('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar que el hábito existe
        cur.execute("SELECT * FROM habitos WHERE id_habito = %s", (habit_id,))
        db_habit = cur.fetchone()
        
        if db_habit:
            print(f"   ✅ Hábito encontrado en Neon:")
            print(f"      - ID: {db_habit['id_habito']}")
            print(f"      - Nombre: {db_habit['nombre']}")
            print(f"      - Categoría: {db_habit['categoria']}")
            print(f"      - Puntos: {db_habit['puntos']}")
        else:
            print(f"   ❌ Hábito NO encontrado en la base de datos")
            return False
        
        # Verificar relación usuario-hábito
        cur.execute("""
            SELECT * FROM usuario_habito 
            WHERE id_habito = %s
        """, (habit_id,))
        relation = cur.fetchone()
        
        if relation:
            print(f"   ✅ Relación usuario-hábito creada correctamente")
        else:
            print(f"   ⚠️  Advertencia: No se encontró relación usuario-hábito")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Error al verificar en base de datos: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_habit_creation()
    sys.exit(0 if success else 1)
