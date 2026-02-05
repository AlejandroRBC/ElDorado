import { useState, useEffect } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliadoEdit(afiliadoId) {
    const [formData, setFormData] = useState(null);
    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Cargar datos del afiliado
    useEffect(() => {
        if (afiliadoId) {
            cargarAfiliado();
        }
    }, [afiliadoId]);

    const cargarAfiliado = async () => {
        try {
            setLoading(true);
            const response = await afiliadosService.getAfiliadoById(afiliadoId);
            if (response.success && response.data) {
                setFormData(response.data);
                // Si ya tiene una foto personalizada, establecer preview
                if (response.data.url_perfil && !response.data.url_perfil.includes('sinPerfil.png')) {
                    setImagenPreview(response.data.url_perfil);
                }
            }
        } catch (err) {
            setError('Error al cargar datos del afiliado');
            console.log(err);
            
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setError('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no debe exceder los 5MB');
            return;
        }

        setImagenPerfil(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagenPerfil(null);
        setImagenPreview(null);
        setFormData(prev => ({
            ...prev,
            url_perfil: '/assets/perfiles/sinPerfil.png'
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData) return;

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const datosActualizados = { ...formData };
            
            if (imagenPerfil) {
                // En producción, aquí subirías la nueva imagen
                const nombreArchivo = `perfil_${formData.ci}_${Date.now()}.${imagenPerfil.name.split('.').pop()}`;
                datosActualizados.url_perfil = `/assets/perfiles/${nombreArchivo}`;
            }

            const response = await afiliadosService.updateAfiliado(afiliadoId, datosActualizados);
            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError('Error al actualizar afiliado');
                return null;
            }
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(null);
        setImagenPerfil(null);
        setImagenPreview(null);
        setError('');
        setSuccess(false);
    };

    return {
        formData,
        imagenPerfil,
        imagenPreview,
        loading,
        error,
        success,
        handleChange,
        handleImageChange,
        handleRemoveImage,
        handleSubmit,
        resetForm
    };
}