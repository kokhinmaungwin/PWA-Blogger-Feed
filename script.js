const feedBox = document.getElementById('feedBox');
const feedUrlInput = document.getElementById('feedUrl');
const loadBtn = document.getElementById('loadFeedBtn');
const STORAGE_KEY = 'savedFeedUrl';

let currentPage = 1;
let perPage = 10;
let nextPageToken = null;
let prevPageTokens = []; // Stack to keep track of previous tokens for Prev button

// Pagination buttons
const paginationBox = document.createElement("div");
paginationBox.id = "pagination";
document.body.appendChild(paginationBox);

async function fetchFeed(url, pageToken = "") {
  try {
    let feedUrl = url.replace(/\/$/, '') + `/feeds/posts/summary?alt=json&max-results=${perPage}`;
    if (pageToken) {
      feedUrl += `&pageToken=${pageToken}`;
    }

    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error('Network error');

    const data = await res.json();

    // Extract posts
    const posts = data.feed.entry || [];

    // Extract nextPageToken if available
    const nextToken = data.feed.openSearch$startIndex
      ? data.feed.openSearch$startIndex.$t
      : null;

    return {
      posts,
      nextPageToken: nextToken,
    };
  } catch (e) {
    console.error(e);
    return { posts: [], nextPageToken: null };
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
    // item.media$thumbnail or item.content
    const img = (item.media$thumbnail && item.media$thumbnail.url) || extractImage(item.content.$t);

    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      ${img ? `<img src="${img}" class="feed-img">` : ""}
      <a href="#" data-content="${encodeURIComponent(item.content.$t)}">${item.title.$t}</a><br>
      <small>${new Date(item.published.$t).toLocaleDateString()}</small>
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

function renderPagination(canNext) {
  paginationBox.innerHTML = `
    <button id="prevBtn" ${prevPageTokens.length === 0 ? "disabled" : ""}>Previous</button>
    <span>Page ${currentPage}</span>
    <button id="nextBtn" ${!canNext ? "disabled" : ""}>Next</button>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (prevPageTokens.length > 0) {
      nextPageToken = prevPageTokens.pop();
      currentPage--;
      loadFeed(feedUrlInput.value, nextPageToken, false);
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    if (canNext) {
      // Save current nextPageToken to prev stack before going forward
      prevPageTokens.push(nextPageToken);
      currentPage++;
      loadFeed(feedUrlInput.value, nextPageToken, true);
    }
  };
}

async function loadFeed(url, pageToken = "", forward = true) {
  feedBox.innerHTML = "<p>Loading...</p>";

  const data = await fetchFeed(url, pageToken);

  if (!data || !data.posts) {
    feedBox.innerHTML = "<p>Failed to load feed.</p>";
    renderPagination(false);
    return;
  }

  renderFeed(data.posts);

  // Update nextPageToken for next page request
  nextPageToken = data.nextPageToken;

  // Disable Next if no nextPageToken
  renderPagination(nextPageToken !== null && nextPageToken !== undefined);
}

loadBtn.onclick = () => {
  const url = feedUrlInput.value.trim();
  if (!url) {
    alert("Please enter a Blogger URL");
    return;
  }
  currentPage = 1;
  nextPageToken = null;
  prevPageTokens = [];
  saveFeedUrl(url);
  loadFeed(url);
};

function saveFeedUrl(url) {
  localStorage.setItem(STORAGE_KEY, url);
}

function getSavedFeedUrl() {
  return localStorage.getItem(STORAGE_KEY);
}

// Load saved feed url on page load
window.onload = () => {
  const saved = getSavedFeedUrl();
  if (saved) {
    feedUrlInput.value = saved;
    loadFeed(saved);
  }
};

// Modal handling
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
