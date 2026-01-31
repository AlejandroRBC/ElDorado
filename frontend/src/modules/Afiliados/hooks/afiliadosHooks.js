import { useState, useEffect } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Cargar afiliados al montar
  useEffect(() => {cargarAfiliados();},[]);

  const cargarAfiliados = async () => {
    try {
      setLoading(true);
      const response = await afiliadosService.getAfiliados();
      if (response.success) {
        setAfiliados(response.data);
        setError(null);
      } else {
        throw new Error('Error al cargar afiliados');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    afiliados,
    loading,
    error,
    afiliadoSeleccionado,
    mostrarDetalle,
    verDetalle,
    cerrarDetalle,
    recargar: cargarAfiliados
  };
}