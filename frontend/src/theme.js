import { createTheme } from '@mantine/core';

export const elDoradoTheme = createTheme({
  colors: {
    dorado: [
      '#fdf9e2', '#f9f1c5', '#f2e28d', '#eabd51', '#e49f22', 
      '#d4af37', '#b38f2a', '#917120', '#71561a', '#523e14',
    ],
  },
  primaryColor: 'dorado',
  primaryShade: 5,
  // Configuramos que los componentes por defecto usen un estilo limpio
  components: {
    Paper: {
      defaultProps: {
        bg: 'white',
        withBorder: true,
        shadow: 'sm',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});