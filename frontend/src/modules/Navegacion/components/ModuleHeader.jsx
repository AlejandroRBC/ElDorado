import { Title, Group } from '@mantine/core';

const ModuleHeader = ({ title }) => {
  return (
    <Group justify="space-between" mb="xl" style={{ width: '100%' }}>
      <Title order={1} style={{ color: '#0f0f0f', fontSize: '2rem' }}>
        {title}
      </Title>
    </Group>
  );
};

export default ModuleHeader;