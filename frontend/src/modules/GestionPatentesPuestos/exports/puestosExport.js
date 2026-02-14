import {exportToExcel } from '../../../utils/excelExport';

export const exportarPuestosExcel = (puestos) => {
  exportToExcel({
    data: puestos,
    sheetName: "Puestos",
    fileName: "puestos",
    generatedBy: "Sistema El Dorado",

    columns: [
      { header: "N° Puesto", key: "nroPuesto" },

      {
        header: "Fila / Cuadra",
        format: (p) => `${p.fila} - ${p.cuadra}`
      },

      {
        header: "Estado",
        format: (p) => p.tiene_patente ? "CON PATENTE" : "SIN PATENTE"
      },

      {
        header: "Medidas",
        format: (p) => `${p.ancho}m x ${p.largo}m`
      },

      { header: "Apoderado", key: "apoderado" },
      { header: "CI", key: "ci" },
      { header: "Fecha Adquisición", key: "fecha_adquisicion" },
      { header: "Rubro", key: "rubro" }
    ]
  });
};