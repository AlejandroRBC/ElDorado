import { useState } from 'react';
import { useAfiliadosList } from './hooks/useAfiliadosList';
import { useAfiliadoSelection } from './hooks/useAfiliadoSelection';
import { useCambiarEstadoAfiliado } from './hooks/useCambiarEstadoAfiliado';
import { useFiltroAfiliados } from './hooks/useFiltroAfiliados';
import { ListaAfiliados } from './components/ListaAfiliados';
import { ListaCardsAfiliados } from './components/ListaCardsAfiliados';
import { BarraBusqueda } from './components/BarraBusqueda';
import { AgregarAfiliado } from './components/AgregarAfiliado';
//import { ModalDetalleAfiliado } from './components/ModalDetalleAfiliado';
import { DetalleAfiliadoExclusivo } from './components/DetalleAfiliadoExclusivo';

import './estilos.css';
import './estilos/estiloTabla.css';
import './estilos/estiloModalDetalle.css';
import './estilos/estiloFormularioAgregar.css';
import './estilos/estiloCardsAfiliado.css';
import './estilos/estiloBarraBusqueda.css';
import './estilos/estiloDetalleExclusivo.css';

export default function AfiliadosModule() {
  
  const {
    afiliadoSeleccionado,
    mostrarDetalle,
    verDetalle,
    cerrarDetalle
  } = useAfiliadoSelection();

  const {
    afiliados,
    loading,
    error,
    recargar
  } = useAfiliadosList();

  const {
    desafiliar,
    loading: loadingDesafiliar
  } = useCambiarEstadoAfiliado();

  const {
    terminoBusqueda,
    setTerminoBusqueda,
    campoFiltro,
    setCampoFiltro,
    afiliadosFiltrados,
    limpiarBusqueda,
    totalResultados,
    totalAfiliados
  } = useFiltroAfiliados(afiliados);

  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'cards'

  const handleAfiliadoAdded = (nuevoAfiliado) => {
    console.log('Afiliado agregado:', nuevoAfiliado);
    recargar();
  };

  const handleDesafiliar = async (idAfiliado) => {
    const confirmar = window.confirm(
      '¿Está seguro de desafiliar a este afiliado? El afiliado pasará a estado inactivo.'
    );
    
    if (!confirmar) return;
    
    const resultado = await desafiliar(idAfiliado);
    
    if (resultado.success) {
      alert(resultado.message);
      recargar();
    } else {
      alert(`Error: ${resultado.error}`);
    }
  };

  const toggleVista = () => {
    setVistaActual(vistaActual === 'tabla' ? 'cards' : 'tabla');
  };

  return (
    <div className="afiliados-module">
      <div className="module-header">
        <h1>Gestión de Afiliados</h1>
        <div className="header-actions">
          <button 
            className="detalle-btn" 
            onClick={() => setMostrarAgregar(true)}
            style={{ marginRight: '10px' }}
          >
            + Nuevo Afiliado
          </button>
          
          <button 
            className="toggle-vista-btn" 
            onClick={toggleVista}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {vistaActual === 'tabla' ? 'Ver como Tarjetas' : 'Ver como Tabla'}
          </button>
          
          <button 
            className="refresh-btn" 
            onClick={recargar}
            disabled={loading || loadingDesafiliar}
          >
            ↻ Actualizar
          </button>
          
          <span className="total-count">
            {terminoBusqueda ? 
              `${totalResultados} resultado${totalResultados !== 1 ? 's' : ''}` : 
              `Total: ${afiliados.filter(a => a.estado).length} activos`
            }
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <BarraBusqueda
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        campoFiltro={campoFiltro}
        setCampoFiltro={setCampoFiltro}
        totalResultados={totalResultados}
        totalAfiliados={totalAfiliados}
        limpiarBusqueda={limpiarBusqueda}
      />

      {vistaActual === 'tabla' ? (
        <ListaAfiliados 
          afiliados={afiliadosFiltrados}  
          loading={loading}
          error={error}
          onVerDetalle={verDetalle}
          onDesafiliar={handleDesafiliar}
        />
      ) : (
        <ListaCardsAfiliados 
          afiliados={afiliadosFiltrados}  
          loading={loading}
          error={error}
          onVerDetalle={verDetalle}
          onDesafiliar={handleDesafiliar}
        />
      )}

      {mostrarDetalle && (
        <DetalleAfiliadoExclusivo  
          afiliado={afiliadoSeleccionado}
          onClose={cerrarDetalle}
        />
      )}

      {mostrarAgregar && (
        <AgregarAfiliado 
          onClose={() => setMostrarAgregar(false)}
          onAfiliadoAdded={handleAfiliadoAdded}
        />
      )}
    </div>
  );
}