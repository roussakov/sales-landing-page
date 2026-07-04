const BUST = window.BUST || Date.now();

let config = {};
let items = [];
let bundles = [];
let activeCategory = 'הכל';
let searchTerm = '';

const grid = document.getElementById('grid');
const chipsEl = document.getElementById('chips');
const emptyState = document.getElementById('empty-state');

const WA_SVG = '<svg class="wa-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.1 4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.3 3.9 2.1.9 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.5l.4-.5c.1-.2.1-.3.2-.4v-.4L10 8.2c-.2-.4-.4-.4-.6-.4h-.5z"/></svg>';

init().catch(err => {
  console.error(err);
  emptyState.textContent = 'אופס, משהו השתבש בטעינת הפריטים 🙈 נסו לרענן את העמוד';
  emptyState.hidden = false;
});

async function init() {
  const res = await fetch('items.json?t=' + BUST, { cache: 'no-store' });
  const data = await res.json();
  config = data.config;
  items = data.items;
  bundles = data.bundles || [];

  renderHero();
  renderChips();
  renderSoldCounter();
  render();

  document.getElementById('search').addEventListener('input', e => {
    searchTerm = e.target.value.trim();
    render();
  });

  setupLightbox();
}

function waLink(message) {
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
}

function formatPrice(n) {
  return '₪' + n.toLocaleString('he-IL');
}

function categoryEmoji(cat) {
  return (config.categoryEmojis && config.categoryEmojis[cat]) || '📦';
}

function renderHero() {
  document.getElementById('hero-badge').textContent = config.heroBadge;
  document.getElementById('page-title').textContent = config.title;
  document.getElementById('page-subtitle').textContent = config.subtitle;
  document.getElementById('pickup-info').textContent = config.pickupInfo;
  document.title = config.title;
  if (config.freebies) {
    const el = document.getElementById('freebies');
    el.textContent = config.freebies;
    el.hidden = false;
  }
}

function bundleFor(item) {
  const bundle = bundles.find(b => b.items.includes(item.id));
  if (!bundle) return null;
  const members = bundle.items.map(id => items.find(i => i.id === id)).filter(Boolean);
  if (members.some(m => m.sold)) return null;
  return { ...bundle, members };
}

function renderChips() {
  const categories = ['הכל', ...new Set(items.map(i => i.category))];
  chipsEl.innerHTML = '';
  categories.forEach(cat => {
    const count = cat === 'הכל' ? items.length : items.filter(i => i.category === cat).length;
    const btn = document.createElement('button');
    btn.className = 'chip' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat === 'הכל' ? `הכל (${count})` : `${categoryEmoji(cat)} ${cat} (${count})`;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderChips();
      render();
    });
    chipsEl.appendChild(btn);
  });
}

function renderSoldCounter() {
  const sold = items.filter(i => i.sold).length;
  if (sold > 0) {
    document.getElementById('sold-counter').textContent =
      `🎉 כבר ${sold} פריטים מצאו בית חדש — אל תפספסו את שלכם!`;
  }
}

function render() {
  let visible = items.filter(i =>
    (activeCategory === 'הכל' || i.category === activeCategory) &&
    (searchTerm === '' || (i.name + ' ' + (i.description || '')).includes(searchTerm))
  );

  visible = [...visible.filter(i => !i.sold), ...visible.filter(i => i.sold)];

  grid.innerHTML = '';
  emptyState.hidden = visible.length > 0;

  visible.forEach(item => grid.appendChild(buildCard(item)));
}

function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'card' + (item.sold ? ' sold' : '');

  const media = document.createElement('div');
  media.className = 'card-media';
  media.style.background = pastelFor(item.category);

  if (item.images && item.images.length > 0) {
    const img = document.createElement('img');
    img.src = item.images[0] + '?t=' + BUST;
    img.alt = item.name;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.remove();
      media.append(categoryEmoji(item.category));
    });
    img.addEventListener('click', () => openLightbox(item));
    media.appendChild(img);
  } else {
    media.append(categoryEmoji(item.category));
  }

  if (item.sold) {
    media.insertAdjacentHTML('beforeend', '<span class="badge badge-sold">מצא בית חדש! 🎉</span>');
  }

  const body = document.createElement('div');
  body.className = 'card-body';

  const priceTags = [];
  if (item.originalPrice && !item.sold) priceTags.push(`<span class="price-was">${formatPrice(item.originalPrice)}</span>`);
  if (item.condition) priceTags.push(`<span class="tag tag-condition">${item.condition}</span>`);
  if (item.negotiable && !item.sold) priceTags.push(`<span class="tag tag-negotiable">גמישים במחיר 😉</span>`);

  body.innerHTML = `
    <h3>${item.name}</h3>
    <p class="card-desc">${item.description || ''}</p>
    <div class="price-row">
      <span class="price">${formatPrice(item.price)}</span>
      ${priceTags.join('')}
    </div>`;

  const bundle = item.sold ? null : bundleFor(item);
  if (bundle) {
    const others = bundle.members.filter(m => m.id !== item.id).map(m => m.name);
    const total = bundle.members.reduce((sum, m) => sum + m.price, 0);
    const hint = document.createElement('a');
    hint.className = 'bundle-hint';
    hint.target = '_blank';
    hint.rel = 'noopener';
    hint.href = waLink(`היי! אני מעוניין/ת בסט "${bundle.name}" (${bundle.members.map(m => m.name).join(', ')}) ב־${formatPrice(bundle.price)} 😊`);
    hint.innerHTML = `🎁 <strong>משתלם בסט!</strong> יחד עם ${others.join(' + ')} — הכל ב־<strong>${formatPrice(bundle.price)}</strong>` +
      (total > bundle.price ? ` <span class="was">${formatPrice(total)}</span>` : '');
    body.appendChild(hint);
  }

  if (!item.sold) {
    const btn = document.createElement('a');
    btn.className = 'wa-button';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.href = waLink(`היי! ראיתי את "${item.name}" באתר שלכם ואני מעוניין/ת 😊 עדיין זמין?`);
    btn.innerHTML = `${WA_SVG} אני רוצה!`;
    body.appendChild(btn);
  }

  card.append(media, body);
  return card;
}

const PASTELS = ['#FDEBDD', '#E9F3FB', '#F1EEFD', '#E6F5EC', '#FDF3D7', '#FBEAF0'];

function pastelFor(category) {
  const cats = [...new Set(items.map(i => i.category))];
  return PASTELS[cats.indexOf(category) % PASTELS.length];
}

function setupLightbox() {
  document.getElementById('wa-float').href =
    waLink('היי! ראיתי את מכירת תכולת הדירה שלכם ויש לי שאלה 😊');

  const lightbox = document.getElementById('lightbox');
  const close = () => { lightbox.hidden = true; };
  document.getElementById('lightbox-close').addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function openLightbox(item) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = item.images[0] + '?t=' + BUST;
  img.alt = item.name;
  lightbox.hidden = false;
}
