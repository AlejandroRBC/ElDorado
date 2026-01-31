  
import { useAfiliadosList } from './hooks/useAfiliadosList';
import { useAfiliadosSelection } from './hooks/useAfiliadoSelection';



import { ListaAfiliados } from './components/ListaAfiliados';
import { DetalleAfiliado } from './components/DetalleAfiliado';

import './estilos.css';
export default function AfiliadosModule() {
  const {
    afiliadoSeleccionado,
    mostrarDetalle,
    verDetalle,
    cerrarDetalle
  } = useAfiliadosSelection();

  const{
    afiliados,
    loading,
    error,
    recargar
  }= useAfiliadosList();

  return (
    <div className="afiliados-module">
      <div className="module-header">
        <h1>Gestión de Afiliados</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={recargar}>
            ↻ Actualizar
          </button>
          <span className="total-count">
            Total: {afiliados.length} afiliados
          </span>
        </div>
      </div>

      <ListaAfiliados 
        afiliados={afiliados}
        loading={loading}
        error={error}
        onVerDetalle={verDetalle}
      />

      {mostrarDetalle && (
        <DetalleAfiliado 
          afiliado={afiliadoSeleccionado}
          onClose={cerrarDetalle}
        />
      )}
    </div>
  );
}