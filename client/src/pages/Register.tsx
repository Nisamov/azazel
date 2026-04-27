import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/auth';

const Register: Component = () => {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }

    if (password().length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authStore.register(username(), email(), password());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form class="auth-form" onSubmit={handleSubmit}>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value)}
          placeholder="cooluser123"
          required
          autocomplete="username"
          minlength="3"
          maxlength="20"
        />
      </div>

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
          autocomplete="new-password"
          minlength="6"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword()}
          onInput={(e) => setConfirmPassword(e.currentTarget.value)}
          placeholder="••••••••"
          required
          autocomplete="new-password"
        />
      </div>

      {error() && <div class="form-error">{error()}</div>}

      <div class="form-submit">
        <button type="submit" disabled={loading()}>
          {loading() ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      <p class="form-switch">
        Already have an account? <a href="/login">Login</a>
      </p>
    </form>
  );
};

export default Register;