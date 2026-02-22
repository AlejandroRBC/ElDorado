// frontend/src/modules/Afiliados/hooks/usePDFExport.js

import { useState } from 'react';
import { exportAfiliadoDetalleToPDF } from '../../../utils/pdfTemplates/afiliadoDetalleTemplate';

export const usePDFExport = () => {
  const [exportando, setExportando] = useState(false);

  const exportarDetalleAfiliado = async (afiliadoId) => {
    if (!afiliadoId) {
      console.error('ID de afiliado no proporcionado');
      return;
    }
    
    try {
      setExportando(true);
      // Pasamos SOLO el ID, el template se encarga del resto
      await exportAfiliadoDetalleToPDF(afiliadoId);
    } catch (error) {
      console.error('Error en usePDFExport:', error);
    } finally {
      setExportando(false);
    }
  };

  return {
    exportando,
    exportarDetalleAfiliado
  };
};