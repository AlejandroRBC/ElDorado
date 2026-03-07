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
    dorado: ['#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#edbe3c', '#ffb300', '#ff8f00', '#ff6f00', '#ff5722'],
    negro:  ['#e0e0e0', '#b3b3b3', '#808080', '#666666', '#4d4d4d', '#333333', '#262626', '#1a1a1a', '#0f0f0f', '#000000'],
  },
  primaryColor: 'dorado',
  primaryShade: 5,
});