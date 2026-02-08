import { useState } from 'react';
import { useAuth } from "../../../context/AuthContext";

import Sidebar from './Sidebar';
import TopBar from './TopBar';

import HomeModule from '../../Home/HomeModule';
import AfiliadosModule from '../../Afiliados/AfiliadosModule';
import MapaModule from '../../Mapa/MapaModule';

import '../styles/layout.css';

export default function LayoutPrincipal() {
    const { user, logout } = useAuth();

    const [moduloActivo, setModuloActivo] = useState('home');
    const [sidebarColapsada, setSidebarColapsada] = useState(false);

    const handleNavigate = (moduloId) => {
        setModuloActivo(moduloId);
    };

    const renderModulo = () => {
        switch (moduloActivo) {
            case 'home':
                return <HomeModule onNavigate={handleNavigate} />;

            case 'afiliados':
                return <AfiliadosModule />;

            case 'mapa':
                return <MapaModule />;

            case 'puestos':
                return <ModuloPlaceholder titulo="Puestos" />;

            case 'patentes':
                return <ModuloPlaceholder titulo="Patentes" />;

            case 'actividades':
                return <ModuloPlaceholder titulo="Actividades" />;

            case 'deudas':
                return <ModuloPlaceholder titulo="Deudas" />;

            case 'reportes':
                return <ModuloPlaceholder titulo="Reportes" />;

            case 'configuracion':
                return <ModuloPlaceholder titulo="Configuración" />;

            default:
                return <HomeModule onNavigate={handleNavigate} />;
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

            <div className={`main-content ${sidebarColapsada ? 'sidebar-colapsada' : ''}`}>
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
