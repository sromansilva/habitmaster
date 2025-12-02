try:
    from pyswip import Prolog
except ImportError:
    Prolog = None
    print("WARNING: pyswip not installed. Prolog integration will not work.")
except Exception as e:
    Prolog = None
    print(f"WARNING: Error importing pyswip: {e}. Check SWI-Prolog installation.")

import os

class PrologService:
    def __init__(self):
        self.prolog = None
        if Prolog:
            try:
                self.prolog = Prolog()
                # Construct absolute path to base.pl
                current_dir = os.path.dirname(os.path.abspath(__file__))
                self.prolog_file = os.path.join(current_dir, 'prolog', 'base.pl')
                
                # Load the prolog file
                # Note: consult expects forward slashes even on Windows usually, or escaped backslashes
                # We'll use forward slashes to be safe
                normalized_path = self.prolog_file.replace('\\', '/')
                self.prolog.consult(normalized_path)
                print(f"Prolog file loaded successfully: {normalized_path}")
            except Exception as e:
                print(f"Error initializing Prolog: {e}")
                self.prolog = None
        else:
            print("Prolog service disabled due to missing dependencies.")

    def obtener_sugerencias(self, categoria):
        """
        Consulta a Prolog para obtener sugerencias de hábitos dada una categoría.
        """
        if not self.prolog:
            return ["Error: Prolog no disponible"]
            
        sugerencias = []
        try:
            query = f"sugerir_habito('{categoria}', Habito)"
            for soln in self.prolog.query(query):
                sugerencias.append(soln["Habito"])
        except Exception as e:
            print(f"Error querying Prolog: {e}")
        return sugerencias

    def obtener_sugerencias_por_dificultad(self, dificultad):
        """
        Consulta a Prolog para obtener sugerencias de hábitos dada una dificultad.
        """
        if not self.prolog:
            return ["Error: Prolog no disponible"]

        sugerencias = []
        try:
            query = f"sugerir_por_dificultad('{dificultad}', Habito)"
            for soln in self.prolog.query(query):
                sugerencias.append(soln["Habito"])
        except Exception as e:
            print(f"Error querying Prolog: {e}")
        return sugerencias

    def verificar_consistencia(self, racha):
        """
        Consulta a Prolog si una racha se considera consistente.
        """
        if not self.prolog:
            return False

        try:
            query = f"es_consistente({racha})"
            # query returns a generator, if it yields anything, it's true
            result = list(self.prolog.query(query))
            return len(result) > 0
        except Exception as e:
            print(f"Error checking consistency: {e}")
            return False

    def calcular_bonus_racha(self, racha):
        """
        Calcula el bonus de puntos basado en la racha.
        """
        if not self.prolog:
            return 0

        bonus = 0
        try:
            query = f"calcular_bonus({racha}, Bonus)"
            for soln in self.prolog.query(query):
                bonus = soln["Bonus"]
                break # Take the first result
        except Exception as e:
            print(f"Error calculating bonus: {e}")
        return bonus

    def obtener_nivel(self, puntos):
        """
        Obtiene el nivel del usuario basado en sus puntos.
        """
        if not self.prolog:
            return "Desconocido (Prolog Error)"

        nivel = "Desconocido"
        try:
            query = f"nivel_usuario({puntos}, Nivel)"
            for soln in self.prolog.query(query):
                nivel = soln["Nivel"]
                break
        except Exception as e:
            print(f"Error getting level: {e}")
        return nivel
