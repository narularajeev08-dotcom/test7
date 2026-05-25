'use client';

/**
 * @fileOverview A browser-safe event emitter for Firestore permission errors.
 * Avoids Node.js 'events' dependency to prevent client-side build errors.
 */

class SimpleEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== fn);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(fn => fn(...args));
  }
}

export const errorEmitter = new SimpleEmitter();
