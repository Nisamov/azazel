import { Component, JSX } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { authStore } from '../../stores/auth';
import './MainLayout.scss';

interface MainLayoutProps {
  children?: JSX.Element;
}

const MainLayout: Component<MainLayoutProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await authStore.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div class="main-layout">
      {/* Sidebar */}
      <aside class="sidebar">
        <div class="sidebar-top">
          <button 
            class={`sidebar-btn ${isActive('/') && !isActive('/dms') && !isActive('/servers') ? 'active' : ''}`}
            onClick={() => navigate('/')}
            title="Home"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-divider"></div>

        <div class="sidebar-servers">
          <button 
            class={`sidebar-btn ${isActive('/dms') ? 'active' : ''}`}
            onClick={() => navigate('/dms')}
            title="Direct Messages"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </button>
          <button 
            class="sidebar-btn"
            onClick={() => navigate('/explore')}
            title="Explore Servers"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zm0 3.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-bottom">
          <button 
            class="sidebar-btn settings-btn"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
          <div class="user-avatar" onClick={handleLogout} title="Logout">
            <img 
              src={authStore.state.user?.avatar || '/icons/default-avatar.png'} 
              alt="User avatar"
            />
          </div>
        </div>
      </aside>

      {/* Server List */}
      <aside class="server-list">
        <div class="server-list-header">
          <h1>Hikarune</h1>
        </div>
        <div class="servers">
          {/* Server icons would be rendered here */}
        </div>
      </aside>

      {/* Main Content */}
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

export default MainLayout;