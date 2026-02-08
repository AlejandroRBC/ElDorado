import sqlite3

def inicializar_base_de_datos():
    # Nombre de tu archivo de base de datos
    nombre_db = 'eldorado.db'
    conn = sqlite3.connect(nombre_db)
    cursor = conn.cursor()

    # 1. Crear la tabla (por si no existe)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS puesto (
        id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
        fila VARCHAR(1) NOT NULL CHECK(fila IN ('A', 'B', 'C', 'D', 'E')),
        cuadra VARCHAR(50) NOT NULL,
        nroPuesto INTEGER NOT NULL,
        ancho INTEGER DEFAULT 0,
        largo INTEGER DEFAULT 0,
        tiene_patente BOOLEAN DEFAULT 0,
        rubro TEXT,
        UNIQUE(fila, cuadra, nroPuesto)
    )
    ''')

    # --- DATOS DE CONFIGURACIÓN ---
    pasos_a = [1, 8, 11, 19, 47, 55, 60, 67, 91, 113, 117, 122, 126, 130, 131, 132, 136, 142, 153, 167, 169, 171, 172, 182, 185, 211, 224, 245, 252, 277, 279, 281, 293, 298]
    pasos_b = [20, 32, 37, 41, 73, 79, 83, 90, 97, 128, 139, 151, 157, 161, 164, 167, 170, 173, 178, 186, 214, 215, 216, 217, 221, 225, 234, 239, 240]

    def obtener_cuadra_a(n):
        if 1 <= n <= 68: return "Cuadra 1"
        if 69 <= n <= 118: return "Callejón"
        if 119 <= n <= 170: return "Cuadra 2"
        if 171 <= n <= 234: return "Cuadra 3"
        if 235 <= n <= 299: return "Cuadra 4"
        return "Desconocido"

    def obtener_cuadra_b(n):
        if 1 <= n <= 52: return "Cuadra 1"
        if 53 <= n <= 119: return "Cuadra 2"
        if 120 <= n <= 185: return "Cuadra 3"
        if 186 <= n <= 247: return "Cuadra 4"
        return "Desconocido"

    try:
        print("Iniciando carga de datos...")
        
        # --- PROCESAR FILA A (1 a 299) ---
        for n in range(1, 300):
            cuadra = obtener_cuadra_a(n)
            # Insertar Puesto Real
            cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto) VALUES (?, ?, ?)", ('A', cuadra, n))
            
            # Si después de este puesto hay un PASO
            if n in pasos_a:
                # Usamos 10000 + n para que el nroPuesto sea único en la cuadra
                cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto) VALUES (?, ?, ?)", ('A', cuadra, 10000 + n))

        # --- PROCESAR FILA B (1 a 247) ---
        for n in range(1, 248):
            cuadra = obtener_cuadra_b(n)
            # Insertar Puesto Real
            cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto) VALUES (?, ?, ?)", ('B', cuadra, n))
            
            # Si después de este puesto hay un PASO
            if n in pasos_b:
                cursor.execute("INSERT INTO puesto (fila, cuadra, nroPuesto) VALUES (?, ?, ?)", ('B', cuadra, 10000 + n))

        conn.commit()
        total = cursor.execute("SELECT COUNT(*) FROM puesto").fetchone()[0]
        print(f"✅ ¡Éxito! Se han creado {total} registros en total.")

    except sqlite3.IntegrityError as e:
        print(f"❌ Error de integridad (posible duplicado): {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Ocurrió un error inesperado: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    inicializar_base_de_datos()