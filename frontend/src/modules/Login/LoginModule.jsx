import { useLoginForm } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import './styles/login.css';

// ============================================
// MÓDULO DE LOGIN
// ============================================

/**
 * Página de autenticación del sistema.
 * Conecta el hook de lógica con el componente visual del formulario.
 */
export default function LoginModule() {
  const { form, handleLogin, loading } = useLoginForm();

  return (
    <div className="login-container">
      <LoginForm
        form={form}
        onSubmit={handleLogin}
        loading={loading}
      />
    </div>
  );
}