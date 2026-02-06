import { Group, TextInput, Button, Paper,Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

const Topbar = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    console.log('Buscando:', searchValue);
    // Aquí iría la lógica de búsqueda
  };

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
      }}
    >
      <Group justify="space-between">
        <Group gap="lg">
          {/* Logo */}
          <Text
            fw={700}
            size="xl"
            style={{
              color: '#0f0f0f',
              letterSpacing: '2px',
              fontFamily: 'sans-serif',
            }}
          >
            EL  DORADO
          </Text>

          {/* Botón de búsqueda */}
          <Button
            onClick={handleSearch}
            variant="filled"
            color="#0f0f0f"
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              borderRadius: '4px',
              width: '40px',
              height: '40px',
              padding: 0,
            }}
          >
            <IconSearch size={20} />
          </Button>

          {/* Input de búsqueda */}
          <TextInput
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              width: '300px',
            }}
            styles={{
              input: {
                backgroundColor: '#0f0f0f',
                color: 'white',
                border: 'none',
                '&::placeholder': {
                  color: '#999',
                },
              },
            }}
          />
        </Group>
      </Group>
    </Paper>
  );
};

export default Topbar;