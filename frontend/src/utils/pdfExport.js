import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Clase base para generación de PDFs
 */
class PDFGenerator {
  constructor(options = {}) {
    this.options = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      fontSize: 10,
      headerFontSize: 14,
      titleFontSize: 18,
      margin: 15,
      ...options
    };
    
    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: this.options.unit,
      format: this.options.format
    });
    
    this.currentY = this.options.margin;
    this.pageCount = 1;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    const session = localStorage.getItem('user_session');
    const currentUser = session ? JSON.parse(session) : null;
    
    const capitalizar = (texto) =>
      texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : '';

    if (currentUser) {
      const nombre = currentUser.nom_afiliado ||
        currentUser.nom_usuario ||
        currentUser.usuario ||
        'Usuario';
      
      const rol = capitalizar(currentUser.rol);
      return rol ? `${nombre} (${rol})` : nombre;
    }
    
    return 'Sistema';
  }

  /**
   * Agregar encabezado del documento
   */
  addHeader(title, subtitle = null) {
    const { margin, titleFontSize, headerFontSize } = this.options;
    const user = this.getCurrentUser();
    
    // Título principal
    this.doc.setFontSize(titleFontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(15, 15, 15);
    this.doc.text(title, margin, this.currentY);
    this.currentY += 10;
    
    // Subtítulo
    if (subtitle) {
      this.doc.setFontSize(headerFontSize);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, margin, this.currentY);
      this.currentY += 8;
    }
    
    // Información de generación
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(128, 128, 128);
    
    const fecha = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.doc.text(`Generado por: ${user}`, margin, this.currentY);
    this.doc.text(`Fecha: ${fecha}`, margin + 80, this.currentY);
    
    this.currentY += 8;
    this.doc.setTextColor(0, 0, 0);
    
    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(margin, this.currentY - 2, this.doc.internal.pageSize.width - margin, this.currentY - 2);
  }

  /**
   * Agregar imagen (para foto de perfil)
   */
  async addImage(imgData, width, height, options = {}) {
    const { margin } = this.options;
    const { x = margin, y = this.currentY, align = 'left' } = options;
    
    return new Promise((resolve) => {
      let finalX = x;
      if (align === 'center') {
        finalX = (this.doc.internal.pageSize.width - width) / 2;
      } else if (align === 'right') {
        finalX = this.doc.internal.pageSize.width - width - margin;
      }
      
      try {
        this.doc.addImage(imgData, 'JPEG', finalX, y, width, height);
      } catch (e) {
        console.warn('Error al agregar imagen:', e);
      }
      
      this.currentY = y + height + 5;
      resolve();
    });
  }

  /**
   * Agregar tabla
   */
  addTable(headers, data, options = {}) {
    const { margin } = this.options;
    
    // Verificar espacio en página
    const pageHeight = this.doc.internal.pageSize.height;
    if (this.currentY > pageHeight - 40) {
      this.doc.addPage();
      this.currentY = margin;
    }
    
    autoTable(this.doc, {
      head: [headers],
      body: data,
      startY: this.currentY,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: this.options.fontSize,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 15, 15],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        this.doc.setFontSize(8);
        this.doc.setTextColor(128, 128, 128);
        this.doc.text(
          `Página ${data.pageNumber}`,
          this.doc.internal.pageSize.width - margin - 20,
          this.doc.internal.pageSize.height - 10
        );
      },
      ...options
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  /**
   * Agregar texto
   */
  addText(text, options = {}) {
    const { margin } = this.options;
    const {
      fontSize = this.options.fontSize,
      bold = false,
      align = 'left',
      color = [0, 0, 0],
      indent = 0
    } = options;
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setTextColor(color[0], color[1], color[2]);
    
    const x = margin + indent;
    const lines = this.doc.splitTextToSize(text, this.doc.internal.pageSize.width - margin * 2 - indent);
    this.doc.text(lines, x, this.currentY, { align });
    
    this.currentY += lines.length * fontSize * 0.5 + 3;
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Agregar línea separadora
   */
  addSeparator() {
    const { margin } = this.options;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(
      margin,
      this.currentY,
      this.doc.internal.pageSize.width - margin,
      this.currentY
    );
    this.currentY += 5;
  }

  /**
   * Agregar nueva página
   */
  addPage() {
    this.doc.addPage();
    this.currentY = this.options.margin;
    this.pageCount++;
  }

  /**
   * Guardar PDF
   */
  save(filename) {
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Método 1: Nativo de jsPDF (más confiable)
    try {
      this.doc.save(finalFilename);
      console.log(`✅ PDF guardado: ${finalFilename}`);
    } catch (error) {
      console.error('Error con save nativo, usando fallback:', error);
      
      // Método 2: Fallback con blob (solo si el nativo falla)
      const pdfBlob = this.doc.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }
}

export default PDFGenerator;