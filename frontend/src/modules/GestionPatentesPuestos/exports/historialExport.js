import {exportToExcel } from '../../../utils/excelExport';

export const exportarHistorialExcel = (historial) => {
  exportToExcel({
    data: historial,
    sheetName: "Historial",
    fileName: "historial_puesto",
    generatedBy: "Sistema El Dorado",

    columns: [
      { header: "Fecha", key: "fecha_ini" },
      { header: "Hora", key: "hora_accion" },
      { header: "Tipo", key: "razon" },
      { header: "Afiliado", key: "afiliado" },
      { header: "Motivo", key: "motivo" },
      { header: "Usuario", key: "usuario" }
    ]
  });
};