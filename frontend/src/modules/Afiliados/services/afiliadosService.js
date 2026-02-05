import { afiliadosMock } from '../datosMock';
  
export const afiliadosService = {
  getAfiliados: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: afiliadosMock
    };
  },

  getAfiliadoById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const afiliado = afiliadosMock.find(a => a.id_afiliado === id);
    return {
      success: !!afiliado,
      data: afiliado || null
    };
  },

  createAfiliado: async (afiliadoData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newId = Math.max(...afiliadosMock.map(a => a.id_afiliado)) + 1;
    
    const nuevoAfiliado = {
      id_afiliado: newId,
      ci: afiliadoData.ci,
      extension: afiliadoData.extension || "LP",
      nombre: afiliadoData.nombre,
      paterno: afiliadoData.paterno,
      materno: afiliadoData.materno || "",
      sexo: afiliadoData.sexo || "M",
      fecNac: afiliadoData.fecNac || new Date().toISOString().split('T')[0],
      telefono: afiliadoData.telefono || 0,
      ocupacion: afiliadoData.ocupacion || "",
      direccion: afiliadoData.direccion || "",
      fecha_afiliacion: new Date().toISOString().split('T')[0],
      estado: afiliadoData.estado !== undefined ? afiliadoData.estado : true,
      patentes: afiliadoData.patentes || [],
      puesto: afiliadoData.puesto || "Sin puesto asignado",
      rubro: afiliadoData.rubro || ""
    };
    
    afiliadosMock.push(nuevoAfiliado);
    
    return {
      success: true,
      data: nuevoAfiliado,
      message: "Afiliado creado exitosamente"
    };
  },

  // Cambiar estado a false = desafiliar
  cambiarEstadoAfiliado: async (idAfiliado, nuevoEstado) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const afiliadoIndex = afiliadosMock.findIndex(a => a.id_afiliado === idAfiliado);
    
    if (afiliadoIndex === -1) {
      return {
        success: false,
        message: "Afiliado no encontrado"
      };
    }
    
    // Actualizar solo el estado
    afiliadosMock[afiliadoIndex] = {
      ...afiliadosMock[afiliadoIndex],
      estado: nuevoEstado
    };
    
    const accion = nuevoEstado ? "afiliado" : "desafiliado";
    
    return {
      success: true,
      data: afiliadosMock[afiliadoIndex],
      message: `Afiliado ${accion} exitosamente`
    };
  },
 
updateAfiliado: async (id, afiliadoData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const afiliadoIndex = afiliadosMock.findIndex(a => a.id_afiliado === id);
  
  if (afiliadoIndex === -1) {
      return {
          success: false,
          message: "Afiliado no encontrado"
      };
  }
  
  // Actualizar afiliado
  afiliadosMock[afiliadoIndex] = {
      ...afiliadosMock[afiliadoIndex],
      ...afiliadoData
  };
  
  return {
      success: true,
      data: afiliadosMock[afiliadoIndex],
      message: "Afiliado actualizado exitosamente"
  };
}
};