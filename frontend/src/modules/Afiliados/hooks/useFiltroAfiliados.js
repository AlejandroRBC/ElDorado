import { useState, useMemo } from 'react';

export function useFiltroAfiliados(afiliados) {
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [campoFiltro, setCampoFiltro] = useState('todos'); // 'todos', 'ci', 'nombre', 'apellido'

    // Filtrar afiliados según el término de búsqueda
    const afiliadosFiltrados = useMemo(() => {
        if (!terminoBusqueda.trim()) {
            return afiliados;
        }

        const termino = terminoBusqueda.toLowerCase().trim();
        
        return afiliados.filter(afiliado => {
            // Si no hay término, mostrar todos
            if (!termino) return true;

            // Filtrar por el campo seleccionado
            switch (campoFiltro) {
                case 'ci':
                    return (
                        afiliado.ci?.toLowerCase().includes(termino) ||
                        afiliado.extension?.toLowerCase().includes(termino)
                    );
                
                case 'nombre':
                    return afiliado.nombre?.toLowerCase().includes(termino);
                
                case 'apellido':
                    return (
                        afiliado.paterno?.toLowerCase().includes(termino) ||
                        afiliado.materno?.toLowerCase().includes(termino)
                    );
                
                case 'todos':
                default:
                    return (
                        afiliado.ci?.toLowerCase().includes(termino) ||
                        afiliado.extension?.toLowerCase().includes(termino) ||
                        afiliado.nombre?.toLowerCase().includes(termino) ||
                        afiliado.paterno?.toLowerCase().includes(termino) ||
                        afiliado.materno?.toLowerCase().includes(termino) ||
                        `${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`
                            .toLowerCase()
                            .includes(termino)
                    );
            }
        });
    }, [afiliados, terminoBusqueda, campoFiltro]);

    // Limpiar búsqueda
    const limpiarBusqueda = () => {
        setTerminoBusqueda('');
    };

    // Contador de resultados
    const totalResultados = afiliadosFiltrados.length;
    const totalAfiliados = afiliados.length;

    return {
        terminoBusqueda,
        setTerminoBusqueda,
        campoFiltro,
        setCampoFiltro,
        afiliadosFiltrados,
        limpiarBusqueda,
        totalResultados,
        totalAfiliados
    };
}