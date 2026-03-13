import pandas as pd
import sqlite3
import re

# --- 1. CONFIGURACIÓN DE ESTANDARIZACIÓN ---
MAPEO_EXTENSIONES = {
    'LA': 'LP',        # Corrección para el error que mencionaste
    'LA PAZ': 'LP',
    'LAPAZ': 'LP',
    'CBB': 'CB',
    'CBBA': 'CB',
    'SCZ': 'SC',
    'SANTA CRUZ': 'SC',
    'OR': 'OR',
    'ORURO': 'OR',
    'OR.': 'OR',
    'OR,': 'OR',
    'PO': 'PT',
    'POTOSI': 'PT',
    'PO.': 'PT',
    'CH': 'CH',
    'TJ': 'TJ',
    'TARIJA': 'TJ',
    'BE': 'BE',
    'BENI': 'BE',
    'PD': 'PD',
    'PANDO': 'PD',
    'QR': 'QR',
    'Q.R.': 'QR'
}

def limpiar_nombre_completo(texto):
    """
    Limpia nombres manteniendo espacios internos.
    Elimina tabs, comas y espacios en los extremos.
    """
    if pd.isna(texto) or texto == "":
        return ""
    s = str(texto)
    # 1. Eliminar tabs y comas en todo el texto
    s = re.sub(r'[\t,]', '', s)
    # 2. Eliminar espacios al inicio y al final (Trim)
    # 3. Reemplazar múltiples espacios internos por uno solo
    s = ' '.join(s.split())
    return s

def limpiar_ci(texto):
    """
    El CI no debe tener espacios en ningún lado.
    """
    if pd.isna(texto): return ""
    return re.sub(r'[ \t,]', '', str(texto))

def estandarizar_extension(ext):
    """
    Convierte variaciones de expedición a códigos de 2 letras.
    """
    if pd.isna(ext): return "LP"
    
    # Limpieza básica: quitar puntos, comas y espacios extremos
    limpia = str(ext).strip().replace('.', '').replace(',', '').upper()
    
    # Buscar en el mapa, si no está, intentar con las primeras 2 letras
    if limpia in MAPEO_EXTENSIONES:
        return MAPEO_EXTENSIONES[limpia]
    
    return limpia[:2] if len(limpia) >= 2 else "LP"

def importar_afiliados(ruta_excel, ruta_db):
    try:
        # engine='openpyxl' ayuda con archivos de WPS/Modernos
        df = pd.read_excel(ruta_excel, engine='openpyxl')
        
        conn = sqlite3.connect(ruta_db)
        cursor = conn.cursor()

        print(f"Iniciando limpieza de {len(df)} registros...")

        for _, fila in df.iterrows():
            # Limpiamos CI (sin espacios)
            ci = limpiar_ci(fila.get('CI', ''))
            
            # Limpiamos Nombres (con espacios internos)
            nombre = limpiar_nombre_completo(fila.get('NOMBRE', ''))
            paterno = limpiar_nombre_completo(fila.get('PATERNO', ''))
            materno = limpiar_nombre_completo(fila.get('MATERNO', ''))
            
            # Estandarizamos Extensión
            ext_raw = fila.get('EXTENSION', fila.get('EXP', 'LP'))
            extension = estandarizar_extension(ext_raw)

            if ci and nombre:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO afiliado (ci, extension, nombre, paterno, materno)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (ci, extension, nombre, paterno, materno))
                except sqlite3.Error as e:
                    print(f"Error en CI {ci}: {e}")

        conn.commit()
        print("✅ ¡Proceso terminado! Datos limpios e insertados.")

    except Exception as e:
        print(f"❌ Error al leer el archivo: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    importar_afiliados('Afiliados_porVer.xlsx', 'elDorado.db')