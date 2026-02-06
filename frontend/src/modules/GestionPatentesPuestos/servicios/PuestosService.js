export const filtrarPuestos = (puestos, patentes, tenencias, afiliados, criterios) => {
  return puestos.filter((puesto) => {
    const info = obtenerInfo(puesto, tenencias, afiliados, patentes);
    
    // Normalizamos los criterios a minúsculas para comparar seguro
    const busqueda = (criterios.texto || "").toLowerCase();
    const fPatente = (criterios.patente || "todos").toLowerCase();
    const fCuadra = (criterios.cuadra || "todos").toLowerCase();
    const fFila = (criterios.fila || "todos").toLowerCase();
    const fRubro = (criterios.rubro || "todos").toLowerCase();

    // 1. Coincidencia de Texto (Buscador general)
    const coincideTexto = 
      puesto.id_puesto.toString().includes(busqueda) ||
      info.nombreCompleto.toLowerCase().includes(busqueda) ||
      info.ci.toString().includes(busqueda) ||
      (puesto.rubros && puesto.rubros.toLowerCase().includes(busqueda)) ||
      (puesto.nroPuesto && puesto.nroPuesto.toString().includes(busqueda));

    // 2. Coincidencia de Patente
    let coincidePatente = true;
    if (fPatente === "con patente") coincidePatente = info.tienePatente;
    if (fPatente === "sin patente") coincidePatente = !info.tienePatente;

    // 3. Coincidencia de Cuadra (Convertimos ambos a string por seguridad)
    const coincideCuadra = fCuadra === "todos" || 
      puesto.cuadra.toString().toLowerCase() === fCuadra;

    // 4. Coincidencia de Fila
    const coincideFila = fFila === "todos" || 
      puesto.fila.toString().toLowerCase() === fFila;

    // 5. Coincidencia de Rubro
    const coincideRubro = fRubro === "todos" || 
      (puesto.rubros && puesto.rubros.toLowerCase().includes(fRubro));

    return coincideTexto && coincidePatente && coincideCuadra && coincideFila && coincideRubro;
  });
};

 //Retorna la patente específica de un puesto
 
export const obtenerPatenteDePuesto = (patentes, idPuesto) => {
    // Retorna el objeto si lo encuentra, o undefined si es un caso especial sin patente
    return patentes.find(pat => pat.id_puesto === idPuesto);
};

//info del puesto
export const obtenerInfo = (puesto, tenencias, afiliados, patentes) => {
    // Buscamos la tenencia activa para saber quién es el dueño hoy
    const tenenciaActiva = tenencias.find(t => t.id_puesto === puesto.id_puesto && t.switch === true);
    const patente = patentes.find(p => p.id_puesto === puesto.id_puesto);

    const afiliado = tenenciaActiva 
        ? afiliados.find(a => a.id_afiliado === tenenciaActiva.id_afiliado) 
        : null;

    return {
        nombreCompleto: afiliado ? `${afiliado.nombre} ${afiliado.paterno}` : "PUESTO VACANTE",
        ci: afiliado ? afiliado.ci : "-",
        fechaAdquisicion: tenenciaActiva ? tenenciaActiva.fecha_ini : "-",
        fechaFin: tenenciaActiva ? (tenenciaActiva.fecha_fin || "Vigente") : "-",
        rubrosPuesto: puesto.rubros || "Sin rubro asignado", 
        tienePatente: !!patente,
        codigoPatente: patente ? patente.codigo_alcaldia : "PENDIENTE"
    };
};



//para el form para limpiar
export const EstadoInicialPuesto = {
  fila: '',
  cuadra: '',
  nroPuesto: '',
  ancho: '',
  largo: '',
  rubros: '' 
};

export const EstadoIncialPatente ={
  codigo_alcaldia:'',
  estado: 'Vigente',
};

export const PrepararNuevoRegistro = (puestoData, tienePatente, patenteData)=>{
  const idPuesto = Date.now();
  const nuevoPuesto = { ...puestoData, id_puesto: idPuesto };

  let nuevaPatente = null;
  if (tienePatente) {
      nuevaPatente = {
        ...patenteData,
        id_patente: idPuesto + 1,
         id_puesto: idPuesto
       };
  }
  return {nuevoPuesto, nuevaPatente};

};
//para el traspaso
export const registrarMovimiento = (tenencias, idPuesto, idAfiliadoNuevo, razon, tipoMovimiento) => {
    const fechaHoy = new Date().toISOString().split('T')[0];

    // Desactivar tenencia actual
    const nuevasTenencias = tenencias.map(t => {
        if (t.id_puesto === idPuesto && t.switch === true) {
            return { 
                ...t, 
                switch: false, 
                fecha_fin: fechaHoy,
                razon: t.razon.includes("Salida:") ? t.razon : `${t.razon} (Salida por ${tipoMovimiento})`
            };
        }
        return t;
    });

    // Crear nueva tenencia si no es Despojo/Abandono
    if (idAfiliadoNuevo) {
        nuevasTenencias.push({
            id_tenencia: Date.now(),
            id_puesto: idPuesto,
            id_afiliado: parseInt(idAfiliadoNuevo),
            razon: razon,
            switch: true,
            fecha_ini: fechaHoy,
            fecha_fin: null
        });
    }

    return nuevasTenencias;
};

//para el historial del puesto we
export const obtenerHistorialPuesto = (idPuesto, tenencias, afiliados) => {
    // Seguridad: Si las listas no existen todavía, retornamos array vacío
    if (!tenencias || !afiliados) return [];

    return tenencias
        .filter(t => t.id_puesto === idPuesto)
        .map(t => {
            const af = afiliados.find(a => a.id_afiliado === t.id_afiliado);
            return {
                ...t,
                // Corrección de dedo: tenías "nomnreAfiliado"
                nombreAfiliado: af ? `${af.nombre} ${af.paterno}` : "Desconocido"
            };
        })
        .sort((a, b) => new Date(b.fecha_ini) - new Date(a.fecha_ini)); 
};
export const obtenerEstiloEstado = (tienePatente) => {
    return tienePatente ? "badge-activo" : "badge-inactivo";
};


export const filtrarAfiliadosParaTraspaso = (afiliados, busqueda) => {
    if (!busqueda) return [];
    const b = busqueda.toLowerCase();
    return afiliados.filter(af => 
        af.nombre.toLowerCase().includes(b) || 
        af.paterno.toLowerCase().includes(b) ||
        (af.materno && af.materno.toLowerCase().includes(b)) || 
        af.ci.toString().includes(b)
    ).slice(0, 5);
};