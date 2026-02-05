export const filtrarPuestos = (puestos, patentes, criterios) => {
  return puestos.filter((puesto) => {
    //busca la patente asociada
    const patenteAsociada = patentes.find(pat => pat.id_puesto === puesto.id_puesto);

    const fila = (puesto.fila || "").toString().toLowerCase();
    const cuadra = (puesto.cuadra || "").toString().toLowerCase();
    const nroPuesto = (puesto.nroPuesto || "").toString().toLowerCase();
    const busqueda = (criterios.texto || "").toLowerCase();
    const codAlcaldia = patenteAsociada ? (patenteAsociada.codigo_alcaldia || "").toString().toLowerCase() : "";

    //lógica de coincidencia de texto
    const coincideTexto = 
      nroPuesto.includes(busqueda) || 
      fila.includes(busqueda) || 
      cuadra.includes(busqueda) || 
      codAlcaldia.includes(busqueda);

    //lógica de coincidencia de select
    let coincidePatente = true;
    if (criterios.patente === "Con Patente") coincidePatente = !!patenteAsociada;
    if (criterios.patente === "Sin Patente") coincidePatente = !patenteAsociada;

    return coincideTexto && coincidePatente;
  });
};

/**
 * Retorna la patente específica de un puesto
 */
export const obtenerPatenteDePuesto = (patentes, idPuesto) => {
  return patentes.find(pat => pat.id_puesto === idPuesto);
};
/**
 * Prepara los objetos de Puesto y Patente vinculados
 */
export const prepararNuevoRegistro = (puestoData, tienePatente, patenteData) => {
    // Generamos un ID único para el puesto
    const idPuesto = Date.now();

    const nuevoPuesto = {
        ...puestoData,
        id_puesto: idPuesto
    };

    let nuevaPatente = null;
    if (tienePatente) {
        nuevaPatente = {
            ...patenteData,
            id_patente: idPuesto + 1, 
            id_puesto: idPuesto      
        };
    }

    return { nuevoPuesto, nuevaPatente };
};