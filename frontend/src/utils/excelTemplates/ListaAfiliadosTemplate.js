// frontend/src/utils/excelTemplates/ListaAfiliadosTemplate.js

// Colores ARGB para ExcelJS (richText)
const COLOR_VERDE  = '075903'; // tiene patente
const COLOR_ROJO   = '9c0312'; // sin patente
const FONT_NAME    = 'Calibri';  // debe coincidir con el exportador genérico

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

  /** Versión plana: sin info de patente (fallback) */
  const joinCol = (puestos, key) =>
    puestos?.length
      ? puestos.map((p) => parsePuesto(p)[key]).join('\n')
      : '—';

  /**
   * Versión richText: colorea cada línea según tienePatente.
   * Usa puestosDetalle o puestos_id si están disponibles;
   * si no, delega a joinCol (texto plano).
   *
   * @param {Object} r   - fila de datos
   * @param {string} key - 'nro' | 'fila' | 'cuadra'
   */
  const joinColRich = (r, key) => {
    const lista = r.puestosDetalle ?? r.puestos_id ?? null;

    // Sin info de patente → texto plano
    if (!lista?.length) return joinCol(r.puestos, key);

    const segments = lista.flatMap((p, i) => {
      const parsed = parsePuesto(p.puestos ?? '');
      const texto  = parsed[key] || '—';
      const color  = p.tienePatente ? COLOR_VERDE : COLOR_ROJO;
      const salto  = i < lista.length - 1 ? '\n' : '';
      return [
        { text: `${texto}${salto}`, font: { name: FONT_NAME, color: { argb: color } } },
      ];
    });

    return { richText: segments };
  };
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
      format: (r) => joinColRich(r, 'nro'),
      style:  { alignment: { vertical: 'top', wrapText: true } },
    },
    {
      header: 'FILA',
      key:    'fila',
      format: (r) => joinColRich(r, 'fila'),
      style:  { alignment: { vertical: 'top', wrapText: true } },
    },
    {
      header: 'CUADRA',
      key:    'cuadra',
      format: (r) => joinColRich(r, 'cuadra'),
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