import { Grid } from '@mantine/core';
import Card from './Card';

// Datos de ejemplo para las cards
const afiliadosEjemplo = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    ci: '1234567',
    rubro: 'Industria',
    patentes: ['ABC-123', 'XYZ-789'],
    estado: 'Activo',
    telefono: '76543210',
    email: 'juan@example.com',
  },
  {
    id: 2,
    nombre: 'María García Rodríguez ',
    ci: '7654321',
    rubro: 'Servicios',
    patentes: ['DEF-456'],
    estado: 'Activo',
    telefono: '71234567',
    email: 'maria@example.com',
  },
  {
    id: 3,
    nombre: 'Juan carlos',
    ci: '9876543',
    rubro: 'Comercio',
    patentes: ['GHI-789', 'JKL-012', 'MNO-345'],
    estado: 'Inactivo',
    telefono: '70123456',
    email: 'carlos@example.com',
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    ci: '4567890',
    rubro: 'Industria',
    patentes: ['PQR-678'],
    estado: 'Activo',
    telefono: '79876543',
    email: 'ana@example.com',
  },
  {
    id: 5,
    nombre: 'Luis Rodríguez',
    ci: '2345678',
    rubro: 'Servicios',
    patentes: ['STU-901', 'VWX-234'],
    estado: 'Activo',
    telefono: '78901234',
    email: 'luis@example.com',
  },
  {
    id: 6,
    nombre: 'Sofía Fernández',
    ci: '8765432',
    rubro: 'Comercio',
    patentes: ['YZA-567'],
    estado: 'Pendiente',
    telefono: '75678901',
    email: 'sofia@example.com',
  },
  {
    id: 7,
    nombre: 'Pedro Gómez',
    ci: '3456789',
    rubro: 'Industria',
    patentes: ['BCD-890', 'EFG-123'],
    estado: 'Activo',
    telefono: '73456789',
    email: 'pedro@example.com',
  },
  {
    id: 8,
    nombre: 'Laura Díaz',
    ci: '5678901',
    rubro: 'Servicios',
    patentes: ['HIJ-456'],
    estado: 'Activo',
    telefono: '72345678',
    email: 'laura@example.com',
  },
];

const ListaCards = () => {
  return (
    <Grid gutter="lg">
      {afiliadosEjemplo.map((afiliado) => (
        <Grid.Col 
          key={afiliado.id} 
          span={{
            base: 12,    // 1 columna en móviles
            xs: 7,       // 2 columnas en pantallas pequeñas
            sm: 7,       // 2 columnas en pantallas medianas
            md: 5,       // 3 columnas en pantallas grandes
            lg: 4,       // 4 columnas en pantallas extra grandes
          }}
        >
          <Card afiliado={afiliado} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ListaCards;