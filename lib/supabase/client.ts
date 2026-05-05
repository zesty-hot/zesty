"use client";

import { Session, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { createBrowserClient } from "@supabase/ssr";
import { User as ZestyUser } from '@/prisma/generated/client';
import { createElement, createContext, useContext, useState, useEffect } from 'react';

type Status = 'loading' | 'authenticated' | 'unauthenticated';
type UserData = ZestyUser & SupabaseUser;

interface SupabaseContextType {
  session: Session | null;
  status: Status;
  user: UserData | null;
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const anonSupabase = supabase;

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Single getSession call for entire app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');

      if (session) {
        supabase
          .from('zesty_user')
          .select('*')
          .eq('supabaseId', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser({ ...data as ZestyUser, ...session.user });
          });
      }
    });

    // Single auth state listener for entire app
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[SUPBASE_PROVIDER] Auth state changed:', _event, session);
      if (_event === 'INITIAL_SESSION') {
        return;
      }
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
        return;
      }

      setSession(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');

      if (session) {
        supabase
          .from('zesty_user')
          .select('*')
          .eq('supabaseId', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser({ ...data as ZestyUser, ...session.user });
          });
      } else {
        setUser(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  return createElement(
    SupabaseContext.Provider,
    { value: { session, status, user, supabase } },
    children
  );
}

export function useSupabaseSession() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseSession must be used within SupabaseProvider');
  }
  return {
    data: context.session,
    status: context.status,
    user: context.user,
    supabase: context.supabase
  };
}