import { memo } from 'react';
import { Grid } from '@mantine/core';
import Card from './ui/AfiliadoCard';
// React.memo evita que toda la grilla de cards se re-renderice
// cuando el módulo padre cambia de estado por razones ajenas
// a la lista (p.ej. apertura de un modal, cambio de vista).
const ListaCards = memo(({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
  return (
    <Grid gutter="lg">
      {afiliados.map((afiliado) => (
        <Grid.Col
          key={afiliado.id}
          span={{ base: 12, xs: 7, sm: 7, md: 5, lg: 4 }}
        >
          <Card
            afiliado={afiliado}
            esDeshabilitado={esDeshabilitados}
            onRehabilitar={onRehabilitar}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
});

ListaCards.displayName = 'ListaCards';

export default ListaCards;