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

def limpiar_ci_alfanumerico(texto):
    if pd.isna(texto) or texto == "": return ""
    return re.sub(r'[ \t,]', '', str(texto)).strip().upper()

def vincular_con_reporte(ruta_excel, ruta_db):
    # Listas para reporte
    exitos = 0
    err_afiliado = []
    err_puesto = []
    err_otros = []

    try:
        df = pd.read_excel(ruta_excel, engine='openpyxl')
        conn = sqlite3.connect(ruta_db)
        cursor = conn.cursor()

        print(f"Leyendo {len(df)} filas del Excel...\n")

        for index, fila_ex in df.iterrows():
            # Extraer datos (Ajusta los nombres de las columnas si es necesario)
            nro_puesto = fila_ex.get('NRO')
            cod_fila = str(fila_ex.get('FILA', '')).strip().upper()
            ci_afiliado = limpiar_ci_alfanumerico(fila_ex.get('C.I.', ''))

            # 1. Validar código de fila
            if cod_fila not in MAPEO_UBICACIONES:
                err_otros.append(f"Fila {index+2}: Código '{cod_fila}' no reconocido en el mapeo.")
                continue

            config = MAPEO_UBICACIONES[cod_fila]
            
            # 2. Buscar Afiliado
            cursor.execute("SELECT id_afiliado FROM afiliado WHERE ci = ?", (ci_afiliado,))
            res_af = cursor.fetchone()
            if not res_af:
                err_afiliado.append(f"Fila {index+2}: CI '{ci_afiliado}' no existe en la tabla de afiliados.")
                continue
            id_afiliado = res_af[0]

            # 3. Buscar Puesto
            cursor.execute("""
                SELECT id_puesto FROM puesto 
                WHERE nroPuesto = ? AND fila = ? AND cuadra = ?
            """, (nro_puesto, config['fila'], config['cuadra']))
            res_ps = cursor.fetchone()
            if not res_ps:
                err_puesto.append(f"Fila {index+2}: El puesto {nro_puesto} en {config['cuadra']} ({config['fila']}) no existe en la BD.")
                continue
            id_puesto = res_ps[0]

            # 4. Intentar insertar relación
            try:
                cursor.execute("""
                    INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon)
                    VALUES (?, ?, ?)
                """, (id_afiliado, id_puesto, 'Importación Masiva'))
                
                # Marcar puesto como ocupado
                cursor.execute("UPDATE puesto SET disponible = 0 WHERE id_puesto = ?", (id_puesto,))
                exitos += 1
            except sqlite3.IntegrityError:
                err_otros.append(f"Fila {index+2}: El puesto {nro_puesto} ya tiene un dueño asignado (Error UNIQUE).")
            except Exception as e:
                err_otros.append(f"Fila {index+2}: Error inesperado: {str(e)}")

        conn.commit()
        conn.close()

        # --- IMPRESIÓN DEL REPORTE ---
        print("="*50)
        print("REPORTE DE VINCULACIÓN PUESTO-AFILIADO")
        print("="*50)
        print(f"✅ Vinculaciones exitosas: {exitos}")
        print(f"❌ Errores totales: {len(err_afiliado) + len(err_puesto) + len(err_otros)}")
        
        if err_afiliado:
            print(f"\n--- AFILIADOS NO ENCONTRADOS ({len(err_afiliado)}) ---")
            for e in err_afiliado: print(f"  {e}")

        if err_puesto:
            print(f"\n--- PUESTOS NO ENCONTRADOS ({len(err_puesto)}) ---")
            for e in err_puesto: print(f"  {e}")

        if err_otros:
            print(f"\n--- OTROS ERRORES/DUPLICADOS ({len(err_otros)}) ---")
            for e in err_otros: print(f"  {e}")
        print("="*50)

    except Exception as e:
        print(f"ERROR CRÍTICO: No se pudo procesar el archivo Excel. {str(e)}")

if __name__ == "__main__":
    vincular_con_reporte('RelacionesPuestos.xlsx', 'elDorado.db')