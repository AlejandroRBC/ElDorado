/* LISTA DE HOOKS  */
import { useAfiliadosList } from './hooks/useAfiliadosList';
import { useAfiliadoSelection } from './hooks/useAfiliadoSelection';
/* LISTA DE COMPONENTES  */
import { ListaAfiliados } from './components/ListaAfiliados';
import { ModalDetalleAfiliado } from './components/ModalDetalleAfiliado';
/* ESTILOS  DEL COMPONENTES TEMPORALES*/
import './estilos.css';

export default function AfiliadosModule() {
  
  const {
    afiliadoSeleccionado,
    mostrarDetalle,
    verDetalle,
    cerrarDetalle
  } = useAfiliadoSelection();

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
        <ModalDetalleAfiliado 
          afiliado={afiliadoSeleccionado}
          onClose={cerrarDetalle}
        />
      )}
    </div>
  );
}