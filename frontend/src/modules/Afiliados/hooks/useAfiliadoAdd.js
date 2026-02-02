import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliadoAdd() {
    const [formData, setFormData] = useState(getInitialFormData());
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
            puesto: '',
            rubro: ''
        };
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await afiliadosService.createAfiliado(formData);
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

    const resetForm = () => {
        setFormData(getInitialFormData());
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
        loading,
        error,
        success,
        handleChange,
        handleSubmit,
        resetForm,
        setFieldValue
    };
}