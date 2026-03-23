import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// ─────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Centraliza el estado de UI del módulo Afiliados:
 *  - modal activo (tipo, mode, data)
 *  - vista activa (cards / tabla)
 *  - toggle de deshabilitados
 *  - preview de imagen de perfil (drag & drop)
 */
export const useAfiliadoUI = () => {

  // ── Modal ──────────────────────────────────────────────────
  // modal.tipo: 'afiliado' | 'puesto' | 'confirm' | null
  // modal.mode: sub-modo según el tipo (p.ej. 'crear', 'desafiliar', 'historial')
  // modal.data: payload que necesita el modal (afiliado, puesto, etc.)
  const [modal, setModal] = useState({ tipo: null, mode: null, data: null });

  const abrirModal = useCallback((tipo, mode, data = null) => {
    setModal({ tipo, mode, data });
  }, []);

  const cerrarModal = useCallback(() => {
    setModal({ tipo: null, mode: null, data: null });
  }, []);

  // Helpers semánticos para el sitio de uso
  const abrirModalCrearAfiliado  = useCallback(() => abrirModal('afiliado', 'crear'),                        [abrirModal]);
  const abrirModalHistorial      = useCallback((data) => abrirModal('afiliado', 'historial', data),          [abrirModal]);
  const abrirModalDesafiliar     = useCallback((data) => abrirModal('afiliado', 'desafiliar', data),         [abrirModal]);
  const abrirModalAsignarPuesto  = useCallback((data) => abrirModal('puesto',   'asignar',   data),          [abrirModal]);
  const abrirModalAccionPuesto   = useCallback((data) => abrirModal('puesto',   'accion',    data),          [abrirModal]);
  const abrirModalTraspaso       = useCallback((data) => abrirModal('puesto',   'traspaso',  data),          [abrirModal]);
  const abrirModalConfirm        = useCallback((data) => abrirModal('confirm',  'default',   data),          [abrirModal]);

  // ── Vista activa ───────────────────────────────────────────
  const [vistaTabla, setVistaTabla] = useState(false);
  const toggleVista = useCallback(() => setVistaTabla((v) => !v), []);

  // ── Toggle deshabilitados ──────────────────────────────────
  const [mostrarDeshabilitados, setMostrarDeshabilitados] = useState(false);
  const toggleDeshabilitados = useCallback((checked) => {
    setMostrarDeshabilitados(checked);
  }, []);

  // ── Preview de imagen (absorbe useVistaPreviewImagen) ──────
  const [preview,             setPreview]             = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [isDragging,          setIsDragging]          = useState(false);

  const urlInicialRef = useRef(null);
  const previewRef    = useRef(null);
  const fileInputRef  = useRef(null);

  useEffect(() => { previewRef.current = preview; }, [preview]);

  // Revocar blob al desmontar
  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const alSeleccionarArchivo = useCallback((file, onError) => {
    if (file.size > MAX_BYTES) {
      onError?.('La imagen es demasiado grande (máximo 5MB)');
      return;
    }
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreview(URL.createObjectURL(file));
    setArchivoSeleccionado(file);
  }, []);

  const alEliminarFoto = useCallback(() => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreview(urlInicialRef.current);
    setArchivoSeleccionado(null);
  }, []);

  const alCambiarInputArchivo = useCallback((e, onError) => {
    const file = e.target.files?.[0];
    if (file) alSeleccionarArchivo(file, onError);
  }, [alSeleccionarArchivo]);

  const reiniciarPreview = useCallback((nuevaUrl = null) => {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current);
    }
    urlInicialRef.current = nuevaUrl;
    setPreview(nuevaUrl);
    setArchivoSeleccionado(null);
    setIsDragging(false);
  }, []);

  const propsDragDrop = {
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
    // ── Modal ──────────────────────────────────────────────────
    modal,
    abrirModal,
    cerrarModal,
    abrirModalCrearAfiliado,
    abrirModalHistorial,
    abrirModalDesafiliar,
    abrirModalAsignarPuesto,
    abrirModalAccionPuesto,
    abrirModalTraspaso,
    abrirModalConfirm,

    // ── Vista ──────────────────────────────────────────────────
    vistaTabla,
    setVistaTabla,
    toggleVista,

    // ── Deshabilitados ─────────────────────────────────────────
    mostrarDeshabilitados,
    toggleDeshabilitados,

    // ── Preview imagen ─────────────────────────────────────────
    preview,
    archivoSeleccionado,
    isDragging,
    fileInputRef,
    alSeleccionarArchivo,
    alEliminarFoto,
    alCambiarInputArchivo,
    reiniciarPreview,
    propsDragDrop,
  };
};