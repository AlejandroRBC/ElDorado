import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useCambiarEstadoAfiliado() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const cambiarEstado = async (idAfiliado, nuevoEstado) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await afiliadosService.cambiarEstadoAfiliado(idAfiliado, nuevoEstado);
            
            if (response.success) {
                setSuccess(true);
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                setError(response.message || 'Error al cambiar estado del afiliado');
                return {
                    success: false,
                    error: response.message
                };
            }
        } catch (err) {
            const errorMsg = err.message || 'Error al conectar con el servidor';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        } finally {
            setLoading(false);
        }
    };

    // Método específico para desafiliar (estado = false)
    const desafiliar = async (idAfiliado) => {
        return await cambiarEstado(idAfiliado, false);
    };

    // Método específico para afiliar (estado = true)
    const afiliar = async (idAfiliado) => {
        return await cambiarEstado(idAfiliado, true);
    };

    const reset = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        cambiarEstado,
        desafiliar,
        afiliar,
        loading,
        error,
        success,
        reset
    };
}