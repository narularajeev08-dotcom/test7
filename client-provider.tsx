'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Singleton client-side provider with hydration synchronization.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const firebase = useMemo(() => {
    if (!mounted) return null;
    return initializeFirebase();
  }, [mounted]);

  // Prevent hydration mismatch by only rendering once client initialization is ready
  if (!mounted || !firebase) {
    return null;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      {children}
    </FirebaseProvider>
  );
}