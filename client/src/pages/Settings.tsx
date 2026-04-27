import { Component, createSignal, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { authStore } from '../stores/auth';
import './Settings.scss';

const Settings: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal(params.tab || 'account');

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' }
  ];

  return (
    <div class="settings-page">
      <aside class="settings-sidebar">
        <h2>Settings</h2>
        <nav class="settings-nav">
          <For each={tabs}>
            {(tab) => (
              <button
                class={`settings-nav-item ${activeTab() === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/settings/${tab.id}`);
                }}
              >
                <span class="tab-icon">{tab.icon}</span>
                <span class="tab-label">{tab.label}</span>
              </button>
            )}
          </For>
        </nav>
      </aside>

      <div class="settings-content">
        {activeTab() === 'account' && (
          <div class="settings-section">
            <h1>Account Settings</h1>
            <p class="section-description">Manage your account information</p>

            <div class="settings-card">
              <div class="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={authStore.state.user?.username || ''}
                  disabled
                />
                <p class="form-hint">Username cannot be changed</p>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={authStore.state.user?.email || ''}
                  placeholder="your@email.com"
                />
              </div>

              <div class="form-group">
                <label>Bio</label>
                <textarea
                  value={authStore.state.user?.bio || ''}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <button class="primary">Save Changes</button>
            </div>

            <div class="settings-card danger-zone">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back.</p>
              <button class="danger">Delete Account</button>
            </div>
          </div>
        )}

        {activeTab() === 'appearance' && (
          <div class="settings-section">
            <h1>Appearance</h1>
            <p class="section-description">Customize how Hikarune looks</p>

            <div class="settings-card">
              <h3>Theme</h3>
              <div class="theme-options">
                <label class="theme-option">
                  <input type="radio" name="theme" value="dark" checked />
                  <div class="theme-preview dark">
                    <span>Dark</span>
                  </div>
                </label>
                <label class="theme-option">
                  <input type="radio" name="theme" value="light" />
                  <div class="theme-preview light">
                    <span>Light</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="settings-card">
              <h3>Message Display</h3>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Compact Mode</span>
                  <input type="checkbox" class="toggle" />
                </label>
              </div>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Show Timestamps</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'notifications' && (
          <div class="settings-section">
            <h1>Notification Settings</h1>
            <p class="section-description">Control how you receive notifications</p>

            <div class="settings-card">
              <h3>Desktop Notifications</h3>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Message Notifications</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Server Mentions</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Friend Requests</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
            </div>

            <div class="settings-card">
              <h3>Sound</h3>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Notification Sounds</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'privacy' && (
          <div class="settings-section">
            <h1>Privacy Settings</h1>
            <p class="section-description">Control your privacy and data</p>

            <div class="settings-card">
              <h3>Profile Visibility</h3>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Show Online Status</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
              <div class="form-group">
                <label class="toggle-label">
                  <span>Allow Friend Requests</span>
                  <input type="checkbox" class="toggle" checked />
                </label>
              </div>
            </div>

            <div class="settings-card">
              <h3>Data & Privacy</h3>
              <p>Download your data or learn how we handle your information.</p>
              <div class="button-group">
                <button class="secondary">Download Data</button>
                <button class="secondary">Privacy Policy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;