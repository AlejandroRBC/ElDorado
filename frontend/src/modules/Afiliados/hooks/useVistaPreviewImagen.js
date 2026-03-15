// frontend/src/modules/Afiliados/hooks/useVistaPreviewImagen.js

// ============================================
// HOOK USE VISTA PREVIEW IMAGEN
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Gestiona la preview de una imagen con soporte para drag & drop,
 * selección por input file, revocación de blobs y reset.
 *
 * urlInicial      - URL inicial de la imagen (puede ser null)
 * alReportarError - Callback para reportar errores de validación
 */
export const useVistaPreviewImagen = ({
  urlInicial      = null,
  alReportarError = null,
} = {}) => {
  const [preview,              setPreview]              = useState(urlInicial);
  const [archivoSeleccionado,  setArchivoSeleccionado]  = useState(null);
  const [isDragging,           setIsDragging]           = useState(false);

  // Ref de la URL base a la que revertir al eliminar la foto nueva
  const urlInicialRef = useRef(urlInicial);

  // Ref que siempre apunta al preview actual para el cleanup de desmontaje
  const previewRef = useRef(preview);
  useEffect(() => { previewRef.current = preview; }, [preview]);

  // Revocar la URL blob al desmontar
  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const fileInputRef = useRef(null);
  const dropZoneRef  = useRef(null);

  /**
   * Procesa un archivo de imagen validando su tamaño.
   * Crea una URL blob y revoca la anterior si existía.
   */
  const alSeleccionarArchivo = useCallback((file) => {
    if (file.size > MAX_BYTES) {
      alReportarError?.('La imagen es demasiado grande (máximo 5MB)');
      return;
    }
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    const nuevaUrl = URL.createObjectURL(file);
    setPreview(nuevaUrl);
    setArchivoSeleccionado(file);
  }, [alReportarError]);

  /**
   * Elimina la foto nueva y revierte a la URL inicial.
   */
  const alEliminarFoto = useCallback(() => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreview(urlInicialRef.current);
    setArchivoSeleccionado(null);
  }, []);

  /**
   * Handler para el evento onChange de un input type="file".
   */
  const alCambiarInputArchivo = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) alSeleccionarArchivo(file);
  }, [alSeleccionarArchivo]);

  /**
   * Reinicia todo el estado del hook.
   * Acepta una nueva URL inicial opcional.
   */
  const reiniciar = useCallback((nuevaUrl = null) => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    urlInicialRef.current = nuevaUrl;
    setPreview(nuevaUrl);
    setArchivoSeleccionado(null);
    setIsDragging(false);
  }, []);

  /**
   * Props listos para aplicar a la zona de drag & drop.
   */
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
    esBlobNuevo:         preview?.startsWith('blob:') ?? false,
    esUrlExterna:        Boolean(preview && !preview.startsWith('blob:')),
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