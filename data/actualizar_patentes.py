import pandas as pd
import sqlite3
import re

# --- 1. CONFIGURACIÓN DE MAPEO (Igual al de vinculación) ---
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

def actualizar_sin_patentes(ruta_excel, ruta_db):
    try:
        # Leer el Excel (Asegúrate de que los nombres de columnas coincidan)
        df = pd.read_excel(ruta_excel, engine='openpyxl')
        
        conn = sqlite3.connect(ruta_db)
        cursor = conn.cursor()

        print(f"Iniciando actualización de {len(df)} puestos sin patente...")

        actualizados = 0
        no_encontrados = 0

        for index, fila_ex in df.iterrows():
            # Extraer datos del Excel
            nro_puesto = fila_ex.get('nroPuesto')
            cod_fila = str(fila_ex.get('FILA', '')).strip().upper()

            # Traducir código de fila a Cuadra y Fila real
            if cod_fila in MAPEO_UBICACIONES:
                info = MAPEO_UBICACIONES[cod_fila]
                cuadra_real = info['cuadra']
                fila_real = info['fila']

                # Ejecutar actualización
                cursor.execute("""
                    UPDATE puesto 
                    SET tiene_patente = 0 
                    WHERE nroPuesto = ? AND fila = ? AND cuadra = ?
                """, (nro_puesto, fila_real, cuadra_real))

                if cursor.rowcount > 0:
                    actualizados += 1
                else:
                    print(f"⚠️ Puesto no encontrado: {nro_puesto} en {cod_fila}")
                    no_encontrados += 1
            else:
                print(f"❌ Código de fila '{cod_fila}' no reconocido en el mapeo (Fila Excel: {index+2})")

        conn.commit()
        print("\n" + "="*40)
        print("REPORTE DE ACTUALIZACIÓN")
        print("="*40)
        print(f"✅ Puestos marcados sin patente: {actualizados}")
        print(f"❌ Puestos no encontrados: {no_encontrados}")
        print("="*40)

    except Exception as e:
        print(f"❌ Error crítico: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    actualizar_sin_patentes('sinPatente.xlsx', 'elDorado.db')