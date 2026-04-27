import { io, Socket } from 'socket.io-client';
import { createStore } from 'solid-js/store';
import { authStore } from './auth';

export interface Server {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  editedAt?: string;
}

export interface DM {
  id: string;
  recipientId: string;
  recipient?: {
    id: string;
    username: string;
    avatar?: string;
    status: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  channels: Channel[];
  messages: Record<string, Message[]>;
  dms: DM[];
  currentDM: DM | null;
  typing: Record<string, boolean>;
}

const [socketState, setSocketState] = createStore<SocketState>({
  socket: null,
  connected: false,
  servers: [],
  currentServer: null,
  currentChannel: null,
  channels: [],
  messages: {},
  dms: [],
  currentDM: null,
  typing: {}
});

let socket: Socket | null = null;

export const socketStore = {
  get state() {
    return socketState;
  },

  get isConnected() {
    return socketState.connected;
  }
};

export function initSocket() {
  if (socket) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    setSocketState('connected', true);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    setSocketState('connected', false);
  });

  socket.on('new_message', (message: Message) => {
    const channelMessages = socketState.messages[message.channelId] || [];
    setSocketState('messages', message.channelId, [...channelMessages, message]);
  });

  socket.on('message_updated', (message: Message) => {
    const channelMessages = socketState.messages[message.channelId] || [];
    const index = channelMessages.findIndex(m => m.id === message.id);
    if (index !== -1) {
      setSocketState('messages', message.channelId, index, message);
    }
  });

  socket.on('message_deleted', (data: { messageId: string; channelId: string }) => {
    const channelMessages = socketState.messages[data.channelId] || [];
    setSocketState('messages', data.channelId, 
      channelMessages.filter(m => m.id !== data.messageId));
  });

  socket.on('typing', (data: { userId: string; channelId: string; isTyping: boolean }) => {
    setSocketState('typing', data.channelId, data.userId, data.isTyping);
  });

  socket.on('presence_update', (data: { userId: string; status: string }) => {
    // Update user presence in stores
    console.log('Presence update:', data);
  });

  socket.on('server_updated', (server: Server) => {
    const index = socketState.servers.findIndex(s => s.id === server.id);
    if (index !== -1) {
      setSocketState('servers', index, server);
    }
    if (socketState.currentServer?.id === server.id) {
      setSocketState('currentServer', server);
    }
  });

  socket.on('user_online', (data: { userId: string }) => {
    // Handle user coming online
  });

  socket.on('user_offline', (data: { userId: string }) => {
    // Handle user going offline
  });

  setSocketState('socket', socket);
}

export function joinChannel(channelId: string) {
  socket?.emit('join_channel', { channelId });
}

export function leaveChannel(channelId: string) {
  socket?.emit('leave_channel', { channelId });
}

export function sendMessage(channelId: string, content: string) {
  socket?.emit('send_message', { channelId, content });
}

export function editMessage(messageId: string, content: string) {
  socket?.emit('edit_message', { messageId, content });
}

export function deleteMessage(messageId: string) {
  socket?.emit('delete_message', { messageId });
}

export function startTyping(channelId: string) {
  socket?.emit('typing_start', { channelId });
}

export function stopTyping(channelId: string) {
  socket?.emit('typing_stop', { channelId });
}

export function updatePresence(status: string) {
  socket?.emit('update_presence', { status });
}

// API functions that use socket
export async function fetchServers() {
  const res = await fetch('/api/servers', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (res.ok) {
    const servers = await res.json();
    setSocketState('servers', servers);
    return servers;
  }
  return [];
}

export async function fetchChannels(serverId: string) {
  const res = await fetch(`/api/servers/${serverId}/channels`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (res.ok) {
    const channels = await res.json();
    setSocketState('channels', channels);
    return channels;
  }
  return [];
}

export async function fetchMessages(channelId: string) {
  const res = await fetch(`/api/channels/${channelId}/messages`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (res.ok) {
    const messages = await res.json();
    setSocketState('messages', channelId, messages);
    return messages;
  }
  return [];
}

export async function fetchDMs() {
  const res = await fetch('/api/users/dms', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (res.ok) {
    const dms = await res.json();
    setSocketState('dms', dms);
    return dms;
  }
  return [];
}