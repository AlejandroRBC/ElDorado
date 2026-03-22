// ============================================
// EXPORTAR HISTORIAL EXCEL
// ============================================

import { notifications }  from '@mantine/notifications';
import { exportToExcel }  from '../../../utils/excelExport';

/**
 * Exporta el historial de un puesto a Excel.
 * Muestra notificación de éxito o error según el resultado.
 *
 * historial - Array de registros de historial
 * nroPuesto - Número de puesto (opcional, para el nombre del archivo y la notificación)
 */
export const exportarHistorialExcel = async (historial, nroPuesto = null) => {
  if (!historial?.length) {
    notifications.show({
      title:     'Sin datos',
      message:   'El historial está vacío, no hay nada que exportar.',
      color:     'yellow',
      autoClose: 4000,
    });
    return;
  }

  try {
    await exportToExcel({
      data:      historial,
      sheetName: 'Historial',
      fileName:  nroPuesto ? `historial_puesto_${nroPuesto}` : 'historial_puesto',
      generatedBy: 'Sistema El Dorado',
      columns: [
        { header: 'Fecha',    key: 'fecha_ini'   },
        { header: 'Hora',     key: 'hora_accion' },
        { header: 'Tipo',     key: 'razon'       },
        { header: 'Afiliado', key: 'afiliado'    },
        { header: 'Motivo',   key: 'motivo'      },
        { header: 'Usuario',  key: 'usuario'     },
      ],
    });

    notifications.show({
      title:     '¡Excel generado!',
      message:   `${historial.length} registro${historial.length !== 1 ? 's' : ''} exportado${historial.length !== 1 ? 's' : ''} correctamente.`,
      color:     'green',
      autoClose: 3000,
    });
  } catch (err) {
    console.error('Error exportando historial:', err);
    notifications.show({
      title:     'Error al exportar',
      message:   err.message || 'No se pudo generar el archivo Excel.',
      color:     'red',
      autoClose: 5000,
    });
  }
};