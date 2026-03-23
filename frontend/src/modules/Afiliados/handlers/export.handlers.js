// No es un hook porque no tiene estado React propio.
// Los componentes que necesitan estado de "exportando" crean
// su propio useState(false) y llaman a estas funciones.

import { notifications }             from '@mantine/notifications';
import { exportAfiliadoDetalleToPDF } from '../../../utils/pdfTemplates/afiliadoDetalleTemplate';
import { exportToExcel }             from '../../../utils/excelExport';
import { prepararDatosAfiliados }    from '../../../utils/excelTemplates';

// ─────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────

/**
 * Exporta el detalle de un afiliado a PDF.
 * El template obtiene los datos por ID directamente.
 *
 * @param {string|number} afiliadoId
 * @param {{ onStart?: Function, onEnd?: Function }} callbacks
 */
export const exportarDetallePDF = async (afiliadoId, { onStart, onEnd } = {}) => {
  if (!afiliadoId) {
    console.error('exportarDetallePDF: ID de afiliado no proporcionado');
    return;
  }
  try {
    onStart?.();
    await exportAfiliadoDetalleToPDF(afiliadoId);
  } catch (error) {
    console.error('Error exportando PDF:', error);
    notifications.show({
      title:   '❌ Error al generar PDF',
      message: error.message || 'No se pudo generar el reporte',
      color:   'red',
      autoClose: 4000,
    });
  } finally {
    onEnd?.();
  }
};

// ─────────────────────────────────────────────────────────────
// EXCEL — lista de afiliados
// ─────────────────────────────────────────────────────────────

/**
 * Exporta la lista de afiliados a Excel.
 * Usa el template ListaAfiliadosTemplate para formatear columnas.
 *
 * @param {Array}   lista            - Afiliados a exportar (filtrados)
 * @param {boolean} soloDeshabilitados - Ajusta el nombre del archivo
 */
export const exportarListaExcel = async (lista, soloDeshabilitados = false) => {
  if (!lista?.length) {
    notifications.show({
      title:   'Sin datos para exportar',
      message: 'Ajusta los filtros e intenta de nuevo.',
      color:   'yellow',
      autoClose: 4000,
    });
    return;
  }

  try {
    const { datos, columnas } = prepararDatosAfiliados(lista);
    await exportToExcel({
      data:      datos,
      columns:   columnas,
      sheetName: 'Afiliados',
      fileName:  soloDeshabilitados ? 'afiliados_deshabilitados' : 'afiliados_activos',
    });

    const n = lista.length;
    notifications.show({
      title:   '✅ Excel generado',
      message: `${n} afiliado${n !== 1 ? 's' : ''} exportado${n !== 1 ? 's' : ''} correctamente.`,
      color:   'green',
      autoClose: 3000,
    });
  } catch (err) {
    console.error('Error exportando Excel:', err);
    notifications.show({
      title:   '❌ Error al exportar',
      message: err.message || 'No se pudo generar el archivo.',
      color:   'red',
      autoClose: 5000,
    });
  }
};