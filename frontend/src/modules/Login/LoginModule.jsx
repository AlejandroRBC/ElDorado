import { useLogin } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import './styles/login.css'; 

export default function LoginModule() {
  const { form, handleLogin, loading } = useLogin();

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