// frontend/src/utils/pdfTemplates/afiliadoDetalleTemplate.js

import PDFGenerator from '../pdfExport';
import { pdfService } from '../../modules/Afiliados/services/pdfService';
import { notifications } from '@mantine/notifications';
import autoTable from 'jspdf-autotable';

const formatearNombreParaArchivo = (nombre) => {
  if (!nombre) return 'SinNombre';
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');
};

const obtenerTimestampCompleto = () => {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  return `${año}-${mes}-${dia}-${hora}-${minutos}-${segundos}`;
};

const imageUrlToBase64 = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// ─────────────────────────────────────────────
// Helper: determina si un puesto tiene patente
// considerando AMBOS campos (tiene_patente y nro_patente)
// ─────────────────────────────────────────────
const tienePatente = (puesto) =>
  puesto.tiene_patente === 1 ||
  puesto.tiene_patente === true ||
  (puesto.nro_patente != null && puesto.nro_patente !== '');

export const exportAfiliadoDetalleToPDF = async (afiliadoId) => {
  try {
    notifications.show({
      id: 'pdf-loading',
      title: '📄 Generando reporte',
      message: 'Obteniendo datos actualizados...',
      color: 'blue',
      loading: true,
      autoClose: false
    });

    const afiliado = await pdfService.obtenerDatosParaPDFFresh(afiliadoId);
    if (!afiliado) throw new Error('No se encontraron datos del afiliado');

    const pdf = new PDFGenerator({ orientation: 'portrait', margin: 20 });
    const doc = pdf.doc;
    const margin = pdf.options.margin;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margin * 2;

    // ─────────────────────────────────────────────
    // HEADER: barra negra con foto + nombre
    // ─────────────────────────────────────────────
    const HEADER_H = 50;

    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageWidth, HEADER_H, 'F');

    doc.setFillColor(237, 190, 60);
    doc.rect(0, HEADER_H - 3, pageWidth, 3, 'F');

    doc.setFillColor(237, 190, 60);
    doc.rect(0, 0, 4, HEADER_H, 'F');

    const usuario = pdf.getCurrentUser ? pdf.getCurrentUser() : 'Sistema';
    const fechaGeneracion = new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Generado por ${usuario}  ·  ${fechaGeneracion}`, pageWidth - margin, 7, { align: 'right' });

    // ── FOTO DE PERFIL
    const FOTO_SIZE = 36;
    const fotoX = margin + 8;
    const fotoY = (HEADER_H - FOTO_SIZE) / 2;
    let nombreX = fotoX + FOTO_SIZE + 12;

    let fotoOk = false;
    if (afiliado.url_perfil && !afiliado.url_perfil.includes('sinPerfil.png')) {
      try {
        const perfilUrl = afiliado.url_perfil.startsWith('http')
          ? afiliado.url_perfil
          : `http://localhost:3000${afiliado.url_perfil}`;
        const base64Image = await imageUrlToBase64(perfilUrl);
        if (base64Image) {
          doc.setFillColor(0, 0, 0);
          doc.roundedRect(fotoX + 1, fotoY + 1, FOTO_SIZE, FOTO_SIZE, 4, 4, 'F');
          doc.setDrawColor(237, 190, 60);
          doc.setLineWidth(1.2);
          doc.roundedRect(fotoX - 1, fotoY - 1, FOTO_SIZE + 2, FOTO_SIZE + 2, 4, 4, 'D');
          doc.addImage(base64Image, 'JPEG', fotoX, fotoY, FOTO_SIZE, FOTO_SIZE);
          fotoOk = true;
        }
      } catch (e) {
        console.warn('No se pudo cargar foto de perfil:', e);
      }
    }

    if (!fotoOk) {
      doc.setFillColor(35, 35, 35);
      doc.roundedRect(fotoX, fotoY, FOTO_SIZE, FOTO_SIZE, 4, 4, 'F');
      doc.setDrawColor(237, 190, 60);
      doc.setLineWidth(0.8);
      doc.roundedRect(fotoX, fotoY, FOTO_SIZE, FOTO_SIZE, 4, 4, 'D');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(18);
      doc.text('?', fotoX + FOTO_SIZE / 2, fotoY + FOTO_SIZE / 2 + 5, { align: 'center' });
    }

    // ── NOMBRE DEL AFILIADO
    const nombreCompleto = (afiliado.nombreCompleto || afiliado.nombre || 'Sin nombre').toUpperCase();
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');

    const nombreMaxW = pageWidth - nombreX - margin;
    const nombreFit = doc.splitTextToSize(nombreCompleto, nombreMaxW);
    const nombreLine1 = nombreFit[0] || nombreCompleto;
    const nombreLine2 = nombreFit[1] || null;

    const nombreCenterY = HEADER_H / 2 + (nombreLine2 ? -4 : 3);
    doc.text(nombreLine1, nombreX, nombreCenterY);
    if (nombreLine2) {
      doc.text(nombreLine2, nombreX, nombreCenterY + 8);
    }

    if (afiliado.ci) {
      doc.setTextColor(237, 190, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`CI: ${afiliado.ci}`, nombreX, nombreCenterY + (nombreLine2 ? 16 : 9));
    }

    doc.setTextColor(237, 190, 60);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('EL DORADO', pageWidth - margin, HEADER_H - 10, { align: 'right' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Gestión de Afiliados', pageWidth - margin, HEADER_H - 4, { align: 'right' });

    pdf.currentY = HEADER_H + 14;

    // ─────────────────────────────────────────────
    // DATOS PERSONALES
    // ─────────────────────────────────────────────
    const drawSectionTitle = (title, y) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(237, 190, 60);
      doc.text(title, margin, y);
      doc.setDrawColor(237, 190, 60);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 2, margin + contentWidth, y + 2);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2.5, margin + contentWidth, y + 2.5);
    };

    drawSectionTitle('INFORMACIÓN PERSONAL', pdf.currentY);
    pdf.currentY += 8;

    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 5;
    const colW = contentWidth / 2 - 8;
    const ROW_H = 9;

    const drawField = (label, value, x, y) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(130, 130, 130);
      doc.text(label.toUpperCase(), x, y);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const valStr = String(value || '—');
      const fitted = doc.splitTextToSize(valStr, colW);
      doc.text(fitted[0], x, y + 5);

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.15);
      doc.line(x, y + 7, x + colW, y + 7);
    };

    const col1Fields = [
      ['Nombre completo', afiliado.nombreCompleto || afiliado.nombre],
      ['Fecha de nacimiento', afiliado.fecNac ? new Date(afiliado.fecNac).toLocaleDateString('es-ES') : null],
      ['Edad', afiliado.edad ? `${afiliado.edad} años` : null],
      ['Sexo', afiliado.sexo],
    ];

    const col2Fields = [
      ['Teléfono', afiliado.telefono],
      ['Ocupación', afiliado.ocupacion],
      ['Fecha de afiliación', afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : null],
      ['Dirección', afiliado.direccion],
    ];

    const maxRows = Math.max(col1Fields.length, col2Fields.length);
    for (let i = 0; i < maxRows; i++) {
      const yRow = pdf.currentY + i * ROW_H;
      if (col1Fields[i]) drawField(col1Fields[i][0], col1Fields[i][1], col1X, yRow);
      if (col2Fields[i]) drawField(col2Fields[i][0], col2Fields[i][1], col2X, yRow);
    }

    pdf.currentY += maxRows * ROW_H + 10;

    // ─────────────────────────────────────────────
    // PUESTOS ASIGNADOS
    // ─────────────────────────────────────────────

    // ✅ FIX 1: historial_puestos NO tiene campo "estado".
    // El modelo ya devuelve solo los puestos activos (JOIN con tenencia_puesto),
    // así que usamos el array directamente sin filtrar.
    const puestosActivos = afiliado.historial_puestos || [];

    drawSectionTitle('PUESTOS ASIGNADOS', pdf.currentY);
    pdf.currentY += 8;

    if (puestosActivos.length > 0) {
      const puestosHeaders = ['N°', 'Fila', 'Cuadra', 'Rubro', 'Patente', 'F. Asignación'];

      const puestosData = puestosActivos.map(p => [
        // ✅ FIX 2: el campo es "nroPuesto", no "nro"
        p.nroPuesto ?? '—',
        p.fila      || '—',
        p.cuadra    || '—',
        p.rubro     || '—',
        // ✅ FIX 3: patente verdadera si tiene_patente=1 O nro_patente tiene valor
        tienePatente(p) ? 'SÍ' : 'NO',
        // ✅ FIX 4: el campo es "fecha_ini", no "fecha_obtencion"
        p.fecha_ini
          ? new Date(p.fecha_ini).toLocaleDateString('es-ES')
          : '—',
      ]);

      autoTable(doc, {
        head: [puestosHeaders],
        body: puestosData,
        startY: pdf.currentY,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
          lineColor: [220, 220, 220],
          lineWidth: 0.15,
          textColor: [30, 30, 30],
          font: 'helvetica',
        },
        headStyles: {
          fillColor: [15, 15, 15],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
          cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 18 },
          2: { halign: 'center', cellWidth: 28 },
          3: { halign: 'left' },
          4: { halign: 'center', cellWidth: 22 },
          5: { halign: 'center', cellWidth: 32 },
        },

        // ✅ FIX 5: usar willDrawCell (ANTES de dibujar) en lugar de didDrawCell
        // (DESPUÉS de dibujar). Con willDrawCell se modifican los estilos de la
        // celda y autoTable los aplica al renderizar, sin necesidad de redibujar.
        willDrawCell: (data) => {
          // Borde dorado debajo del encabezado
          if (data.section === 'head' && data.row.index === 0) {
            doc.setDrawColor(237, 190, 60);
            doc.setLineWidth(0.5);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height
            );
          }

          // Color de texto en columna "Patente"
          if (data.section === 'body' && data.column.index === 4) {
            const val = data.cell.raw;
            if (val === 'SÍ') {
              data.cell.styles.textColor = [34, 139, 34];
              data.cell.styles.fontStyle = 'bold';
            } else if (val === 'NO') {
              data.cell.styles.textColor = [180, 0, 0];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });

      pdf.currentY = doc.lastAutoTable.finalY + 8;

      // Píldoras de resumen
      // ✅ FIX 6: contador de patentes usa la misma lógica corregida
      const conPatenteCount = puestosActivos.filter(tienePatente).length;
      const sinPatenteCount = puestosActivos.length - conPatenteCount;

      const pills = [
        { label: `${puestosActivos.length} puestos totales`, bg: [15, 15, 15],   fg: [255, 255, 255] },
        { label: `${conPatenteCount} con patente`,           bg: [34, 139, 34],  fg: [255, 255, 255] },
        { label: `${sinPatenteCount} sin patente`,           bg: [180, 0, 0],    fg: [255, 255, 255] },
      ];

      let pillX = margin;
      pills.forEach(({ label, bg, fg }) => {
        const textW = doc.getTextWidth(label);
        const pillW = textW + 12;
        const pillH = 9;
        doc.setFillColor(...bg);
        doc.roundedRect(pillX, pdf.currentY, pillW, pillH, 2, 2, 'F');
        doc.setTextColor(...fg);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(label, pillX + 6, pdf.currentY + 6.2);
        pillX += pillW + 5;
      });

      pdf.currentY += 18;

    } else {
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, pdf.currentY, contentWidth, 20, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, pdf.currentY, contentWidth, 20, 3, 3, 'D');

      doc.setTextColor(160, 160, 160);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Sin puestos asignados actualmente', pageWidth / 2, pdf.currentY + 12, { align: 'center' });

      pdf.currentY += 28;
    }

    // ─────────────────────────────────────────────
    // PIE DE PÁGINA
    // ─────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(15, 15, 15);
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    doc.setFillColor(237, 190, 60);
    doc.rect(0, pageHeight - 14, 4, 14, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Sistema El Dorado — Gestión de Afiliados', margin + 8, pageHeight - 5);

    doc.setTextColor(120, 120, 120);
    doc.text(`Pág. ${pdf.pageCount || 1}`, pageWidth - margin, pageHeight - 5, { align: 'right' });

    // ─────────────────────────────────────────────
    // GUARDAR
    // ─────────────────────────────────────────────
    const nombreAfiliado = formatearNombreParaArchivo(afiliado.nombreCompleto || afiliado.nombre);
    const timestamp = obtenerTimestampCompleto();
    const nombreArchivo = `Reporte-${nombreAfiliado}-${timestamp}`;

    pdf.save(nombreArchivo);

    notifications.update({
      id: 'pdf-loading',
      title: '✅ Reporte generado',
      message: `Guardado como: ${nombreArchivo}.pdf`,
      color: 'green',
      loading: false,
      autoClose: 3000
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    notifications.update({
      id: 'pdf-loading',
      title: '❌ Error',
      message: error.message || 'No se pudo generar el PDF',
      color: 'red',
      loading: false,
      autoClose: 3000
    });
    throw error;
  }
};