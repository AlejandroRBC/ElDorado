// frontend/src/theme.js

// ============================================
// TEMA GLOBAL DE MANTINE
// ============================================

import { createTheme } from '@mantine/core';

/**
 * Define el tema personalizado de la aplicación.
 * - dorado: escala de amarillos basada en #edbe3c (índice 5 como primario)
 * - negro: escala de grises oscuros basada en #0f0f0f
 */
export const theme = createTheme({
  colors: {
    dorado: ['#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c', '#edbe3c'],
    negro:  ['#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f', '#0f0f0f'],
  },
  primaryColor: 'dorado',
  primaryShade: 5,
});