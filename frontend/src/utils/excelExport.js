import ExcelJS from 'exceljs';

export const exportToExcel = async ({
    data = [],
    columns = [],
    sheetName = 'Hoja1',
    fileName = 'export'
}) => {

    if (!data.length) {
        alert('No hay datos para exportar');
        return;
    }

    // ===============================
    // 🔐 Obtener usuario logueado
    // ===============================
    const session = localStorage.getItem('user_session');
    const currentUser = session ? JSON.parse(session) : null;

    const capitalizar = (texto) =>
        texto
            ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
            : '';

    let generatedByName = 'Sistema';

    if (currentUser) {
        const nombre =
            currentUser.nom_afiliado ||
            currentUser.nom_usuario ||
            currentUser.usuario ||
            'Usuario';

        const rol = capitalizar(currentUser.rol);

        generatedByName = rol
            ? `${nombre} (${rol})`
            : nombre;
    }

    // ===============================
    // 📄 Crear workbook
    // ===============================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // ===============================
    // 🏢 ENCABEZADO SUPERIOR
    // ===============================

    // 1️⃣ Sistema
    worksheet.mergeCells(1, 1, 1, columns.length);
    const systemRow = worksheet.getCell(1, 1);
    systemRow.value = 'Sistema El Dorado';
    systemRow.font = { bold: true, size: 14 };
    systemRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // 2️⃣ Generado por
    worksheet.mergeCells(2, 1, 2, columns.length);
    const generatedRow = worksheet.getCell(2, 1);
    generatedRow.value = `Generado por: ${generatedByName}`;
    generatedRow.font = { bold: true, size: 12 };
    generatedRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // 3️⃣ Fecha
    worksheet.mergeCells(3, 1, 3, columns.length);
    const dateRow = worksheet.getCell(3, 1);
    dateRow.value = `Fecha: ${new Date().toLocaleString()}`;
    dateRow.font = { bold: true, size: 12 };
    dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // ===============================
    // 🟡 ENCABEZADOS DE TABLA (fila 5)
    // ===============================
    const headerRow = worksheet.getRow(5);

    columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;

        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' }
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

    // ===============================
    // 📊 DATOS (desde fila 6)
    // ===============================
    data.forEach((item, rowIndex) => {
        const row = worksheet.getRow(6 + rowIndex);

        columns.forEach((col, colIndex) => {
            const value = col.format
                ? col.format(item)
                : item[col.key];

            const cell = row.getCell(colIndex + 1);

            cell.value = value;

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

    // ===============================
    // 📏 Ajustar ancho columnas
    // ===============================
    columns.forEach((col, index) => {
        let maxLength = col.header.length;

        data.forEach(item => {
            const value = col.format
                ? col.format(item)
                : item[col.key];

            const length = String(value || '').length;
            if (length > maxLength) maxLength = length;
        });

        worksheet.getColumn(index + 1).width =
            Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // ===============================
    // 💾 Descargar archivo
    // ===============================
    const buffer = await workbook.xlsx.writeBuffer();

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
