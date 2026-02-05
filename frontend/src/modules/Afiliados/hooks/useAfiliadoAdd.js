// frontend/src/modules/Afiliados/hooks/useAfiliadoAdd.js
import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliadoAdd() {
    const [formData, setFormData] = useState(getInitialFormData());
    const [imagenPerfil, setImagenPerfil] = useState(null); // Archivo de imagen
    const [imagenPreview, setImagenPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    function getInitialFormData() {
        return {
            ci: '',
            extension: 'LP',
            nombre: '',
            paterno: '',
            materno: '',
            sexo: 'M',
            fecNac: '',
            telefono: '',
            ocupacion: '',
            direccion: '',
            estado: true,
            url_perfil: '/assets/perfiles/sinPerfil.png'
        };
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejar selección de imagen - ahora guardamos el archivo
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.match('image.*')) {
            setError('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no debe exceder los 5MB');
            return;
        }

        // Guardar el archivo
        setImagenPerfil(file);
        
        // Crear preview para mostrar en el formulario
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Eliminar imagen seleccionada
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
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Si hay una imagen seleccionada, procesarla
            let urlFinal = '/assets/perfiles/sinPerfil.png';
            
            if (imagenPerfil) {
                // Subir la imagen
                const uploadResult = await subirImagenPerfil(imagenPerfil, formData.ci);
                if (uploadResult.success) {
                    urlFinal = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Error al subir la imagen');
                }
            }
            
            // Crear el afiliado con la URL de la imagen
            const datosAfiliado = {
                ...formData,
                url_perfil: urlFinal
            };

            const response = await afiliadosService.createAfiliado(datosAfiliado);
            if (response.success) {
                setSuccess(true);
                resetForm();
                return response.data;
            } else {
                setError('Error al crear afiliado');
                return null;
            }
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Función para simular la subida de imagen (en desarrollo)
    const subirImagenPerfil = async (archivo, ci) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // En desarrollo, simulamos la subida
                const extension = archivo.name.split('.').pop();
                const nombreArchivo = `perfil_${ci}_${Date.now()}.${extension}`;
                const url = `/assets/perfiles/${nombreArchivo}`;
                
                // En un entorno real, aquí enviarías el archivo al backend
                // Por ahora, solo simulamos la respuesta
                console.log(`Imagen simulada subida: ${nombreArchivo}`);
                
                resolve({
                    success: true,
                    url: url,
                    nombreArchivo: nombreArchivo
                });
            }, 1000);
        });
    };

    const resetForm = () => {
        setFormData(getInitialFormData());
        setImagenPerfil(null);
        setImagenPreview(null);
        setError('');
        setSuccess(false);
    };

    const setFieldValue = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
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
        resetForm,
        setFieldValue
    };
}