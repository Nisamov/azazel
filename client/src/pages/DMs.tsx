import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { authStore } from '../stores/auth';
import { socketStore, fetchDMs, fetchMessages, sendMessage } from '../stores/socket';
import './DMs.scss';

const DMs: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = createSignal('');

  onMount(async () => {
    await fetchDMs();
  });

  const currentDM = () => socketStore.state.dms.find(d => d.recipientId === params.userId);
  const messages = () => params.userId ? (socketStore.state.messages[params.userId] || []) : [];

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    if (!messageInput().trim() || !params.userId) return;

    await sendMessage(params.userId, messageInput());
    setMessageInput('');
  };

  return (
    <div class="dms-page">
      {/* DM List */}
      <aside class="dm-list-sidebar">
        <div class="dm-list-header">
          <h2>Direct Messages</h2>
        </div>
        <div class="dm-list-items">
          <For each={socketStore.state.dms}>
            {(dm) => (
              <div 
                class={`dm-list-item ${params.userId === dm.recipientId ? 'active' : ''}`}
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
      </aside>

      {/* Chat Area */}
      <div class="dm-chat-area">
        <Show when={params.userId} fallback={
          <div class="no-dm-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        }>
          <header class="dm-chat-header">
            <div class="dm-user-info">
              <div class="dm-avatar">
                <img 
                  src={currentDM()?.recipient?.avatar || '/icons/default-avatar.png'} 
                  alt={currentDM()?.recipient?.username}
                />
              </div>
              <h3>{currentDM()?.recipient?.username}</h3>
            </div>
          </header>

          <div class="dm-messages-container">
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
          </div>

          <form class="dm-message-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageInput()}
              onInput={(e) => setMessageInput(e.currentTarget.value)}
              placeholder={`Message ${currentDM()?.recipient?.username}`}
            />
            <button type="submit" disabled={!messageInput().trim()}>
              Send
            </button>
          </form>
        </Show>
      </div>
    </div>
  );
};

export default DMs;