import { useAfiliadoAdd } from '../hooks/useAfiliadoAdd';
import { FormularioAfiliado } from './FormularioAfiliado';


export function AgregarAfiliado({ onClose, onAfiliadoAdded }) {
    const { 
        formData, 
        loading, 
        error, 
        
        handleChange, 
        handleSubmit,
        resetForm 
    } = useAfiliadoAdd();

    const handleFormSubmit = async (e) => {
        const nuevoAfiliado = await handleSubmit(e);
        if (nuevoAfiliado && onAfiliadoAdded) {
            onAfiliadoAdded(nuevoAfiliado);
            // Podríamos cerrar automáticamente después de un éxito
            // setTimeout(() => onClose(), 2000);
        }
    };

    const handleCancel = () => {
        if (!loading && window.confirm('¿Cancelar y perder los cambios?')) {
            resetForm();
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Agregar Nuevo Afiliado</h2>
                    <button 
                        className="close-btn" 
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>
                
                
                <FormularioAfiliado 
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}