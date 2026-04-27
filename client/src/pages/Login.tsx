import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/auth';

const Login: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authStore.login(email(), password());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form class="auth-form" onSubmit={handleSubmit}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          placeholder="you@example.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      {error() && <div class="form-error">{error()}</div>}

      <div class="form-submit">
        <button type="submit" disabled={loading()}>
          {loading() ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <p class="form-switch">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </form>
  );
};

export default Login;