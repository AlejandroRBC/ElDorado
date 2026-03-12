
// ============================================================
// OPCIONES ESTÁTICAS DE LOS SELECTS DE FILTRADO
// ============================================================
// Definidas en un archivo propio para que cualquier componente
// o test las importe sin depender de la implementación de
// BarraFiltros ni del módulo principal.

export const OPCIONES_PATENTE = [
    { value: 'true',  label: 'Con Patente' },
    { value: 'false', label: 'Sin Patente' },
  ];
  
  export const OPCIONES_ORDEN = [
    { value: 'alfabetico', label: 'Orden Alfabético' },
    { value: 'registro',   label: 'Fecha de Registro' },
  ];
  
  export const OPCIONES_PUESTO_COUNT = [
    { value: '1', label: '1 puesto'        },
    { value: '2', label: '2 puestos'       },
    { value: '3', label: '3 puestos'       },
    { value: '4', label: '4 puestos'       },
    { value: '5', label: '5 o más puestos' },
  ];