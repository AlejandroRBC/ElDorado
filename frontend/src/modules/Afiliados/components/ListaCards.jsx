import { Grid } from '@mantine/core';
import Card from './Card';

const ListaCards = ({ afiliados = [] }) => {
  return (
    <Grid gutter="lg">
      {afiliados.map((afiliado) => (
        <Grid.Col 
          key={afiliado.id} 
          span={{
            base: 13,
            xs: 7,
            sm: 7,
            md: 5,
            lg: 4,
          }}
        >
          <Card afiliado={afiliado} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ListaCards;