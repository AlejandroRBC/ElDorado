export function FormularioAfiliado({ 
    formData, 
    onChange, 
    onImageChange,
    onRemoveImage,
    onSubmit, 
    loading, 
    error,
    onCancel
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
    };
    
    // Determinar si mostrar preview personalizado o placeholder
    const mostrarPreviewPersonalizado = formData.url_perfil && 
        formData.url_perfil.startsWith('data:image') && 
        !formData.url_perfil.includes('sinPerfil.png');


    return (
        <form onSubmit={handleSubmit}>
        <div className="modal-body">
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
                    {error}
                </div>
            )}

            {/* Sección de foto de perfil */}
            <div className="info-section">
                <h3>Foto de Perfil</h3>
                <div className="perfil-foto-container">
                    <div className="foto-preview">
                        {mostrarPreviewPersonalizado ? (
                            <>
                                <img 
                                    src={formData.url_perfil} 
                                    alt="Vista previa" 
                                    className="foto-preview-img"
                                />
                                <button 
                                    type="button"
                                    className="remove-foto-btn"
                                    onClick={onRemoveImage}
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <div className="foto-placeholder">
                                <div className="placeholder-icon">👤</div>
                                <span className="placeholder-text">Sin foto seleccionada</span>
                                <span className="placeholder-default">(Usará sinPerfil.png)</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="foto-upload">
                        <label className="upload-btn">
                            <span>📷 Seleccionar Foto</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="file-input"
                                disabled={loading}
                            />
                        </label>
                        <div className="upload-info">
                            <p className="upload-note">
                                Formatos: JPG, PNG, GIF (max. 5MB)
                            </p>
                            <p className="upload-note">
                                Si no seleccionas foto, se usará la imagen por defecto
                            </p>
                        </div>
                    </div>
                </div>
            </div>

                <div className="info-section">
                    <h3>Datos Personales</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label className="label">Cédula de Identidad</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="ci"
                                    value={formData.ci}
                                    onChange={onChange}
                                    placeholder="Ej: 1234567"
                                    style={{ flex: 3 }}
                                    required
                                />
                                <select
                                    name="extension"
                                    value={formData.extension}
                                    onChange={onChange}
                                    style={{ flex: 1 }}
                                >
                                    <option value="LP">LP</option>
                                    <option value="SC">SC</option>
                                    <option value="CB">CB</option>
                                    <option value="CH">CH</option>
                                    <option value="PT">PT</option>
                                    <option value="TJ">TJ</option>
                                    <option value="OR">OR</option>
                                    <option value="BE">BE</option>
                                    <option value="PD">PD</option>
                                </select>
                            </div>
                        </div>

                        <div className="info-item">
                            <label className="label">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={onChange}
                                placeholder="Ej: Juan"
                                required
                            />
                        </div>

                        <div className="info-item">
                            <label className="label">Apellido Paterno</label>
                            <input
                                type="text"
                                name="paterno"
                                value={formData.paterno}
                                onChange={onChange}
                                placeholder="Ej: Pérez"
                                required
                            />
                        </div>

                        <div className="info-item">
                            <label className="label">Apellido Materno</label>
                            <input
                                type="text"
                                name="materno"
                                value={formData.materno}
                                onChange={onChange}
                                placeholder="Ej: Gómez"
                            />
                        </div>

                        <div className="info-item">
                            <label className="label">Sexo</label>
                            <select
                                name="sexo"
                                value={formData.sexo}
                                onChange={onChange}
                            >
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div className="info-item">
                            <label className="label">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="fecNac"
                                value={formData.fecNac}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Información de Contacto</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label className="label">Teléfono</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={onChange}
                                placeholder="Ej: 70123456"
                            />
                        </div>

                        <div className="info-item">
                            <label className="label">Ocupación</label>
                            <input
                                type="text"
                                name="ocupacion"
                                value={formData.ocupacion}
                                onChange={onChange}
                                placeholder="Ej: Comerciante"
                            />
                        </div>

                        <div className="info-item">
                            <label className="label">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={onChange}
                                placeholder="Ej: Calle Principal #123"
                            />
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Información de Afiliación</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label className="label">
                                <input
                                    type="checkbox"
                                    name="estado"
                                    checked={formData.estado}
                                    onChange={onChange}
                                />
                                <span style={{ marginLeft: '8px' }}>Activo</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button 
                    type="button" 
                    className="secondary-btn" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="detalle-btn"
                    disabled={loading}
                    style={{ marginLeft: '10px' }}
                >
                    {loading ? 'Guardando...' : 'Guardar Afiliado'}
                </button>
            </div>
        </form>
    );
}