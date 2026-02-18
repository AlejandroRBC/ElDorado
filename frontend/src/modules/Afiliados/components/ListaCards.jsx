import { Grid } from '@mantine/core';
import Card from './Card';

const ListaCards = ({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
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
          <Card 
            afiliado={afiliado} 
            esDeshabilitado={esDeshabilitados}
            onRehabilitar={onRehabilitar}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ListaCards;