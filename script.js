const feedBox = document.getElementById('feedBox');
const feedUrlInput = document.getElementById('feedUrl');
const loadBtn = document.getElementById('loadFeedBtn');
const STORAGE_KEY = 'savedFeedUrl';

let currentStartIndex = 1;
const perPage = 10;   // တစ်ခေါက်ပြရန် post အရေအတွက်

const paginationBox = document.createElement("div");
paginationBox.id = "pagination";
document.body.appendChild(paginationBox);

async function fetchFeed(url, startIndex = 1) {
  try {
    // Blogger API max-results အများဆုံး 100 လောက်ပဲ သတ်မှတ်သင့်သည်
    // start-index ကို သုံးထားပေမယ့် deprecated ဖြစ်နိုင်တဲ့အတွက် သတိထားပါ
    let feedUrl = url.replace(/\/$/, '') + `/feeds/posts/summary?alt=json&max-results=${perPage}&start-index=${startIndex}`;
    
    // CORS proxy သုံးချင်ရင် ဒီလို uncomment ပြီးသုံးပါ
    // const proxy = "https://cors-anywhere.herokuapp.com/";
    // feedUrl = proxy + feedUrl;

    console.log("Fetching feed URL:", feedUrl);

    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error('Network error');

    const data = await res.json();
    console.log("Feed data:", data);

    // စုစုပေါင်း posts အရေအတွက်
    const totalResults = data.feed.openSearch$totalResults ? parseInt(data.feed.openSearch$totalResults.$t, 10) : 0;
    const posts = data.feed.entry || [];

    return { posts, totalResults };
  } catch (e) {
    console.error("Fetch error:", e);
    return { posts: [], totalResults: 0 };
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
    const img = (item.media$thumbnail && item.media$thumbnail.url) || extractImage(item.content.$t);

    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      ${img ? `<img src="${img}" class="feed-img" style="max-width:150px; max-height:100px; margin-bottom:8px;">` : ""}
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

function renderPagination(canPrev, canNext) {
  paginationBox.innerHTML = `
    <button id="prevBtn" ${!canPrev ? "disabled" : ""}>Previous</button>
    <span style="margin: 0 10px;">Page ${Math.ceil(currentStartIndex / perPage)}</span>
    <button id="nextBtn" ${!canNext ? "disabled" : ""}>Next</button>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (canPrev) {
      loadFeed(feedUrlInput.value, currentStartIndex - perPage);
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    if (canNext) {
      loadFeed(feedUrlInput.value, currentStartIndex + perPage);
    }
  };
}

async function loadFeed(url, startIndex = 1) {
  feedBox.innerHTML = "<p>Loading...</p>";

  const data = await fetchFeed(url, startIndex);

  if (!data || !data.posts) {
    feedBox.innerHTML = "<p>Failed to load feed.</p>";
    renderPagination(false, false);
    return;
  }

  renderFeed(data.posts);

  const canPrev = startIndex > 1;
  const canNext = (startIndex + perPage) <= data.totalResults;

  currentStartIndex = startIndex;

  renderPagination(canPrev, canNext);
}

loadBtn.onclick = () => {
  const url = feedUrlInput.value.trim();
  if (!url) {
    alert("Please enter a Blogger URL");
    return;
  }
  currentStartIndex = 1;
  saveFeedUrl(url);
  loadFeed(url, currentStartIndex);
};

function saveFeedUrl(url) {
  localStorage.setItem(STORAGE_KEY, url);
}

function getSavedFeedUrl() {
  return localStorage.getItem(STORAGE_KEY);
}

window.onload = () => {
  const saved = getSavedFeedUrl();
  if (saved) {
    feedUrlInput.value = saved;
    loadFeed(saved, 1);
  }
};

const modal = document.getElementById("postModal");
const modalBody = document.getElementById("modalBody");
document.getElementById("closeModal").onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

function openModal(content) {
  modalBody.innerHTML = content;
  modal.style.display = "block";
}

// PWA install support
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
