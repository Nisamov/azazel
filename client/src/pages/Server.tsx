import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { 
  socketStore, 
  fetchServers, 
  fetchChannels, 
  fetchMessages,
  joinChannel,
  sendMessage,
  startTyping,
  stopTyping
} from '../stores/socket';
import './Server.scss';

const Server: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = createSignal('');
  const [showMembers, setShowMembers] = createSignal(true);

  onMount(async () => {
    await fetchServers();
    if (params.serverId) {
      const channels = await fetchChannels(params.serverId);
      if (channels.length > 0 && params.channelId) {
        const channel = channels.find(c => c.id === params.channelId);
        if (channel) {
          await fetchMessages(channel.id);
          joinChannel(channel.id);
        }
      }
    }
  });

  const currentServer = () => socketStore.state.servers.find(s => s.id === params.serverId);
  const currentChannel = () => socketStore.state.channels.find(c => c.id === params.channelId);
  const messages = () => socketStore.state.messages[params.channelId] || [];

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    if (!messageInput().trim() || !params.channelId) return;

    await sendMessage(params.channelId, messageInput());
    setMessageInput('');
    stopTyping(params.channelId);
  };

  const handleInput = (e: Event) => {
    setMessageInput(e.currentTarget.value);
    if (params.channelId) {
      startTyping(params.channelId);
    }
  };

  return (
    <div class="server-page">
      {/* Channel List */}
      <aside class="channel-list">
        <div class="channel-header" onClick={() => navigate(`/servers/${params.serverId}`)}>
          <h2>{currentServer()?.name || 'Server'}</h2>
        </div>
        <div class="channels">
          <For each={socketStore.state.channels}>
            {(channel) => (
              <div 
                class={`channel-item ${params.channelId === channel.id ? 'active' : ''}`}
                onClick={() => navigate(`/servers/${params.serverId}/channels/${channel.id}`)}
              >
                <span class="channel-icon">#</span>
                <span class="channel-name">{channel.name}</span>
              </div>
            )}
          </For>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div class="chat-area">
        <header class="chat-header">
          <div class="channel-info">
            <span class="channel-icon">#</span>
            <h3>{currentChannel()?.name || 'general'}</h3>
          </div>
          <button 
            class="ghost members-toggle"
            onClick={() => setShowMembers(!showMembers())}
          >
            Members
          </button>
        </header>

        <div class="messages-container">
          <Show when={messages().length > 0} fallback={
            <div class="empty-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          }>
            <For each={messages()}>
              {(message) => (
                <div class="message">
                  <div class="message-avatar">
                    <img 
                      src={message.author?.avatar || '/icons/default-avatar.png'} 
                      alt={message.author?.username}
                    />
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-author">{message.author?.username}</span>
                      <span class="message-time">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p class="message-text">{message.content}</p>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>

        <form class="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageInput()}
            onInput={handleInput}
            placeholder={`Message #${currentChannel()?.name || 'general'}`}
          />
          <button type="submit" disabled={!messageInput().trim()}>
            Send
          </button>
        </form>
      </div>

      {/* Members Sidebar */}
      <Show when={showMembers()}>
        <aside class="members-sidebar">
          <h3>Members</h3>
          <div class="members-list">
            {/* Members would be rendered here */}
            <p class="text-muted">Loading members...</p>
          </div>
        </aside>
      </Show>
    </div>
  );
};

export default Server;