import './styles/home.css';

export default function HomeModule({ onNavigate }) {
    return (
        <div className="home-module">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-text-container">
                        <h1 className="hero-title">
                            Asociación de Comerciantes
                            <span className="highlight"> El Dorado</span>
                        </h1>
                        
                        <p className="hero-subtitle">
                            Uniendo esfuerzos, construyendo futuro
                        </p>
                        
                        <div className="hero-quote">
                            <blockquote className="quote-text">
                                "Aquí viene una frase muy bonita e inspiradora que motiva a los 
                                comerciantes a seguir adelante, trabajando juntos por un mejor 
                                mañana para todos los miembros de nuestra comunidad."
                            </blockquote>
                            <div className="quote-author">
                                — Junta Directiva
                            </div>
                        </div>
                        
                        <div className="hero-actions">
                            <button 
                                className="action-btn primary-action"
                                onClick={() => onNavigate('afiliados')}
                            >
                                👥 Ver Afiliados
                                <span className="action-description">Gestiona la lista completa de afiliados</span>
                            </button>
                            
                            <button 
                                className="action-btn secondary-action"
                                onClick={() => onNavigate('patentes')}
                            >
                                📋 Ver Patentes
                                <span className="action-description">Administra las patentes registradas</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            
            <div className="features-section">
                <h2 className="features-title">Nuestros Servicios</h2>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3 className="feature-title">Gestión de Afiliados</h3>
                        <p className="feature-description">
                            Administra de manera eficiente a todos los comerciantes afiliados 
                            a nuestra asociación.
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🏪</div>
                        <h3 className="feature-title">Control de Puestos</h3>
                        <p className="feature-description">
                            Organiza y supervisa los puestos comerciales asignados a cada afiliado.
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">📋</div>
                        <h3 className="feature-title">Registro de Patentes</h3>
                        <p className="feature-description">
                            Mantén un registro actualizado de todas las patentes comerciales.
                        </p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">📅</div>
                        <h3 className="feature-title">Actividades y Eventos</h3>
                        <p className="feature-description">
                            Programa y organiza actividades para fortalecer nuestra comunidad.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">150+</div>
                        <div className="stat-label">Afiliados Activos</div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-number">25+</div>
                        <div className="stat-label">Años de Historia</div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-number">50+</div>
                        <div className="stat-label">Eventos Anuales</div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Compromiso</div>
                    </div>
                </div>
            </div>
        </div>
    );
}