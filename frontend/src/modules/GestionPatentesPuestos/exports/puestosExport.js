// frontend/src/modules/GestionPatentesPuestos/exports/puestosExport.js

// ============================================
// EXPORTAR PUESTOS EXCEL
// ============================================

import { notifications } from '@mantine/notifications';
import { exportToExcel } from '../../../utils/excelExport';

/**
 * Exporta la lista de puestos a Excel.
 * Muestra notificación de éxito o error según el resultado.
 *
 * puestos - Array de puestos a exportar (ya filtrados)
 */
export const exportarPuestosExcel = async (puestos) => {
  if (!puestos?.length) {
    notifications.show({
      title:     'Sin datos',
      message:   'No hay puestos para exportar con los filtros actuales.',
      color:     'yellow',
      autoClose: 4000,
    });
    return;
  }

  try {
    await exportToExcel({
      data:        puestos,
      sheetName:   'Puestos',
      fileName:    'puestos',
      generatedBy: 'Sistema El Dorado',
      columns: [
        { header: 'N° Puesto',         key: 'nroPuesto' },
        { header: 'N° Patente',        format: (p) => p.nro_patente || '---' },
        { header: 'Fila / Cuadra',     format: (p) => `${p.fila} - ${p.cuadra}` },
        { header: 'Estado',            format: (p) => p.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE' },
        { header: 'Medidas',           format: (p) => `${p.ancho}m x ${p.largo}m` },
        { header: 'Nombre',            key: 'nombre'  },
        { header: 'Paterno',           key: 'paterno' },
        { header: 'Materno',           key: 'materno' },
        { header: 'CI',                key: 'ci' },
        { header: 'Fecha Adquisición', key: 'fecha_adquisicion' },
        { header: 'Rubro',             key: 'rubro' },
      ],
    });

    notifications.show({
      title:     '¡Excel generado!',
      message:   `exportado${puestos.length !== 1 ? 's' : ''} correctamente.`,
      color:     'green',
      autoClose: 3000,
    });
  } catch (err) {
    console.error('Error exportando puestos:', err);
    notifications.show({
      title:     'Error al exportar',
      message:   err.message || 'No se pudo generar el archivo Excel.',
      color:     'red',
      autoClose: 5000,
    });
  }
};