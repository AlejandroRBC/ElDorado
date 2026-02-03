import { useState } from 'react';
import { useAfiliadosList } from './hooks/useAfiliadosList';
import { useAfiliadoSelection } from './hooks/useAfiliadoSelection';
import { useCambiarEstadoAfiliado } from './hooks/useCambiarEstadoAfiliado';
import { ListaAfiliados } from './components/ListaAfiliados';
import { ListaCardsAfiliados } from './components/ListaCardsAfiliados';
import { ModalDetalleAfiliado } from './components/ModalDetalleAfiliado';
import { AgregarAfiliado } from './components/AgregarAfiliado';
import './estilos.css';

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
            Total activos: {afiliados.filter(a => a.estado).length} afiliados
          </span>
        </div>
      </div>

      {vistaActual === 'tabla' ? (
        <ListaAfiliados 
          afiliados={afiliados}
          loading={loading}
          error={error}
          onVerDetalle={verDetalle}
          onDesafiliar={handleDesafiliar}
        />
      ) : (
        <ListaCardsAfiliados 
          afiliados={afiliados}
          loading={loading}
          error={error}
          onVerDetalle={verDetalle}
          onDesafiliar={handleDesafiliar}
        />
      )}

      {mostrarDetalle && (
        <ModalDetalleAfiliado 
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