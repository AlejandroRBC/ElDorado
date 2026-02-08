import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import { Suspense, lazy } from 'react';

// Lazy loading de módulos
const HomeModule = lazy(() => import('../Inicio/InicioModule'));
const AfiliadosModule = lazy(() => import('../Afiliados/AfiliadosModule'));
//const PatentesModule = lazy(() => import('../../Patentes/PatentesModule'));

// esta importacion es para parte de afiliados
const DetallesAfiliado = lazy(() => import('../Afiliados/components/DetallesAfiliado'));
const NavegacionModule = () => {
  return (
    <AppShell
      header={{ height: 73 }}
      navbar={{ width: 200, breakpoint: 'sm' }}
      padding={-10}
    >
      <AppShell.Header style={{ backgroundColor: 'white', border: 'none' }}>
        <Topbar />
      </AppShell.Header>

      <AppShell.Navbar style={{ backgroundColor: '#0f0f0f', border: 'none', top: 73 }}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Suspense fallback={<div>Cargando módulo...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<HomeModule />} />
            <Route path="/afiliados" element={<AfiliadosModule />} />
            {/* <Route path="/patentes" element={<PatentesModule />} /> */}

            {/* ruta para pode rentrar al detalle de un afiliado */}
            <Route path="/afiliados/:id" element={<DetallesAfiliado />} />

            {/* Agrega más rutas aquí */}
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};

export default NavegacionModule;