import pandas as pd
import sqlite3
import re

# --- CONFIGURACIÓN DE MAPEO (Excel -> Base de Datos) ---
MAPEO_UBICACIONES = {
    '1A': {'cuadra': 'Cuadra 1', 'fila': 'A'},
    'CA': {'cuadra': 'Callejón', 'fila': 'A'},
    'CB': {'cuadra': 'Callejón', 'fila': 'A'},
    '2A': {'cuadra': 'Cuadra 2', 'fila': 'A'},
    '3A': {'cuadra': 'Cuadra 3', 'fila': 'A'},
    '4A': {'cuadra': 'Cuadra 4', 'fila': 'A'},
    '1B': {'cuadra': 'Cuadra 1', 'fila': 'B'},
    '2B': {'cuadra': 'Cuadra 2', 'fila': 'B'},
    '3B': {'cuadra': 'Cuadra 3', 'fila': 'B'},
    '4B': {'cuadra': 'Cuadra 4', 'fila': 'B'},
}

def actualizar_patentes_desde_excel(ruta_excel, ruta_db):
    try:
        # Cargar Excel con engine openpyxl para compatibilidad con WPS
        df = pd.read_excel(ruta_excel, engine='openpyxl')
        
        conn = sqlite3.connect(ruta_db)
        cursor = conn.cursor()

        print(f"Iniciando actualización de patentes desde {ruta_excel}...")

        actualizados = 0
        errores = []

        for index, fila_ex in df.iterrows():
            # Extraer datos según tus nuevos encabezados
            # NRO puesto || Patente || Fila
            nro_puesto = fila_ex.get('NRO puesto')
            nro_patente_raw = fila_ex.get('Patente')
            cod_fila_excel = str(fila_ex.get('FILA', '')).strip().upper()

            # 1. Validar ubicación
            if cod_fila_excel not in MAPEO_UBICACIONES:
                errores.append(f"Línea {index+2}: Código de fila '{cod_fila_excel}' no reconocido.")
                continue
            
            config = MAPEO_UBICACIONES[cod_fila_excel]
            
            # 2. Limpiar número de patente (convertir a entero si es posible)
            try:
                if pd.isna(nro_patente_raw):
                    nro_patente = None
                    tiene_pat = 0
                else:
                    nro_patente = int(nro_patente_raw)
                    tiene_pat = 1
            except ValueError:
                errores.append(f"Línea {index+2}: El nro de patente '{nro_patente_raw}' no es un número válido.")
                continue

            # 3. Ejecutar Update
            cursor.execute("""
                UPDATE puesto 
                SET nro_patente = ?, tiene_patente = ?
                WHERE nroPuesto = ? AND fila = ? AND cuadra = ?
            """, (nro_patente, tiene_pat, nro_puesto, config['fila'], config['cuadra']))

            if cursor.rowcount > 0:
                actualizados += 1
            else:
                errores.append(f"Línea {index+2}: Puesto {nro_puesto} en {cod_fila_excel} no encontrado en la BD.")

        conn.commit()
        
        # --- REPORTE FINAL ---
        print("\n" + "="*50)
        print("REPORTE DE ACTUALIZACIÓN DE PATENTES")
        print("="*50)
        print(f"✅ Registros actualizados: {actualizados}")
        print(f"❌ Errores encontrados: {len(errores)}")
        
        if errores:
            print("\nDetalle de errores (Primeros 15):")
            for err in errores[:15]:
                print(f"  - {err}")
        print("="*50)

    except Exception as e:
        print(f"❌ Error crítico: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    # Asegúrate de que el nombre del archivo sea el correcto
    actualizar_patentes_desde_excel('nro_patentes.xlsx', 'elDorado.db')