'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * STRATEGIC HARDENED SINGLETON (v193.0)
 * --------------------------------------------------
 * Definitive resolution for Firestore "Unexpected state (ID: ca9)".
 * Implements a dual-layer initialization gate:
 * 1. Module-level singleton (localServices)
 * 2. Immutable Global Vault (globalThis identity lock)
 */

interface FirebaseServices {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Layer 1: Module-level cache
let localServices: FirebaseServices | null = null;

// Layer 2: Global Vault Key
const VAULT_KEY = Symbol.for('__SMD_STRATEGIC_VAULT_V193_0__');

export function initializeFirebase(): FirebaseServices {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    return { app: {} as any, firestore: {} as any, auth: {} as any };
  }

  const g = globalThis as any;

  // 1. ATOMIC MODULE CHECK
  if (localServices) {
    return localServices;
  }

  // 2. ATOMIC GLOBAL VAULT CHECK
  if (g[VAULT_KEY]) {
    localServices = g[VAULT_KEY];
    return localServices!;
  }

  // 3. IDEMPOTENT APP INITIALIZATION
  // Ensure we don't try to initialize the same app name twice
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 4. ATOMIC SERVICE ACQUISITION
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  localServices = { 
    app, 
    firestore, 
    auth 
  };

  // 5. IMMUTABLE VAULT LOCK
  // Protect the singleton from re-initialization during hydration or HMR
  try {
    Object.defineProperty(g, VAULT_KEY, {
      value: localServices,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch (e) {
    // Fallback for environments where property definition is restricted
    g[VAULT_KEY] = localServices;
  }

  return localServices;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
