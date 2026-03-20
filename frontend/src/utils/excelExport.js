import ExcelJS from 'exceljs';

// Para exportar datos específicos importa el template correspondiente:
//   import { prepararDatosAfiliados } from './excelTemplates';

// ============================================================
// EXPORTACIÓN A EXCEL
// ============================================================

// Extrae el texto plano de un valor de celda,
// sea string, número u objeto richText de ExcelJS.
const textoPlano = (valor) => {
  if (valor == null) return '';
  if (typeof valor === 'object' && Array.isArray(valor.richText)) {
    return valor.richText.map((s) => s.text ?? '').join('');
  }
  return String(valor);
};
/**
 * Calcula la longitud "efectiva" de un valor de celda.
 * Si el texto tiene saltos de línea (\n) — como en las columnas
 * de puestos — devuelve la longitud de la línea más larga,
 * no la del string completo.
 */
const longitudEfectiva = (valor) => {
  const texto = textoPlano(valor);
  if (!texto.includes('\n')) return texto.length;
  return Math.max(...texto.split('\n').map((linea) => linea.length));
};

/**
 * Cuenta cuántas líneas tiene un valor de celda.
 * Usado para calcular la altura de fila cuando hay puestos múltiples.
 */
const contarLineas = (valor) => {
  const texto = textoPlano(valor);
  return texto ? texto.split('\n').length : 1;
};

export const exportToExcel = async ({
  data = [],
  columns = [],
  sheetName = 'Hoja1',
  fileName = 'export',
}) => {
  if (!data.length) {
    throw new Error('No hay datos para exportar');
  }

  // ── Obtener usuario logueado ──────────────────────────────
  const session     = localStorage.getItem('user_session');
  const currentUser = session ? JSON.parse(session) : null;

  const capitalizar = (texto) =>
    texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : '';

  let generatedByName = 'Sistema';
  if (currentUser) {
    const nombre =
      currentUser.nom_afiliado ||
      currentUser.nom_usuario  ||
      currentUser.usuario      ||
      'Usuario';
    const rol = capitalizar(currentUser.rol);
    generatedByName = rol ? `${nombre} (${rol})` : nombre;
  }

  // ── Crear workbook ────────────────────────────────────────
  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // ── Encabezado superior ───────────────────────────────────
  worksheet.mergeCells(1, 1, 1, columns.length);
  const systemRow     = worksheet.getCell(1, 1);
  systemRow.value     = 'Sistema El Dorado';
  systemRow.font      = { bold: true, size: 14 };
  systemRow.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(2, 1, 2, columns.length);
  const generatedRow     = worksheet.getCell(2, 1);
  generatedRow.value     = `Generado por: ${generatedByName}`;
  generatedRow.font      = { bold: true, size: 12 };
  generatedRow.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(3, 1, 3, columns.length);
  const dateRow     = worksheet.getCell(3, 1);
  dateRow.value     = `Fecha: ${new Date().toLocaleString()}`;
  dateRow.font      = { bold: true, size: 12 };
  dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // ── Encabezados de tabla (fila 5) ─────────────────────────
  const headerRow = worksheet.getRow(5);
  columns.forEach((col, index) => {
    const cell     = headerRow.getCell(index + 1);
    cell.value     = col.header;
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    cell.font      = { bold: true, color: { argb: '000000' }, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = {
      top:    { style: 'thin' },
      left:   { style: 'thin' },
      bottom: { style: 'thin' },
      right:  { style: 'thin' },
    };
  });

  // ── Filas de datos ────────────────────────────────────────
  data.forEach((item, rowIndex) => {
    const excelRow      = worksheet.getRow(6 + rowIndex);
    const esMayorA10000 = Number(item.nroPuesto) > 10000;

    // Calcular la altura de la fila según el mayor número de
    // líneas (\n) que tenga cualquier celda de esta fila.
    // Altura base ExcelJS ≈ 15 pt; añadimos 14 pt por cada línea extra.
    let maxLineas = 1;

    columns.forEach((col, colIndex) => {
      const cell  = excelRow.getCell(colIndex + 1);
      const value = col.format ? col.format(item) : item[col.key];

      cell.value = esMayorA10000 ? '' : value;

      // ── Colorear fila ──────────────────────────────────
      if (esMayorA10000) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F9FF' } };
      } else if (item.tiene_patente === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF59D' } };
      }

      // ── Alineación base ────────────────────────────────
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      // ── Aplicar col.style si el template lo define ─────
      // El template puede sobreescribir alineación (ej: vertical: 'top')
      if (col.style) {
        if (col.style.alignment) {
          cell.alignment = { ...cell.alignment, ...col.style.alignment };
        }
        if (col.style.font)   cell.font   = { ...cell.font,   ...col.style.font   };
        if (col.style.fill)   cell.fill   = col.style.fill;
        if (col.style.border) cell.border = col.style.border;
      }

      // ── Borde ──────────────────────────────────────────
      cell.border = {
        top:    { style: 'thin', color: { argb: 'CCCCCC' } },
        left:   { style: 'thin', color: { argb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
        right:  { style: 'thin', color: { argb: 'CCCCCC' } },
      };

      // ── Formato numérico ───────────────────────────────
      if (col.numeric) cell.numFmt = col.numFmt || '#,##0.00';

      // ── Conteo de líneas para auto-altura de fila ─────
      if (!esMayorA10000) {
        const lineas = contarLineas(value);
        if (lineas > maxLineas) maxLineas = lineas;
      }
    });

    // Ajustar altura: 15 pt base + 14 pt por cada línea adicional
    if (maxLineas > 1) {
      excelRow.height = 15 + (maxLineas - 1) * 14;
    }
  });

  // ── Auto-ajuste de ancho de columnas ─────────────────────
  // FIX: usa longitudEfectiva() para manejar correctamente
  // los valores multilinea (columnas NRO PUESTO / FILA / CUADRA).
  columns.forEach((col, index) => {
    let maxLen = col.header.length;

    data.forEach((item) => {
      const value = col.format ? col.format(item) : item[col.key];
      const len   = longitudEfectiva(value);
      if (len > maxLen) maxLen = len;
    });

    worksheet.getColumn(index + 1).width = Math.min(Math.max(maxLen + 2, 10), 50);
  });

  // ── Timestamp y descarga ──────────────────────────────────
  const ahora     = new Date();
  const timestamp = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, '0'),
    String(ahora.getDate()).padStart(2, '0'),
    String(ahora.getHours()).padStart(2, '0'),
    String(ahora.getMinutes()).padStart(2, '0'),
    String(ahora.getSeconds()).padStart(2, '0'),
  ].join('-');

  const buffer = await workbook.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href     = url;
  link.download = `${fileName}_${timestamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};