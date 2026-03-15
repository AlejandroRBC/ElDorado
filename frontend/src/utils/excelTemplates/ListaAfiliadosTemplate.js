export const prepararDatosAfiliados = (lista) => {
  const datosOrdenados = [...lista].sort((a, b) =>
    (a.paterno || '').localeCompare(b.paterno || '')
  );

  const datos = datosOrdenados.map((item, index) => ({
    ...item,
    nro_lista:   index + 1,
    ci_numero:   item.ci ? item.ci.split(' ')[0] : '',
    ci_expedido: item.ci?.includes('-') ? item.ci.split(' ')[1] : 'LP',
    nombre_solo: item.nombre  || '',
    ap_paterno:  item.paterno || '',
    ap_materno:  item.materno || '',
  }));

  // ── helpers ──────────────────────────────────────────────
  const parsePuesto = (p) => {
    const [nro = '', fila = '', ...resto] = p.trim().split('-');
    return { nro, fila, cuadra: resto.join('-') };
  };

  const joinCol = (puestos, key) =>
    puestos?.length
      ? puestos.map((p) => parsePuesto(p)[key]).join('\n')
      : '—';
  // ─────────────────────────────────────────────────────────

  const columnas = [
    {
      header:  'N°',
      key:     'nro_lista',
      format:  (r) => r.nro_lista,
      numeric: true,
      numFmt:  '0',
    },
    {
      header: 'NOMBRE',
      key:    'nombre_solo',
      format: (r) => r.nombre_solo || '',
    },
    {
      header: 'AP. PATERNO',
      key:    'ap_paterno',
      format: (r) => r.ap_paterno || '',
    },
    {
      header: 'AP. MATERNO',
      key:    'ap_materno',
      format: (r) => r.ap_materno || '',
    },
    {
      header:  'CI',
      key:     'ci_numero',
      format:  (r) => r.ci_numero || '',
      numeric: true,
      numFmt:  '0',
    },
    {
      header: 'EXPEDIDO',
      key:    'ci_expedido',
      format: (r) => r.ci_expedido || 'LP',
    },
    // ── PUESTOS dividido en 3 columnas ───────────────────
    {
      header: 'NRO PUESTO',
      key:    'nro_puesto',
      format: (r) => joinCol(r.puestos, 'nro'),
      style:  { alignment: { vertical: 'top', wrapText: true } },
    },
    {
      header: 'FILA',
      key:    'fila',
      format: (r) => joinCol(r.puestos, 'fila'),
      style:  { alignment: { vertical: 'top', wrapText: true } },
    },
    {
      header: 'CUADRA',
      key:    'cuadra',
      format: (r) => joinCol(r.puestos, 'cuadra'),
      style:  { alignment: { vertical: 'top', wrapText: true } },
    },
    // ─────────────────────────────────────────────────────
    {
      header:  'TOTAL PUESTOS',
      key:     'total_puestos',
      format:  (r) => r.total_puestos || 0,
      numeric: true,
      numFmt:  '0',
    },
    {
      header:  'PUESTOS CON PATENTE',
      key:     'puestos_con_patente',
      format:  (r) => r.puestos_con_patente || 0,
      numeric: true,
      numFmt:  '0',
    },
    {
      header: 'TELÉFONO',
      key:    'telefono',
      format: (r) => r.telefono || '—',
    },
  ];

  return { datos, columnas };
};