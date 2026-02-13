import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import { Suspense, lazy } from 'react';

// Lazy loading de módulos
const InicioModule = lazy(() => import('../Inicio/InicioModule'));
const AfiliadosModule = lazy(() => import('../Afiliados/AfiliadosModule'));
const GestionPatentesPuestosModule = lazy(() => import('../../modules/GestionPatentesPuestos/GestionPatentesPuestosModule'));
const MapaModule = lazy(() => import('../Mapa/MapaModule'));
const UsuariosModule = lazy(() => import('../Usuario/UsuariosModule')); 

// esta importacion es para parte de afiliados
const DetallesAfiliado = lazy(() => import('../Afiliados/components/DetallesAfiliado'));
const EditarAfiliadoPage = lazy(() => import('../Afiliados/pages/EditarAfiliadoPage'));


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
            <Route path="/inicio" element={<InicioModule />} />
            <Route path="/afiliados" element={<AfiliadosModule />} />
            <Route path="/gestionPuestos" element={<GestionPatentesPuestosModule />} />
            <Route path="/mapa" element={<MapaModule />} /> {/* Nueva ruta */}
            <Route path="/admin/usuarios" element={<UsuariosModule />} />
            {/* ruta para poder entrar al detalle de un afiliado */}
            <Route path="/afiliados/:id" element={<DetallesAfiliado />} />
            <Route path="/afiliados/editar/:id" element={<EditarAfiliadoPage />} />


            {/* Agrega más rutas aquí */}
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};

export default NavegacionModule;