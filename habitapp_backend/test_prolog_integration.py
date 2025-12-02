import os
import sys

# Add the current directory to sys.path to make imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from core.prolog_service import PrologService
except ImportError:
    print("Error: Could not import PrologService. Make sure pyswip is installed.")
    sys.exit(1)

def test_prolog():
    print("Initializing Prolog Service...")
    try:
        service = PrologService()
    except Exception as e:
        print(f"Failed to initialize service: {e}")
        return

    print("\n--- Testing Suggestions ---")
    categoria = "Salud"
    sugerencias = service.obtener_sugerencias(categoria)
    print(f"Sugerencias para {categoria}: {sugerencias}")
    if sugerencias:
        print("PASS: Suggestions received.")
    else:
        print("FAIL: No suggestions received.")

    print("\n--- Testing Consistency ---")
    racha = 10
    es_consistente = service.verificar_consistencia(racha)
    print(f"Racha {racha} es consistente: {es_consistente}")
    if es_consistente:
        print("PASS: Consistency check working.")
    else:
        print("FAIL: Consistency check failed.")

    print("\n--- Testing Bonus ---")
    bonus = service.calcular_bonus_racha(racha)
    print(f"Bonus para racha {racha}: {bonus}")
    if bonus == 50:
        print("PASS: Bonus calculation correct.")
    else:
        print(f"FAIL: Bonus calculation incorrect (Expected 50, got {bonus}).")

    print("\n--- Testing User Level ---")
    puntos = 600
    nivel = service.obtener_nivel(puntos)
    print(f"Nivel para {puntos} puntos: {nivel}")
    if nivel == "Avanzado":
        print("PASS: Level calculation correct.")
    else:
        print(f"FAIL: Level calculation incorrect (Expected Avanzado, got {nivel}).")

if __name__ == "__main__":
    test_prolog()
