// frontend/src/utils/pdfTemplates/afiliadoDetalleTemplate.js

import PDFGenerator from '../pdfExport';
import { pdfService } from '../../modules/Afiliados/services/pdfService';
import { notifications } from '@mantine/notifications';

/**
 * Formatear nombre del afiliado para el archivo
 */
const formatearNombreParaArchivo = (nombre) => {
  if (!nombre) return 'SinNombre';
  
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');
};


/**
 * Generar timestamp completo: YYYY-MM-DD-HH-MM-SS
 */
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

/**
 * Exportar PDF usando el ID del afiliado
 * @param {number} afiliadoId - ID del afiliado
 */
export const exportAfiliadoDetalleToPDF = async (afiliadoId) => {
  let pdf = null;
  
  try {
    // Mostrar notificación de carga
    notifications.show({
      id: 'pdf-loading',
      title: '📄 Generando reporte',
      message: 'Obteniendo datos actualizados...',
      color: 'blue',
      loading: true,
      autoClose: false
    });
    
    // 1. OBTENER DATOS FRESCOS DEL BACKEND
    console.log('🔍 Obteniendo datos frescos del afiliado ID:', afiliadoId);
    const afiliado = await pdfService.obtenerDatosParaPDFFresh(afiliadoId);
    
    if (!afiliado) {
      throw new Error('No se encontraron datos del afiliado');
    }
    
    console.log('✅ Datos obtenidos:', {
      nombre: afiliado.nombreCompleto,
      puestos: afiliado.puestos?.length || 0
    });
    
    // 2. CREAR PDF CON DATOS FRESCOS
    pdf = new PDFGenerator({ orientation: 'portrait' });
    
    // ============================================
    // ENCABEZADO CON FECHA DE GENERACIÓN
    // ============================================
    const fechaGeneracion = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    pdf.addHeader(
      'REPORTE DE AFILIADO',
      `Generado: ${fechaGeneracion}`
    );
    
    // ============================================
    // INFORMACIÓN DEL AFILIADO
    // ============================================
    const headers = ['Campo', 'Valor'];
    const data = [
      ['Nombre Completo', afiliado.nombreCompleto || 'No especificado'],
      ['CI', afiliado.ci || 'No especificado'],
      ['Fecha de Nacimiento', afiliado.fecNac ? new Date(afiliado.fecNac).toLocaleDateString('es-ES') : 'No especificado'],
      ['Edad', afiliado.edad ? `${afiliado.edad} años` : 'No especificado'],
      ['Sexo', afiliado.sexo || 'No especificado'],
      ['Teléfono', afiliado.telefono || 'No especificado'],
      ['Ocupación', afiliado.ocupacion || 'No especificado'],
      ['Dirección', afiliado.direccion || 'No especificado'],
      ['Fecha Afiliación', afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : 'No especificado'],
      ['Estado', afiliado.es_habilitado ? 'ACTIVO' : 'DESHABILITADO']
    ];

    pdf.addTable(headers, data);
    pdf.addSeparator();

    // ============================================
    // PUESTOS ACTUALES
    // ============================================
    const puestosActivos = afiliado.puestos?.filter(p => p.estado === 'Activo') || [];

    pdf.addText('PUESTOS ACTUALES', { bold: true, fontSize: 14 });

    if (puestosActivos.length > 0) {
      const puestosHeaders = ['N°', 'Fila', 'Cuadra', 'Rubro', 'Patente', 'Fecha Asignación'];
      const puestosData = puestosActivos.map(p => [
        p.nro || p.nroPuesto || '—',
        p.fila || '—',
        p.cuadra || '—',
        p.rubro || '—',
        p.tiene_patente ? 'SÍ' : 'NO',
        p.fecha_obtencion ? new Date(p.fecha_obtencion).toLocaleDateString('es-ES') : '—'
      ]);

      pdf.addTable(puestosHeaders, puestosData);
      
      // Resumen
      const conPatente = puestosActivos.filter(p => p.tiene_patente).length;
      pdf.addText(`Total: ${puestosActivos.length} puestos (${conPatente} con patente)`, { 
        fontSize: 10,
        indent: 5 
      });
    } else {
      pdf.addText('No tiene puestos asignados actualmente', { 
        fontSize: 10, 
        color: [100, 100, 100] 
      });
    }

    // ============================================
    // HISTORIAL (si existe)
    // ============================================
    const historial = afiliado.puestos?.filter(p => p.estado !== 'Activo') || [];
    
    if (historial.length > 0) {
      pdf.addText('HISTORIAL DE PUESTOS', { bold: true, fontSize: 14 });
      
      const historialHeaders = ['N°', 'Fila', 'Cuadra', 'Fecha Inicio', 'Fecha Fin', 'Razón'];
      const historialData = historial.map(p => [
        p.nro || p.nroPuesto || '—',
        p.fila || '—',
        p.cuadra || '—',
        p.fecha_obtencion ? new Date(p.fecha_obtencion).toLocaleDateString('es-ES') : '—',
        p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-ES') : '—',
        p.razon || '—'
      ]);
      
      pdf.addTable(historialHeaders, historialData);
    }

    // ============================================
    // GENERAR NOMBRE DEL ARCHIVO
    // ============================================
    const nombreAfiliado = formatearNombreParaArchivo(afiliado.nombreCompleto || afiliado.nombre);
    const timestamp = obtenerTimestampCompleto();

    const nombreArchivo = `Reporte-${nombreAfiliado}${timestamp}`;
    
    // 3. GUARDAR PDF
    pdf.save(nombreArchivo);
    
    // 4. NOTIFICACIÓN DE ÉXITO
    notifications.update({
      id: 'pdf-loading',
      title: '✅ Reporte generado',
      message: `Datos actualizados al ${fechaGeneracion}`,
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