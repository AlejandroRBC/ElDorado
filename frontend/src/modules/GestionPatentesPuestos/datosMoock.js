export const mockAfiliados = [
  {
    id_afiliado: 1,
    ci: "1234567",
    extension: "LP",
    nombre: "Juan",
    paterno: "Pérez",
    materno: "García",
    sexo: "M",
    fecNac: "1985-05-20",
    telefono: 70012345,
    ocupacion: "Comerciante",
    direccion: "Av. Siempre Viva 123",
    fecha_afiliacion: "2020-01-10",
    estado: true
  },
  {
    id_afiliado: 2,
    ci: "7654321",
    extension: "CB",
    nombre: "Maria",
    paterno: "Lopez",
    materno: "Sánchez",
    sexo: "F",
    fecNac: "1992-08-15",
    telefono: 60054321,
    ocupacion: "Artesana",
    direccion: "Calle Bolivar s/n",
    fecha_afiliacion: "2021-03-15",
    estado: true
  }
];

export const mockPuestos = [
  {
    id_puesto: 101,
    fila: "A",
    cuadra: "1",
    nroPuesto: 10,
    ancho: 2,
    largo: 3
  },
  {
    id_puesto: 102,
    fila: "B",
    cuadra: "1",
    nroPuesto: 15,
    ancho: 2,
    largo: 2
  }
];

export const mockPatentes = [
  {
    id_patente: 501,
    id_puesto: 101, 
    codigo_alcaldia: 2024001,
    estado: "Vigente"
  }
];


export const mockTenenciaPuesto = [
  {
    id_tenencia: 1,
    id_afiliado: 1, 
    id_puesto: 101,  
    fecha_ini: "2020-01-10",
    fecha_fin: null  
  },
  {
    id_tenencia: 2,
    id_afiliado: 2, 
    id_puesto: 102,
    fecha_ini: "2021-03-15",
    fecha_fin: null
  }

];
export const mockRubros = [
    { 
        id_rubro: 1, 
        nombre: "Abarrotes" 
    },
    { 
        id_rubro: 2, 
        nombre: "Plásticos" 
    },
    { 
        id_rubro: 3, 
        nombre: "Comida Rápida" 
    },
    { 
        id_rubro: 4, 
        nombre: "Ropa" 
    },
    { 
        id_rubro: 5, 
        nombre: "Electrónica" 
    }
];


export const mockpertenece = [
    { 
        id_puesto_rubro: 1, 
        id_puesto: 101, 
        id_rubro: 1 
    }, 
    { 
        id_puesto_rubro: 2, 
        id_puesto: 101, 
        id_rubro: 2 
    }, 
    { 
        id_puesto_rubro: 3, 
        id_puesto: 102, 
        id_rubro: 4 
    } 
];