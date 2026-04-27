import { Component, createSignal, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import './Explore.scss';

interface ServerCategory {
  id: string;
  name: string;
  icon: string;
}

interface ExploreServer {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon?: string;
  category: string;
}

const Explore: Component = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal('all');

  const categories: ServerCategory[] = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'social', name: 'Social', icon: '💬' },
    { id: 'education', name: 'Education', icon: '📚' }
  ];

  // Mock data - in production this would come from API
  const servers: ExploreServer[] = [
    {
      id: '1',
      name: 'Gaming Hub',
      description: 'The ultimate gaming community for all gamers',
      memberCount: 12500,
      category: 'gaming'
    },
    {
      id: '2',
      name: 'Music Lovers',
      description: 'Share and discover new music with fellow enthusiasts',
      memberCount: 8200,
      category: 'music'
    },
    {
      id: '3',
      name: 'Digital Artists',
      description: 'A community for digital artists to share and collaborate',
      memberCount: 5600,
      category: 'art'
    },
    {
      id: '4',
      name: 'Tech Talk',
      description: 'Discuss the latest in technology and programming',
      memberCount: 15000,
      category: 'tech'
    },
    {
      id: '5',
      name: 'Language Exchange',
      description: 'Practice languages with people from around the world',
      memberCount: 9800,
      category: 'education'
    }
  ];

  const filteredServers = () => {
    let result = servers;
    
    if (selectedCategory() !== 'all') {
      result = result.filter(s => s.category === selectedCategory());
    }
    
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  };

  return (
    <div class="explore-page">
      <div class="explore-header">
        <h1>Explore Servers</h1>
        <p>Discover communities and make new friends</p>
      </div>

      <div class="explore-search">
        <input
          type="text"
          placeholder="Search servers..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </div>

      <div class="explore-categories">
        <For each={categories}>
          {(category) => (
            <button
              class={`category-btn ${selectedCategory() === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span class="category-icon">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          )}
        </For>
      </div>

      <div class="explore-servers">
        <Show when={filteredServers().length > 0} fallback={
          <div class="no-results">
            <p>No servers found matching your criteria</p>
          </div>
        }>
          <div class="server-grid">
            <For each={filteredServers()}>
              {(server) => (
                <div class="server-card">
                  <div class="server-icon">
                    {server.icon ? (
                      <img src={server.icon} alt={server.name} />
                    ) : (
                      server.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div class="server-info">
                    <h3>{server.name}</h3>
                    <p>{server.description}</p>
                    <span class="member-count">
                      {server.memberCount.toLocaleString()} members
                    </span>
                  </div>
                  <button class="join-btn">Join</button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Explore;