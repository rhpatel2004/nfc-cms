'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/custom/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });
  const router = useRouter();

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: 'Logging in...', color: 'text-slate-500' });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, color: 'text-green-600' });
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setMessage({ text: data.message, color: 'text-red-600' });
      }
    } catch (error) {
      setMessage({ text: 'Login failed. Please try again.', color: 'text-red-600' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Log In">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" onChange={handleChange} required disabled={loading} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" onChange={handleChange} required disabled={loading} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
      {message.text && (
        <p className={`text-center mt-4 text-sm ${message.color}`}>
          {message.text}
        </p>
      )}
      <div className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-slate-900 dark:text-slate-100 hover:underline">
          Register
        </Link>
      </div>
    </AuthLayout>
  );
}