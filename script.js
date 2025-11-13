const feedBox = document.getElementById('feedBox');
const feedUrlInput = document.getElementById('feedUrl');
const loadBtn = document.getElementById('loadFeedBtn');
const installBtn = document.getElementById('installBtn');
const STORAGE_KEY = 'savedFeedUrl';

let deferredPrompt = null;

async function fetchFeed(url) {
  try {
    const rss = url.replace(/\/$/, '') + '/feeds/posts/default?alt=rss';
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
    const res = await fetch(api);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function renderFeed(items) {
  if (!items || items.length === 0) {
    feedBox.innerHTML = '<p>No posts found.</p>';
    return;
  }
  feedBox.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'feed-item';
    div.innerHTML = `
      <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a><br>
      <small>${new Date(item.pubDate).toLocaleDateString()}</small>
    `;
    feedBox.appendChild(div);
  });
}

function saveFeedUrl(url) {
  localStorage.setItem(STORAGE_KEY, url);
}

function getSavedFeedUrl() {
  return localStorage.getItem(STORAGE_KEY);
}

async function loadFeed(url) {
  feedBox.innerHTML = '<p>Loading...</p>';
  const data = await fetchFeed(url);
  if (data && data.items) {
    renderFeed(data.items);
  } else {
    feedBox.innerHTML = '<p>Failed to load feed.</p>';
  }
}

loadBtn.addEventListener('click', () => {
  const url = feedUrlInput.value.trim();
  if (!url) {
    alert('Please enter a valid Blogger URL');
    return;
  }
  saveFeedUrl(url);
  loadFeed(url);
});

window.addEventListener('load', () => {
  const savedUrl = getSavedFeedUrl();
  if (savedUrl) {
    feedUrlInput.value = savedUrl;
    loadFeed(savedUrl);
  }
});

// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(console.error);
}

// Handle PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
    installBtn.style.display = 'none';
    deferredPrompt = null;
  } else {
    console.log('User dismissed the install prompt');
  }
});
