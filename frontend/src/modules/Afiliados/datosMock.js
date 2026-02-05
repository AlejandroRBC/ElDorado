// Datos mock de puestos
const puestosMock = [
    { id_puesto: 1, fila: 'A', cuadra: 'Principal', nroPuesto: 5, ancho: 3, largo: 4 },
    { id_puesto: 2, fila: 'B', cuadra: 'Principal', nroPuesto: 12, ancho: 2.5, largo: 3.5 },
    { id_puesto: 3, fila: 'C', cuadra: 'Secundaria', nroPuesto: 3, ancho: 3, largo: 4 },
    { id_puesto: 4, fila: 'D', cuadra: 'Principal', nroPuesto: 7, ancho: 4, largo: 5 },
    { id_puesto: 5, fila: 'A', cuadra: 'Secundaria', nroPuesto: 8, ancho: 2.5, largo: 3 },
    { id_puesto: 6, fila: 'B', cuadra: 'Secundaria', nroPuesto: 15, ancho: 3, largo: 4 },
    { id_puesto: 7, fila: 'C', cuadra: 'Principal', nroPuesto: 2, ancho: 2, largo: 3 },
];

// Datos mock de patentes
const patentesMock = [
    { id_patente: 1, id_puesto: 1, codigo_alcaldia: 12345, estado: 'Activa' },
    { id_patente: 2, id_puesto: 2, codigo_alcaldia: 12346, estado: 'Activa' },
    { id_patente: 3, id_puesto: 4, codigo_alcaldia: 12347, estado: 'Activa' },
    { id_patente: 4, id_puesto: 6, codigo_alcaldia: 12348, estado: 'Vencida' },
    // Los puestos 3, 5 y 7 no tienen patente asignada
];

// Datos mock de tenencia de puestos
const tenenciaPuestosMock = [
    { id_tenencia: 1, id_afiliado: 1, id_puesto: 1, fecha_ini: '2023-01-10', fecha_fin: null },
    { id_tenencia: 2, id_afiliado: 1, id_puesto: 3, fecha_ini: '2023-06-15', fecha_fin: null },
    { id_tenencia: 3, id_afiliado: 2, id_puesto: 2, fecha_ini: '2023-03-15', fecha_fin: null },
    { id_tenencia: 4, id_afiliado: 4, id_puesto: 4, fecha_ini: '2022-11-05', fecha_fin: null },
    { id_tenencia: 5, id_afiliado: 4, id_puesto: 5, fecha_ini: '2023-02-10', fecha_fin: null },
    { id_tenencia: 6, id_afiliado: 5, id_puesto: 7, fecha_ini: '2021-07-22', fecha_fin: null },
    // Tenencias históricas (fecha_fin no es null)
    { id_tenencia: 7, id_afiliado: 3, id_puesto: 6, fecha_ini: '2024-02-20', fecha_fin: '2024-08-15' },
    { id_tenencia: 8, id_afiliado: 1, id_puesto: 5, fecha_ini: '2022-05-10', fecha_fin: '2023-06-14' },
];

// Función para obtener puestos activos de un afiliado
const obtenerPuestosActivosAfiliado = (idAfiliado) => {
    return tenenciaPuestosMock
        .filter(t => t.id_afiliado === idAfiliado && t.fecha_fin === null)
        .map(tenencia => {
            const puesto = puestosMock.find(p => p.id_puesto === tenencia.id_puesto);
            const patente = patentesMock.find(pt => pt.id_puesto === tenencia.id_puesto);
            return {
                ...puesto,
                patente: patente ? patente.codigo_alcaldia : null,
                estado_patente: patente ? patente.estado : 'Sin patente',
                fecha_asignacion: tenencia.fecha_ini
            };
        });
};

// Función para obtener historial de puestos de un afiliado
const obtenerHistorialPuestosAfiliado = (idAfiliado) => {
    return tenenciaPuestosMock
        .filter(t => t.id_afiliado === idAfiliado)
        .map(tenencia => {
            const puesto = puestosMock.find(p => p.id_puesto === tenencia.id_puesto);
            const patente = patentesMock.find(pt => pt.id_puesto === tenencia.id_puesto);
            return {
                ...puesto,
                patente: patente ? patente.codigo_alcaldia : null,
                estado_patente: patente ? patente.estado : 'Sin patente',
                fecha_ini: tenencia.fecha_ini,
                fecha_fin: tenencia.fecha_fin,
                estado: tenencia.fecha_fin ? 'Histórico' : 'Activo'
            };
        });
};

// Datos mock de afiliados
export const afiliadosMock = [
    {
        id_afiliado: 1,
        ci: "1234567",
        extension: "LP",
        nombre: "Juan",
        paterno: "Pérez",
        materno: "Gómez",
        sexo: "M",
        fecNac: "1980-05-15",
        telefono: 70123456,
        ocupacion: "Comerciante",
        direccion: "Calle Principal #123",
        fecha_afiliacion: "2023-01-10",
        estado: true,
        url_perfil: "/assets/perfiles/sinPerfil.png",
        puestos_activos: obtenerPuestosActivosAfiliado(1),
        historial_puestos: obtenerHistorialPuestosAfiliado(1)
    },
    {
        id_afiliado: 2,
        ci: "7654321",
        extension: "SC",
        nombre: "María",
        paterno: "López",
        materno: "Rodríguez",
        sexo: "F",
        fecNac: "1975-08-22",
        telefono: 70765432,
        ocupacion: "Artesana",
        direccion: "Av. Comercio #456",
        fecha_afiliacion: "2023-03-15",
        estado: true,
        url_perfil: "/assets/perfiles/9251135Bernas.jpg",
        puestos_activos: obtenerPuestosActivosAfiliado(2),
        historial_puestos: obtenerHistorialPuestosAfiliado(2)
    },
    {
        id_afiliado: 3,
        ci: "9876543",
        extension: "CB",
        nombre: "Carlos",
        paterno: "Méndez",
        materno: "Vargas",
        sexo: "M",
        fecNac: "1990-11-30",
        telefono: 70897654,
        ocupacion: "Carnicero",
        direccion: "Mercado Central Local 8",
        fecha_afiliacion: "2024-02-20",
        estado: false,
        url_perfil: "/assets/perfiles/sinPerfil.png",
        puestos_activos: obtenerPuestosActivosAfiliado(3),
        historial_puestos: obtenerHistorialPuestosAfiliado(3)
    },
    {
        id_afiliado: 4,
        ci: "4567890",
        extension: "LP",
        nombre: "Ana",
        paterno: "Castro",
        materno: "Torrez",
        sexo: "F",
        fecNac: "1988-04-18",
        telefono: 70456789,
        ocupacion: "Florista",
        direccion: "Plaza Flores #89",
        fecha_afiliacion: "2022-11-05",
        estado: true,
        url_perfil: "/assets/perfiles/9251135Castro.jpg",
        puestos_activos: obtenerPuestosActivosAfiliado(4),
        historial_puestos: obtenerHistorialPuestosAfiliado(4)
    },
    {
        id_afiliado: 5,
        ci: "2345678",
        extension: "SC",
        nombre: "Roberto",
        paterno: "Sánchez",
        materno: "Fernández",
        sexo: "M",
        fecNac: "1972-12-10",
        telefono: 70234567,
        ocupacion: "Electrodomésticos",
        direccion: "Av. Industrial #567",
        fecha_afiliacion: "2021-07-22",
        estado: true,
        url_perfil: "/assets/perfiles/sinPerfil.png",
        puestos_activos: obtenerPuestosActivosAfiliado(5),
        historial_puestos: obtenerHistorialPuestosAfiliado(5)
    }
];

// Exportar también las otras tablas por si se necesitan
export { puestosMock, patentesMock, tenenciaPuestosMock };