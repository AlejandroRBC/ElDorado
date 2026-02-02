import { useState } from 'react';
import { useAfiliadosList } from './hooks/useAfiliadosList';
import { useAfiliadoSelection } from './hooks/useAfiliadoSelection';
import { useCambiarEstadoAfiliado } from './hooks/useCambiarEstadoAfiliado';
import { ListaAfiliados } from './components/ListaAfiliados';
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

      <ListaAfiliados 
        afiliados={afiliados}
        loading={loading}
        error={error}
        onVerDetalle={verDetalle}
        onDesafiliar={handleDesafiliar}
      />

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