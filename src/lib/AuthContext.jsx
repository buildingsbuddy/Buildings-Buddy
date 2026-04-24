import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingTeamInvites, setPendingTeamInvites] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const loadProfile = async (userId) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load profile:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Unexpected profile load error:', error);
      return null;
    }
  };

  const loadPendingTeamInvites = async (email) => {
    if (!email) {
      setPendingTeamInvites([]);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          id,
          team_id,
          invited_email,
          role,
          status,
          created_at,
          teams (
            id,
            name,
            owner_id,
            plan,
            max_users
          )
        `)
        .eq('status', 'pending')
        .ilike('invited_email', email);

      if (error) {
        console.error('Failed to load pending team invites:', error);
        setPendingTeamInvites([]);
        return [];
      }

      setPendingTeamInvites(data || []);
      return data || [];
    } catch (error) {
      console.error('Unexpected pending invite load error:', error);
      setPendingTeamInvites([]);
      return [];
    }
  };

  const loadUserExtras = async (sessionUser) => {
    if (!sessionUser) return;

    try {
      const [profileData] = await Promise.all([
        loadProfile(sessionUser.id),
        loadPendingTeamInvites(sessionUser.email),
      ]);

      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load user extras:', error);
      setProfile(null);
      setPendingTeamInvites([]);
    }
  };

  const applySessionUser = (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setPendingTeamInvites([]);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }

    setUser(sessionUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setIsLoadingAuth(false);

    loadUserExtras(sessionUser);
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      applySessionUser(session?.user || null);
      return session?.user || null;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setProfile(null);
      setPendingTeamInvites([]);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      setAuthError({
        type: 'auth_error',
        message: error.message || 'Auth failed',
      });
      return null;
    }
  };

  const checkAppState = async () => {
    await checkUserAuth();
    return true;
  };

  const refreshPendingTeamInvites = async () => {
    if (!user?.email) {
      setPendingTeamInvites([]);
      return [];
    }

    return loadPendingTeamInvites(user.email);
  };

  useEffect(() => {
    let mounted = true;

    checkUserAuth();

    const timeout = setTimeout(() => {
      if (mounted) {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      applySessionUser(session?.user || null);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPendingTeamInvites([]);
    setIsAuthenticated(false);
    setAuthChecked(true);
    setIsLoadingAuth(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        pendingTeamInvites,
        setUser,
        setProfile,
        setPendingTeamInvites,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        setIsLoadingAuth,
        isLoadingPublicSettings,
        setIsLoadingPublicSettings,
        authError,
        setAuthError,
        authChecked,
        setAuthChecked,
        appPublicSettings,
        setAppPublicSettings,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
        refreshPendingTeamInvites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};