export function usePuestosMock() {
  return [
    {
      id_puesto: 1,
      fila: 'A',
      cuadra: '1',
      nroPuesto: 1,
      ancho: 2,
      largo: 3,
      tiene_patente: true,
      rubro: 'Verduras',

      // JOIN tenencia_puesto
      tenencia: {
        fecha_ini: '2023-01-10',
        fecha_fin: null,

        // JOIN afiliado
        afiliado: {
          id_afiliado: 10,
          nombre: 'María',
          paterno: 'López',
          materno: 'Quispe',
          telefono: 76543210,
          es_habilitado: true
        }
      }
    },
    {
      id_puesto: 2,
      fila: 'A',
      cuadra: '1',
      nroPuesto: 2,
      ancho: 2,
      largo: 3,
      tiene_patente: false,
      rubro: null,
      tenencia: null
    }
  ]
}
