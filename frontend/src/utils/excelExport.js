// 📁 utils/excelExporter.js
import ExcelJS from 'exceljs';

export const exportToExcel = async ({
    data = [],
    columns = [],
    sheetName = 'Hoja1',
    fileName = 'export',
    generatedBy = 'Sistema'
}) => {
    if (!data.length) {
        alert('No hay datos para exportar');
        return;
    }

    // Crear nuevo workbook
    const workbook = new ExcelJS.Workbook();
    
    // Crear hoja
    const worksheet = workbook.addWorksheet(sheetName);

    // 1. Filas informativas (combinadas)
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleRow = worksheet.getCell(1, 1);
    titleRow.value = `Generado por: ${generatedBy}`;
    titleRow.font = { bold: true, size: 12 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells(2, 1, 2, columns.length);
    const dateRow = worksheet.getCell(2, 1);
    dateRow.value = `Fecha: ${new Date().toLocaleString()}`;
    dateRow.font = { bold: true, size: 12 };
    dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // 2. Encabezados (fila 4 porque filas 1-3 son informativas)
    const headerRow = worksheet.getRow(4);
    columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;
        
        // ✅ ESTILOS AMARILLOS aplicados
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Amarillo
        };
        cell.font = {
            bold: true,
            color: { argb: '000000' },
            size: 11
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // 3. Datos
    data.forEach((item, rowIndex) => {
        const row = worksheet.getRow(5 + rowIndex);

        columns.forEach((col, colIndex) => {
            const value = col.format ? col.format(item) : item[col.key];
            const cell = row.getCell(colIndex + 1);

            cell.value = value;

            // ⭐ SI NO TIENE PATENTE → FILA AMARILLA
            if (item.tiene_patente === 0) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFF59D' } // Amarillo suave PRO
                };
            }

            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
            };

            cell.border = {
                top: { style: 'thin', color: { argb: 'CCCCCC' } },
                left: { style: 'thin', color: { argb: 'CCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
                right: { style: 'thin', color: { argb: 'CCCCCC' } }
            };

            if (col.numeric) {
                cell.numFmt = col.numFmt || '#,##0.00';
            }
        });
    });


    // 4. Ajustar ancho de columnas automáticamente
    columns.forEach((col, index) => {
        let maxLength = col.header.length;
        
        data.forEach(item => {
            const value = col.format ? col.format(item) : item[col.key];
            const length = String(value || '').length;
            if (length > maxLength) maxLength = length;
        });
        
        worksheet.getColumn(index + 1).width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // 5. Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Crear blob y descargar
    const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};