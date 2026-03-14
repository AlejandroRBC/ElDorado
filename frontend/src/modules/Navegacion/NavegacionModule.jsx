import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { Suspense, lazy } from 'react';
import { useMediaQuery } from 'react-responsive';
import Topbar from './components/TopBar';
import Sidebar from './components/Sidebar';

// ============================================
// MÓDULO DE NAVEGACIÓN
// ============================================

// ── Lazy loading de módulos para mejor rendimiento ──
const InicioModule                 = lazy(() => import('../Inicio/InicioModule'));
const AfiliadosModule              = lazy(() => import('../Afiliados/AfiliadosModule'));
const GestionPatentesPuestosModule = lazy(() => import('../../modules/GestionPatentesPuestos/GestionPatentesPuestosModule'));
const MapaModule                   = lazy(() => import('../Mapa/MapaModule'));
const UsuariosModule               = lazy(() => import('../Usuario/UsuariosModule'));
const DetallesAfiliado             = lazy(() => import('../Afiliados/components/DetallesAfiliado'));
const EditarAfiliadoPage           = lazy(() => import('../Afiliados/pages/EditarAfiliadoPage'));
const DirectorioModule = lazy(() => import('../Directorio/DirectorioModule'));

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Shell principal de la aplicación autenticada.
 * Ajusta el ancho del navbar según el dispositivo:
 *  - Móvil (≤640px): navbar oculto (breakpoint 'sm' de Mantine lo maneja)
 *  - Tablet (641-1024px): navbar de 60px solo íconos
 *  - Desktop (>1024px): navbar de 200px con texto
 */
const NavegacionModule = () => {
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // Ancho del navbar según dispositivo
  const navbarWidth = isMobile ? 0 : isTablet ? 60 : 200;

  return (
    <AppShell
      header={{ height: 73 }}
      navbar={{ width: navbarWidth, breakpoint: 'sm' }}
      padding={-10}
    >
      {/* ── Topbar superior ── */}
      <AppShell.Header style={{ backgroundColor: 'white', border: 'none' }}>
        <Topbar />
      </AppShell.Header>

      {/* ── Sidebar lateral ── */}
      {!isMobile && (
        <AppShell.Navbar style={{ backgroundColor: '#0f0f0f', border: 'none', top: 73 }}>
          <Sidebar />
        </AppShell.Navbar>
      )}

      {/* ── Área de contenido con rutas ── */}
      <AppShell.Main>
        <Suspense fallback={
          <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
            Cargando módulo...
          </div>
        }>
          <Routes>
            <Route path="/"                     element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio"               element={<InicioModule />} />
            <Route path="/afiliados"            element={<AfiliadosModule />} />
            <Route path="/gestionPuestos"       element={<GestionPatentesPuestosModule />} />
            <Route path="/mapa"                 element={<MapaModule />} />
            <Route path="/admin/usuarios"       element={<UsuariosModule />} />
            <Route path="/afiliados/:id"        element={<DetallesAfiliado />} />
            <Route path="/afiliados/editar/:id" element={<EditarAfiliadoPage />} />
            <Route path="/directorio" element={<DirectorioModule />} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};

export default NavegacionModule;