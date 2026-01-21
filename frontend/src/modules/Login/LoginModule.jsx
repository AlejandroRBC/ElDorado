import { useLogin } from './loginHooks';
import { LoginForm } from './components/LoginForm';

export default function LoginModule() {
  // Extraemos la lógica del hook
  const { form, handleLogin, loading } = useLogin();

  // Se lo pasamos a la UI
  return (
    <LoginForm 
      form={form} 
      onSubmit={handleLogin} 
      loading={loading} 
    />
  );
}