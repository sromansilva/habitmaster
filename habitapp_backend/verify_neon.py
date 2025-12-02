"""
Script para verificar la conexión a Neon PostgreSQL y mostrar estadísticas de la base de datos.
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def verify_connection():
    """Verifica la conexión a la base de datos Neon"""
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("❌ ERROR: DATABASE_URL no está configurada en .env")
            return False
        
        print("🔄 Conectando a Neon PostgreSQL...")
        conn = psycopg2.connect(database_url)
        print("✅ Conexión exitosa a Neon PostgreSQL\n")
        return conn
    except Exception as e:
        print(f"❌ Error al conectar a Neon: {e}")
        return None

def show_tables(conn):
    """Muestra todas las tablas en la base de datos"""
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cur.fetchall()
        
        print("📋 Tablas en la base de datos:")
        for table in tables:
            print(f"   - {table[0]}")
        print()
        cur.close()
    except Exception as e:
        print(f"❌ Error al listar tablas: {e}")

def show_stats(conn):
    """Muestra estadísticas de las tablas principales"""
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Contar usuarios
        cur.execute("SELECT COUNT(*) as count FROM usuarios")
        usuarios_count = cur.fetchone()['count']
        
        # Contar hábitos
        cur.execute("SELECT COUNT(*) as count FROM habitos")
        habitos_count = cur.fetchone()['count']
        
        # Contar relaciones usuario-hábito
        cur.execute("SELECT COUNT(*) as count FROM usuario_habito")
        usuario_habito_count = cur.fetchone()['count']
        
        print("📊 Estadísticas de la base de datos:")
        print(f"   👥 Usuarios: {usuarios_count}")
        print(f"   ✅ Hábitos: {habitos_count}")
        print(f"   🔗 Relaciones Usuario-Hábito: {usuario_habito_count}")
        print()
        
        cur.close()
    except Exception as e:
        print(f"❌ Error al obtener estadísticas: {e}")

def show_recent_habits(conn, limit=5):
    """Muestra los hábitos más recientes"""
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            SELECT h.id_habito, h.nombre, h.descripcion, h.categoria, h.puntos, h.fecha, h.estado
            FROM habitos h
            ORDER BY h.id_habito DESC
            LIMIT {limit}
        """)
        habits = cur.fetchall()
        
        if habits:
            print(f"🎯 Últimos {len(habits)} hábitos creados:")
            for habit in habits:
                print(f"   ID: {habit['id_habito']} | {habit['nombre']} | {habit['categoria']} | {habit['puntos']} pts | Estado: {habit['estado']}")
        else:
            print("ℹ️  No hay hábitos en la base de datos aún")
        print()
        
        cur.close()
    except Exception as e:
        print(f"❌ Error al obtener hábitos recientes: {e}")

def main():
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE BASE DE DATOS NEON - HABITMASTER")
    print("=" * 60)
    print()
    
    conn = verify_connection()
    if not conn:
        sys.exit(1)
    
    show_tables(conn)
    show_stats(conn)
    show_recent_habits(conn)
    
    conn.close()
    print("✅ Verificación completada exitosamente")
    print("=" * 60)

if __name__ == "__main__":
    main()
