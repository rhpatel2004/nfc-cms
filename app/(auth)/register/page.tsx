'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/custom/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: 'Registering...', color: 'text-slate-500' });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, color: 'text-green-600' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage({ text: data.message, color: 'text-red-600' });
      }
    } catch{
      setMessage({ text: 'Registration failed. Please try again.', color: 'text-red-600' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" onChange={handleChange} required disabled={loading} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" onChange={handleChange} required disabled={loading} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" onChange={handleChange} required disabled={loading} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      {message.text && (
        <p className={`text-center mt-4 text-sm ${message.color}`}>
          {message.text}
        </p>
      )}
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate-900 dark:text-slate-100 hover:underline">
          Log In
        </Link>
      </div>
    </AuthLayout>
  );
}