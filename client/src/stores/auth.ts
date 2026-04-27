import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'offline' | 'away' | 'dnd';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const [authState, setAuthState] = createStore<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
});

const API_URL = '/api';

export const authStore = {
  get state() {
    return authState;
  },

  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(username: string, email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  },

  async updateProfile(updates: Partial<User>) {
    if (!authState.token) return;

    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`
      },
      body: JSON.stringify(updates)
    });

    if (res.ok) {
      const data = await res.json();
      setAuthState('user', data.user);
    }
  }
};

export async function initAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    setAuthState('loading', false);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      setAuthState({
        user: data.user,
        token,
        isAuthenticated: true,
        loading: false
      });
    } else {
      localStorage.removeItem('token');
      setAuthState('loading', false);
    }
  } catch (error) {
    console.error('Auth init error:', error);
    setAuthState('loading', false);
  }
}