//
// Punto central de re-exportación de templates de Excel.
// Importa siempre desde aquí, no desde el archivo individual:
//
//   import { prepararDatosAfiliados } from '../../utils/excelTemplates';
//
// Para añadir un template nuevo:
//   1. Crea  NombreTemplate.js  en esta carpeta con tu función prepararDatos*
//   2. Añade la línea export debajo.

export { prepararDatosAfiliados } from './ListaAfiliadosTemplate';