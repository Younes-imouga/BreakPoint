'use client';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginComponent() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean,
  ) => {
    void remember;
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseMessage = err.response?.data?.message;

        if (Array.isArray(responseMessage)) {
          setError(responseMessage.join(', '));
        } else if (typeof responseMessage === 'string') {
          setError(responseMessage);
        } else {
          setError('Login failed');
        }
      } else {
        setError('Unexpected error while logging in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} />

        {error ? (
          <div className="mt-4 rounded border border-red-900 bg-red-900/20 p-3 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="mt-3 text-center text-xs text-cyan-400">Authenticating...</div>
        ) : null}
    </>
  );
}
