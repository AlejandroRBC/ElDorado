import { useLoginForm } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import './styles/login.css'; 

// ============================================
// MÓDULO DE LOGIN
// ============================================

/**
 * Página principal de login
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