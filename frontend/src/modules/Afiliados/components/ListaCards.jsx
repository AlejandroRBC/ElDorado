import { Grid } from '@mantine/core';
import Card from './Card';

const ListaCards = ({ afiliados = [] }) => {
  return (
    <Grid gutter="lg">
      {afiliados.map((afiliado) => (
        <Grid.Col 
          key={afiliado.id} 
          span={{
            base: 12,
            xs: 6,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <Card afiliado={afiliado} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ListaCards;