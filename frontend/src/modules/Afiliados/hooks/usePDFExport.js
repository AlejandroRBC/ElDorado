// frontend/src/modules/Afiliados/hooks/usePDFExport.js

// ============================================
// HOOK USE PDF EXPORT
// ============================================

import { useState }                          from 'react';
import { exportAfiliadoDetalleToPDF }        from '../../../utils/pdfTemplates/afiliadoDetalleTemplate';

/**
 * Gestiona la exportación del detalle de un afiliado a PDF.
 * El template se encarga de obtener los datos por ID.
 */
export const usePDFExport = () => {
  const [exportando, setExportando] = useState(false);

  /**
   * Exporta el detalle de un afiliado a PDF dado su ID.
   */
  const exportarDetalleAfiliado = async (afiliadoId) => {
    if (!afiliadoId) {
      console.error('ID de afiliado no proporcionado');
      return;
    }
    try {
      setExportando(true);
      await exportAfiliadoDetalleToPDF(afiliadoId);
    } catch (error) {
      console.error('Error en usePDFExport:', error);
    } finally {
      setExportando(false);
    }
  };

  return { exportando, exportarDetalleAfiliado };
};