import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function getFriendlyAuthError(error, mode) {
  const message = String(error?.message || '').toLowerCase();

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    message.includes('email not confirmed')
  ) {
    return 'Incorrect email or password. Please check your details and try again.';
  }

  if (message.includes('signup disabled')) {
    return 'Sign up is currently disabled. Please contact support.';
  }

  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'An account already exists with this email. Please log in instead.';
  }

  if (message.includes('password')) {
    return mode === 'signup'
      ? 'Please use a stronger password. It should be at least 6 characters.'
      : 'Incorrect email or password. Please check your details and try again.';
  }

  return mode === 'signup'
    ? 'Could not create your account. Please check your details and try again.'
    : 'Could not log in. Please check your email and password and try again.';
}

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage('');
    setMessageType('info');

    try {
      const cleanEmail = email.trim().toLowerCase();

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
          setMessageType('info');
          setMessage(
            'Account created. Please check your email and confirm your account before logging in.'
          );
        } else {
          navigate('/dashboard');
        }

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        navigate('/dashboard');
      } else {
        setMessageType('error');
        setMessage('Could not log in. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessageType('error');
      setMessage(getFriendlyAuthError(error, mode));
    } finally {
      setProcessing(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'signup' ? 'login' : 'signup'));
    setMessage('');
    setMessageType('info');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20 relative">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {mode === 'signup' ? 'Create account' : 'Login'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'signup'
              ? 'Create your Buildings Buddy account.'
              : 'Log in to continue to Buildings Buddy.'}
          </p>
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
            <div
              className={`rounded-lg border p-3 text-sm flex gap-2 ${
                messageType === 'error'
                  ? 'border-destructive/20 bg-destructive/10 text-destructive'
                  : 'border-accent/20 bg-accent/10 text-foreground'
              }`}
            >
              {messageType === 'error' && (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          )}

          <button type="button" className="text-sm underline" onClick={switchMode}>
            {mode === 'signup'
              ? 'Already have an account? Login'
              : 'Need an account? Sign up'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}