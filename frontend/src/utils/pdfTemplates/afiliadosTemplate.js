// frontend/src/utils/pdfTemplates/afiliadosTemplate.js
import PDFGenerator from '../pdfExport';
import { getPerfilUrl } from '../imageHelper';

/**
 * Template para reporte de afiliados
 */
export const exportAfiliadosToPDF = async (afiliados, options = {}) => {
  const columns = [
    {
      header: 'Nombre',
      key: 'nombre',
      format: (row) => row.nombre || ''
    },
    {
      header: 'CI',
      key: 'ci',
      format: (row) => row.ci || ''
    },
    {
      header: 'Ocupación',
      key: 'ocupacion',
      format: (row) => row.ocupacion || 'No especificado'
    },
    {
      header: 'Puestos',
      key: 'patentes',
      format: (row) => {
        if (!row.patentes || row.patentes.length === 0) return 'Sin puestos';
        return row.patentes.slice(0, 3).join(', ') + 
          (row.patentes.length > 3 ? ` (+${row.patentes.length - 3})` : '');
      }
    },
    {
      header: 'Total Puestos',
      key: 'total_puestos',
      format: (row) => row.total_puestos || 0,
      numeric: true
    },
    {
      header: 'Con Patente',
      key: 'puestos_con_patente',
      format: (row) => row.puestos_con_patente || 0,
      numeric: true
    },
    {
      header: 'Teléfono',
      key: 'telefono',
      format: (row) => row.telefono || '—'
    },
    {
      header: 'Estado',
      key: 'estado',
      format: (row) => row.estado || 'Activo'
    }
  ];

  const subtitle = options.mostrarDeshabilitados 
    ? 'Listado de afiliados deshabilitados'
    : 'Listado general de afiliados';

  return exportToPDF({
    data: afiliados,
    columns,
    title: options.title || 'Reporte de Afiliados',
    subtitle,
    filename: options.filename || 'afiliados',
    orientation: options.orientation || 'landscape', // Landscape para más columnas
    options: {
      columnStyles: {
        0: { cellWidth: 50 }, // Nombre
        1: { cellWidth: 30 }, // CI
        2: { cellWidth: 40 }, // Ocupación
        3: { cellWidth: 50 }, // Puestos
        4: { cellWidth: 20, halign: 'center' }, // Total
        5: { cellWidth: 20, halign: 'center' }, // Con patente
        6: { cellWidth: 30 }, // Teléfono
        7: { cellWidth: 20, halign: 'center' } // Estado
      }
    }
  });
};

/**
 * Template para reporte detallado de un afiliado
 */
export const exportAfiliadoDetalleToPDF = async (afiliado) => {
  const pdf = new PDFGenerator({ orientation: 'portrait' });
  
  // Título
  pdf.addHeader(
    `Reporte Detallado: ${afiliado.nombreCompleto || afiliado.nombre}`,
    `CI: ${afiliado.ci}`
  );
  
  // Información personal
  pdf.addText('INFORMACIÓN PERSONAL', { bold: true, fontSize: 12 });
  
  const infoPersonal = [
    ['Nombre:', afiliado.nombreCompleto || afiliado.nombre],
    ['CI:', afiliado.ci],
    ['Ocupación:', afiliado.ocupacion || 'No especificado'],
    ['Teléfono:', afiliado.telefono || 'No especificado'],
    ['Dirección:', afiliado.direccion || 'No especificado'],
    ['Fecha Afiliación:', afiliado.fecha_afiliacion ? 
      new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : 'No especificado'],
    ['Estado:', afiliado.es_habilitado ? 'Activo' : 'Deshabilitado']
  ];
  
  infoPersonal.forEach(([label, value]) => {
    pdf.addText(`${label} ${value}`, { fontSize: 10 });
  });
  
  pdf.addSeparator();
  
  // Puestos actuales
  if (afiliado.puestos && afiliado.puestos.length > 0) {
    pdf.addText('PUESTOS ASIGNADOS', { bold: true, fontSize: 12 });
    
    const puestosActivos = afiliado.puestos.filter(p => p.estado === 'Activo');
    
    if (puestosActivos.length > 0) {
      const puestosColumns = [
        { header: 'N° Puesto', key: 'nro', format: (p) => p.nro },
        { header: 'Fila', key: 'fila' },
        { header: 'Cuadra', key: 'cuadra' },
        { header: 'Rubro', key: 'rubro', format: (p) => p.rubro || '—' },
        { header: 'Patente', key: 'tiene_patente', format: (p) => p.tiene_patente ? 'Sí' : 'No' },
        { header: 'Fecha Asignación', key: 'fecha_obtencion', format: (p) => 
          p.fecha_obtencion ? new Date(p.fecha_obtencion).toLocaleDateString('es-ES') : '—' }
      ];
      
      pdf.addTable(puestosColumns, puestosActivos);
    }
    
    // Historial
    const historial = afiliado.puestos.filter(p => p.estado !== 'Activo');
    if (historial.length > 0) {
      pdf.addText('HISTORIAL DE PUESTOS', { bold: true, fontSize: 12 });
      
      const historialColumns = [
        { header: 'N° Puesto', key: 'nro' },
        { header: 'Fila', key: 'fila' },
        { header: 'Cuadra', key: 'cuadra' },
        { header: 'Fecha Inicio', key: 'fecha_obtencion', format: (p) => 
          new Date(p.fecha_obtencion).toLocaleDateString('es-ES') },
        { header: 'Fecha Fin', key: 'fecha_fin', format: (p) => 
          p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-ES') : 'Actual' },
        { header: 'Razón', key: 'razon' }
      ];
      
      pdf.addTable(historialColumns, historial);
    }
  } else {
    pdf.addText('No tiene puestos asignados', { fontSize: 10, color: [100, 100, 100] });
  }
  
  pdf.save(`afiliado_${afiliado.ci}_detalle`);
};