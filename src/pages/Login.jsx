import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage('');

    try {
      const cleanEmail = email.trim();

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data?.user && !data?.session) {
          setMessage('Account created. Check your email and confirm your account before logging in.');
        } else {
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        if (data?.session) {
          navigate('/dashboard');
        } else {
          setMessage('Login succeeded but no session was returned.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {mode === 'signup' ? 'Create account' : 'Login'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <Input
                id="full-name"
                name="fullName"
                type="text"
                placeholder="Full name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={processing}>
              {processing
                ? 'Please wait...'
                : mode === 'signup'
                ? 'Create account'
                : 'Login'}
            </Button>
          </form>

          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}

          <button
            type="button"
            className="text-sm underline"
            onClick={() => setMode((prev) => (prev === 'signup' ? 'login' : 'signup'))}
          >
            {mode === 'signup'
              ? 'Already have an account? Login'
              : 'Need an account? Sign up'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}