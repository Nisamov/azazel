/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import App from './App';
import './styles/global.scss';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root
);