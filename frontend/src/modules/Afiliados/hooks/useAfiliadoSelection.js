import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliadoSelection() {
    const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
        
    const verDetalle = async (id) => {
        try {
        const response = await afiliadosService.getAfiliadoById(id);
        if (response.success) {
            setAfiliadoSeleccionado(response.data);
            setMostrarDetalle(true);
        }
        } catch (err) {
        console.error('Error al cargar detalles:', err);
        }
    };

    const cerrarDetalle = () => {
        setMostrarDetalle(false);
        setAfiliadoSeleccionado(null);
    };

    return {
        afiliadoSeleccionado,
        mostrarDetalle,
        verDetalle,
        cerrarDetalle
    };
}

