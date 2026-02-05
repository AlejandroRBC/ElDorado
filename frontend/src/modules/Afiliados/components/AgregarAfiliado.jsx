import { useAfiliadoAdd } from '../hooks/useAfiliadoAdd';
import { FormularioAfiliado } from './FormularioAfiliado';

export function AgregarAfiliado({ onClose, onAfiliadoAdded }) {
    const { 
        formData, 
        loading, 
        error, 
        handleChange, 
        handleImageChange,
        handleRemoveImage,
        handleSubmit,
        resetForm 
    } = useAfiliadoAdd();

    const handleFormSubmit = async (e) => {
        const nuevoAfiliado = await handleSubmit(e);
        if (nuevoAfiliado && onAfiliadoAdded) {
            onAfiliadoAdded(nuevoAfiliado);
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
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
                    onImageChange={handleImageChange}
                    onRemoveImage={handleRemoveImage}
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    error={error}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}