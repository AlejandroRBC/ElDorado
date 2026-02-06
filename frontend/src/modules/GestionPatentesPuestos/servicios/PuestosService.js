 //Filtra la lista de puestos basándose en criterios de búsqueda y estado de patente

export const filtrarPuestos = (puestos, patentes, tenencias, afiliados, criterios) => {
    if (!puestos) return [];

    return puestos.filter((puesto) => {
        // 1. Obtener información extendida para filtrar por nombre o CI
        const info = obtenerInfo(puesto, tenencias, afiliados, patentes);
        const busqueda = criterios.texto.toLowerCase();

        const coincideTexto = 
            puesto.id_puesto.toString().toLowerCase().includes(busqueda) ||
            info.nombreCompleto.toLowerCase().includes(busqueda) ||
            (info.ci && info.ci.includes(busqueda)) ||
            (puesto.rubro && puesto.rubro.toLowerCase().includes(busqueda));

        // 2. Filtro por estado de patente
        const coincidePatente = 
            criterios.patente === "todos" || 
            (criterios.patente === "patentado" && info.tienePatente) ||
            (criterios.patente === "pendiente" && !info.tienePatente);

        return coincideTexto && coincidePatente;
    });
};

//Cruza los datos de un puesto con tenencias y afiliados para obtener la info del dueño actual

export const obtenerInfo = (puesto, tenencias, afiliados, patentes = []) => {
    // 1. Buscar la tenencia vigente (donde fecha_fin es null o no existe)
    const tenenciaActual = tenencias.find(
        (t) => t.id_puesto === puesto.id_puesto && (!t.fecha_fin || t.fecha_fin === "")
    );

    // 2. Buscar al afiliado dueño
    const afiliado = tenenciaActual 
        ? afiliados.find((a) => a.id_afiliado === tenenciaActual.id_afiliado)
        : null;

    // 3. Verificar si tiene patente pagada (lógica simplificada, ajustar según tu tabla patentes)
    const tienePatente = puesto.tiene_patente === 1; 

    return {
        nombreCompleto: afiliado 
            ? `${afiliado.nombre} ${afiliado.paterno || ''} ${afiliado.materno || ''}`.trim().toUpperCase()
            : "PUESTO VACANTE",
        ci: afiliado ? `${afiliado.ci} ${afiliado.extension || ''}` : null,
        fechaAdquisicion: tenenciaActual ? tenenciaActual.fecha_ini : null,
        tienePatente: tienePatente,
        razon: tenenciaActual ? tenenciaActual.razon : "SIN ASIGNAR",
        datosAfiliado: afiliado // Devolvemos el objeto completo por si el modal de detalles lo necesita
    };
};

//Formatea los rubros para mostrar en Badges
export const formatearRubros = (rubroString) => {
    if (!rubroString) return [];
    return rubroString.split(',').map(r => r.trim()).filter(r => r !== "");
};