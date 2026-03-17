"use client";

import RegisterForm from '@/components/RegisterForm';
import { register } from '@/lib/api/auth';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterComponent() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseMessage = err.response?.data?.message;

        if (Array.isArray(responseMessage)) {
          setError(responseMessage.join(', '));
        } else if (typeof responseMessage === 'string') {
          setError(responseMessage);
        } else {
          setError('Registration failed');
        }
      } else {
        setError('Unexpected error while creating account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        {/* Registration Form */}
        <RegisterForm onSubmit={handleRegister} />

        {error ? (
          <div className="mt-4 rounded border border-red-900 bg-red-900/20 p-3 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="mt-3 text-center text-xs text-cyan-400">Creating account...</div>
        ) : null}
    </>
  );
}
