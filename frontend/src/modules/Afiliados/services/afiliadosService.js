// Datos mock basados en el modelo ER
import { afiliadosMock } from '../datosMock';
  
  export const afiliadosService = {
    // Obtener lista de afiliados (simulado)
    getAfiliados: async () => {
      // Simulamos delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: afiliadosMock
      };
    },
  
    // Obtener un afiliado por ID (simulado)
    getAfiliadoById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const afiliado = afiliadosMock.find(a => a.id_afiliado === id);
      return {
        success: !!afiliado,
        data: afiliado || null
      };
    }
  };