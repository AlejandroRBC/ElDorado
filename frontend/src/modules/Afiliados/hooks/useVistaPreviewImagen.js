
import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const useVistaPreviewImagen = ({
  urlInicial     = null,
  alReportarError = null,
} = {}) => {

  const [preview,             setPreview]             = useState(urlInicial);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [isDragging,          setIsDragging]          = useState(false);

  // Guardamos la URL "base" a la que revertir al eliminar la foto nueva.
  // Se usa una ref para poder mutar sin forzar re-renders.
  const urlInicialRef = useRef(urlInicial);

  // Ref que siempre apunta al preview actual — necesario para el
  // cleanup de desmontaje sin capturar el valor del primer render.
  const previewRef = useRef(preview);
  useEffect(() => { previewRef.current = preview; }, [preview]);

  // Revocar la URL blob al desmontar el componente que usa el hook.
  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []); // solo al desmontar

  const fileInputRef = useRef(null);
  const dropZoneRef  = useRef(null);

  // ── Procesar un archivo elegido ────────────────────────────
  const alSeleccionarArchivo = useCallback((file) => {
    if (file.size > MAX_BYTES) {
      alReportarError?.('La imagen es demasiado grande (máximo 5MB)');
      return;
    }

    // Revocar el blob anterior antes de crear uno nuevo
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }

    const nuevaUrl = URL.createObjectURL(file);
    setPreview(nuevaUrl);
    setArchivoSeleccionado(file);
  }, [alReportarError]);

  // ── Eliminar la foto nueva y revertir a la URL inicial ─────
  const alEliminarFoto = useCallback(() => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreview(urlInicialRef.current);
    setArchivoSeleccionado(null);
  }, []);

  // ── Handler directo para <input type="file" onChange> ──────
  const alCambiarInputArchivo = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) alSeleccionarArchivo(file);
  }, [alSeleccionarArchivo]);

  // ── Reiniciar todo el estado (útil en resetForm) ───────────
  // nuevaUrl: la nueva URL inicial tras el reset (null por defecto)
  const reiniciar = useCallback((nuevaUrl = null) => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    urlInicialRef.current = nuevaUrl;
    setPreview(nuevaUrl);
    setArchivoSeleccionado(null);
    setIsDragging(false);
  }, []);

  // ── Props para la zona de drag & drop ─────────────────────
  const propsDragDrop = {
    ref:         dropZoneRef,
    onClick:     () => fileInputRef.current?.click(),
    onDragOver:  (e) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: (e) => { e.preventDefault(); setIsDragging(false); },
    onDrop:      (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) alSeleccionarArchivo(file);
    },
  };

  return {
    preview,
    esBlobNuevo:          preview?.startsWith('blob:') ?? false,
    esUrlExterna:         Boolean(preview && !preview.startsWith('blob:')),
    archivoSeleccionado,
    isDragging,
    fileInputRef,
    alSeleccionarArchivo,
    alEliminarFoto,
    alCambiarInputArchivo,
    reiniciar,
    propsDragDrop,
  };
};