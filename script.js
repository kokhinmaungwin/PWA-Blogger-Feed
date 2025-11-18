const feedBox = document.getElementById('feedBox');
const feedUrlInput = document.getElementById('feedUrl');
const loadBtn = document.getElementById('loadFeedBtn');
const STORAGE_KEY = 'savedFeedUrl';

let currentPage = 1;
let perPage = 10;

// Pagination buttons
const paginationBox = document.createElement("div");
paginationBox.id = "pagination";
document.body.appendChild(paginationBox);

async function fetchFeed(url, page = 1) {
  try {
    const startIndex = (page - 1) * perPage + 1;

    const rss =
      url.replace(/\/$/, '') +
      `/feeds/posts/default?alt=rss&max-results=${perPage}&start-index=${startIndex}`;

    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Network error');

    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function extractImage(desc) {
  const match = desc.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : "";
}

function renderFeed(items) {
  if (!items || items.length === 0) {
    feedBox.innerHTML = "<p>No posts found.</p>";
    return;
  }

  feedBox.innerHTML = "";

  items.forEach(item => {
    const img = item.thumbnail || extractImage(item.description);

    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      ${img ? `<img src="${img}" class="feed-img">` : ""}
      <a href="#" data-content="${encodeURIComponent(item.description)}">${item.title}</a><br>
      <small>${new Date(item.pubDate).toLocaleDateString()}</small>
    `;
    feedBox.appendChild(div);
  });

  document.querySelectorAll(".feed-item a").forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      openModal(decodeURIComponent(link.dataset.content));
    };
  });
}

function renderPagination() {
  paginationBox.innerHTML = `
    <button id="prevBtn">Previous</button>
    <span>Page ${currentPage}</span>
    <button id="nextBtn">Next</button>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadFeed(feedUrlInput.value, currentPage);
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    currentPage++;
    loadFeed(feedUrlInput.value, currentPage);
  };
}

async function loadFeed(url, page = 1) {
  feedBox.innerHTML = "<p>Loading...</p>";

  const data = await fetchFeed(url, page);

  if (data && data.items) {
    renderFeed(data.items);
    renderPagination();
  } else {
    feedBox.innerHTML = "<p>Failed to load feed.</p>";
  }
}

loadBtn.onclick = () => {
  const url = feedUrlInput.value.trim();
  if (!url) {
    alert("Please enter a Blogger URL");
    return;
  }
  currentPage = 1;
  saveFeedUrl(url);
  loadFeed(url, 1);
};

function saveFeedUrl(url) {
  localStorage.setItem(STORAGE_KEY, url);
}

function getSavedFeedUrl() {
  return localStorage.getItem(STORAGE_KEY);
}

// Load saved
window.onload = () => {
  const saved = getSavedFeedUrl();
  if (saved) {
    feedUrlInput.value = saved;
    loadFeed(saved, 1);
  }
};

// Modal
const modal = document.getElementById("postModal");
const modalBody = document.getElementById("modalBody");
document.getElementById("closeModal").onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

function openModal(content) {
  modalBody.innerHTML = content;
  modal.style.display = "block";
}

// PWA Install
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});
installBtn.onclick = async () => {
  deferredPrompt.prompt();
  deferredPrompt = null;
  installBtn.style.display = "none";
};
