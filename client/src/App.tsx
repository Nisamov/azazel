import { Component, createSignal, onMount, Show } from 'solid-js';
import { Routes, Route, Navigate } from '@solidjs/router';
import { authStore, initAuth } from './stores/auth';
import { socketStore, initSocket } from './stores/socket';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Server from './pages/Server';
import DMs from './pages/DMs';
import Settings from './pages/Settings';
import Explore from './pages/Explore';

const App: Component = () => {
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    await initAuth();
    initSocket();
    setLoading(false);
  });

  return (
    <Show when={!loading()} fallback={
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading Hikarune...</p>
      </div>
    }>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" component={AuthLayout} >
          <Route path="/" component={Login} />
        </Route>
        <Route path="/register" component={AuthLayout} >
          <Route path="/" component={Register} />
        </Route>

        {/* Main App Routes */}
        <Route path="/" component={MainLayout}>
          <Route path="/" component={Home} />
          <Route path="/servers/:serverId" component={Server} />
          <Route path="/servers/:serverId/channels/:channelId" component={Server} />
          <Route path="/dms" component={DMs} />
          <Route path="/dms/:userId" component={DMs} />
          <Route path="/explore" component={Explore} />
          <Route path="/settings" component={Settings} />
          <Route path="/settings/:tab" component={Settings} />
        </Route>

        {/* Fallback */}
        <Route path="*" component={() => <Navigate href="/" />} />
      </Routes>
    </Show>
  );
};

export default App;