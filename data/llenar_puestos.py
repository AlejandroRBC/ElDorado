import sqlite3

def crear_puestos_db(ruta_db):
    try:
        conn = sqlite3.connect(ruta_db)
        cursor = conn.cursor()

        # 1. Crear la tabla si no existe
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS puesto (
                id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
                fila VARCHAR(1) NOT NULL CHECK(fila IN ('A', 'B', 'C', 'D', 'E')),
                cuadra VARCHAR(50) NOT NULL,
                nroPuesto INTEGER NOT NULL,
                ancho REAL DEFAULT 0,
                largo REAL DEFAULT 0,
                tiene_patente BOOLEAN DEFAULT 1,
                rubro TEXT,
                disponible BOOLEAN DEFAULT 1,
                UNIQUE(fila, cuadra, nroPuesto)
            )
        ''')

        # 2. Limpiar datos previos para asegurar orden de IDs
        cursor.execute("DELETE FROM puesto")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='puesto'")

        # --- CONFIGURACIÓN DE PASOS ---
        pasos_a = [1, 8, 11, 19, 47, 55, 60, 67, 91, 113, 117, 122, 126, 130, 131, 132, 136, 142, 153, 167, 168, 171, 172, 182, 185, 211, 224, 245, 252, 277, 279, 281, 293, 298]
        pasos_b = [20, 32, 37, 41, 73, 79, 83, 90, 97, 128, 139, 151, 157, 161, 164, 167, 170, 173, 178, 186, 214, 215, 216, 217, 221, 225, 234, 239, 240]

        def obtener_cuadra_a(n):
            if 1 <= n <= 67:   return "Cuadra 1"
            if 68 <= n <= 117:  return "Callejón"
            if 118 <= n <= 169: return "Cuadra 2"
            if 170 <= n <= 233: return "Cuadra 3" # Ajustado según tu corrección
            if 234 <= n <= 299: return "Cuadra 4" # Ajustado según tu corrección
            return "Desconocido"

        def obtener_cuadra_b(n):
            if 1 <= n <= 52:   return "Cuadra 1"
            if 53 <= n <= 119:  return "Cuadra 2"
            if 120 <= n <= 185: return "Cuadra 3"
            if 186 <= n <= 247: return "Cuadra 4"
            return "Desconocido"

        print("Generando puestos en la base de datos...")
        contador = 0

        # --- PROCESAR FILA A ---
        for n in range(1, 300):
            cuadra = obtener_cuadra_a(n)
            ancho = 1.5
            largo = 1.5 if cuadra == "Callejón" else 1.8
            
            cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto, ancho, largo) VALUES (?, ?, ?, ?, ?)",
                           ('A', cuadra, n, ancho, largo))
            contador += 1
            
            if n in pasos_a:
                cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto, ancho, largo) VALUES (?, ?, ?, ?, ?)",
                               ('A', cuadra, 10000 + n, 0, 0))
                contador += 1

        # --- PROCESAR FILA B ---
        for n in range(1, 248):
            cuadra = obtener_cuadra_b(n)
            cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto, ancho, largo) VALUES (?, ?, ?, ?, ?)",
                           ('B', cuadra, n, 1.5, 1.8))
            contador += 1
            
            if n in pasos_b:
                cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto, ancho, largo) VALUES (?, ?, ?, ?, ?)",
                               ('B', cuadra, 10000 + n, 0, 0))
                contador += 1

        conn.commit()
        print(f"✅ ¡Éxito! Se han creado {contador} registros (puestos + pasos).")

    except sqlite3.Error as e:
        print(f"❌ Error de SQLite: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    crear_puestos_db('elDorado.db')