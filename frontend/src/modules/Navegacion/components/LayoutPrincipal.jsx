import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMediaQuery } from 'react-responsive';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import HomeModule from '../../Home/HomeModule';
import AfiliadosModule from '../../Afiliados/AfiliadosModule';
import MapaModule from '../../Mapa/MapaModule';
import '../styles/navegacion.css';

// ============================================
// LAYOUT PRINCIPAL
// ============================================

/**
 * Layout raíz de la aplicación autenticada.
 * Gestiona la sidebar, el topbar y el módulo activo.
 * En móvil la sidebar se colapsa automáticamente.
 */
export default function LayoutPrincipal() {
  const { user, logout } = useAuth();

  // ── Breakpoints responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });

  const [moduloActivo, setModuloActivo]     = useState('home');
  const [sidebarColapsada, setSidebarColapsada] = useState(isMobile);

  /**
   * Navegar a un módulo por su ID
   * @param {string} moduloId - Identificador del módulo destino
   */
  const handleNavigate = (moduloId) => {
    setModuloActivo(moduloId);
    // En móvil colapsar sidebar al navegar
    if (isMobile) setSidebarColapsada(true);
  };

  /**
   * Renderizar el módulo activo según el estado
   */
  const renderModulo = () => {
    switch (moduloActivo) {
      case 'home':          return <HomeModule onNavigate={handleNavigate} />;
      case 'afiliados':     return <AfiliadosModule />;
      case 'mapa':          return <MapaModule />;
      case 'puestos':       return <ModuloPlaceholder titulo="Puestos" />;
      case 'patentes':      return <ModuloPlaceholder titulo="Patentes" />;
      case 'actividades':   return <ModuloPlaceholder titulo="Actividades" />;
      case 'deudas':        return <ModuloPlaceholder titulo="Deudas" />;
      case 'reportes':      return <ModuloPlaceholder titulo="Reportes" />;
      case 'configuracion': return <ModuloPlaceholder titulo="Configuración" />;
      default:              return <HomeModule onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="layout-principal">
      <Sidebar
        moduloActivo={moduloActivo}
        setModuloActivo={setModuloActivo}
        colapsada={sidebarColapsada}
        setColapsada={setSidebarColapsada}
      />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarColapsada || isMobile ? 0 : (isTablet ? 160 : 200),
          transition: 'margin-left 0.3s ease',
        }}
      >
        <TopBar
          usuario={user}
          onLogout={logout}
          onToggleSidebar={() => setSidebarColapsada(!sidebarColapsada)}
          sidebarColapsada={sidebarColapsada}
        />

        <div className="content-area">
          {renderModulo()}
        </div>
      </div>
    </div>
  );
}