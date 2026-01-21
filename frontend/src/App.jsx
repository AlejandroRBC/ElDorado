// frontend/src/App.jsx
import { MantineProvider, createTheme, Container, Center } from '@mantine/core';
import LoginModule from './modules/Login/LoginModule';

// Definimos la paleta dorada personalizada
const elDoradoTheme = createTheme({
  colors: {
    dorado: [
      '#fdf9e2', '#f9f1c5', '#f2e28d', '#eabd51', '#e49f22', 
      '#d4af37', '#b38f2a', '#917120', '#71561a', '#523e14',
    ],
  },
  primaryColor: 'dorado',
  primaryShade: 5, // El color #d4af37
});

function App() {
  return (
    <MantineProvider theme={elDoradoTheme}>
      <div>
        <Center style={{ height: '100vh' }}>
          <Container size="xs" w={400}>
            <LoginModule />
          </Container>
        </Center>
      </div>
    </MantineProvider>
  );
}

export default App;