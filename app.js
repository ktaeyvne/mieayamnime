import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'ISI_APIKEY',
  authDomain: 'ISI_DOMAIN',
  projectId: 'ISI_PROJECTID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const detail = document.getElementById('detail');

let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

window.loginGoogle = () => {
  signInWithPopup(auth, new GoogleAuthProvider());
};

async function api(url) {
  const res = await fetch(url);
  return await res.json();
}

function render(arr) {
  grid.innerHTML = arr.map(a => `
    <div class="card" onclick="openAnime(${a.mal_id})">
      <img src="${a.images.jpg.large_image_url}">
      <div class="p">
        <b>${a.title}</b><br>
        ⭐ ${a.score || '-'}
      </div>
    </div>
  `).join('');
}

window.loadTrending = async () => {
  const data = await api('https://api.jikan.moe/v4/top/anime?limit=24');
  render(data.data);
};

window.searchAnime = async () => {
  const q = document.getElementById('search').value.trim();
  if (!q) return;
  const data = await api('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(q));
  render(data.data);
};

window.openAnime = async (id) => {
  modal.classList.remove('hidden');
  const data = await api('https://api.jikan.moe/v4/anime/' + id + '/full');
  const a = data.data;

  detail.innerHTML = `
    <button onclick="modal.classList.add('hidden')">Tutup</button>
    <h2>${a.title}</h2>
    <img src="${a.images.jpg.large_image_url}" width="240">
    <p>${a.synopsis || ''}</p>
    <button onclick="addWatchlist(${a.mal_id}, '${a.title}')">+ Watchlist</button>
  `;
};

window.addWatchlist = (id, title) => {
  watchlist.push({ id, title });
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
};

window.showWatchlist = () => {
  grid.innerHTML = watchlist.map(x => `
    <div class="card">
      <div class="p">
        <b>${x.title}</b>
      </div>
    </div>
  `).join('');
};


document.body.insertAdjacentHTML('afterbegin','<div id="loader" style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;z-index:9999;color:white;font-size:1.3rem;letter-spacing:2px">Entering Cinematic Mode...</div>');
setTimeout(()=>document.getElementById('loader')?.remove(),900);
loadTrending();
