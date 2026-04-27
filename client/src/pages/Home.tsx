import { Component, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/auth';
import { socketStore, fetchServers } from '../stores/socket';
import './Home.scss';

const Home: Component = () => {
  const navigate = useNavigate();

  onMount(async () => {
    await fetchServers();
  });

  return (
    <div class="home-page">
      <div class="home-header">
        <h1>Welcome back, {authStore.state.user?.username}!</h1>
        <p>You have great conversations waiting for you.</p>
      </div>

      <div class="home-content">
        <section class="home-section">
          <h2>Your Servers</h2>
          <Show 
            when={socketStore.state.servers.length > 0}
            fallback={
              <div class="empty-state">
                <p>You haven't joined any servers yet.</p>
                <button class="secondary" onClick={() => navigate('/explore')}>
                  Explore Servers
                </button>
              </div>
            }
          >
            <div class="server-grid">
              <For each={socketStore.state.servers}>
                {(server) => (
                  <div 
                    class="server-card"
                    onClick={() => navigate(`/servers/${server.id}`)}
                  >
                    <div class="server-icon">
                      {server.icon ? (
                        <img src={server.icon} alt={server.name} />
                      ) : (
                        server.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3>{server.name}</h3>
                  </div>
                )}
              </For>
              <button class="server-card add-server" onClick={() => navigate('/explore')}>
                <div class="server-icon">+</div>
                <h3>Join Server</h3>
              </button>
            </div>
          </Show>
        </section>

        <section class="home-section">
          <h2>Direct Messages</h2>
          <Show 
            when={socketStore.state.dms.length > 0}
            fallback={
              <div class="empty-state">
                <p>No direct messages yet.</p>
                <button class="secondary" onClick={() => navigate('/dms')}>
                  Start a DM
                </button>
              </div>
            }
          >
            <div class="dm-list">
              <For each={socketStore.state.dms}>
                {(dm) => (
                  <div 
                    class="dm-item"
                    onClick={() => navigate(`/dms/${dm.recipientId}`)}
                  >
                    <div class="dm-avatar">
                      <img 
                        src={dm.recipient?.avatar || '/icons/default-avatar.png'} 
                        alt={dm.recipient?.username}
                      />
                      <span class={`status-dot ${dm.recipient?.status}`}></span>
                    </div>
                    <div class="dm-info">
                      <h4>{dm.recipient?.username}</h4>
                      <p>{dm.lastMessage?.content || 'No messages yet'}</p>
                    </div>
                    <Show when={dm.unreadCount > 0}>
                      <span class="unread-badge">{dm.unreadCount}</span>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </div>
  );
};

export default Home;