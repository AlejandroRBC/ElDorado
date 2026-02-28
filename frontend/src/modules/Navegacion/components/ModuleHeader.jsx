import { Title, Group } from '@mantine/core';

const ModuleHeader = ({ title }) => {
  return (
    <Group justify="space-between" mb="xl" style={{ width: '100%' }}>
      <Title order={1} fw = "800" style={{ color: '#0f0f0f', fontSize: '2rem',padding:'10px' }}>
        {title}
      </Title>
    </Group>
  );
};

export default ModuleHeader;