function setCount(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

async function loadDashboard() {
  const message = document.getElementById('dashboard-message');
  if (message) message.textContent = 'Loading assets…';
  try {
    const response = await fetch('/api/assets');
    if (!response.ok) throw new Error(`Unable to load assets (HTTP ${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected /api/assets to return an array of assets.');
    const counts = { active: 0, maintenance: 0, 'in stock': 0, retired: 0, other: 0 };
    for (const asset of data) {
      const status = String(asset?.status ?? '').trim().toLowerCase();
      if (Object.hasOwn(counts, status)) counts[status]++;
      else counts.other++;
    }
    setCount('total-assets', data.length);
    setCount('donut-total-assets', data.length);
    for (const [status, ids] of Object.entries({
      active: ['active-assets', 'card-active-assets'],
      maintenance: ['maintenance-assets', 'card-maintenance-assets'],
      'in stock': ['available-assets', 'card-assets'],
      retired: ['retired-assets'],
      other: ['other-assets'],
    })) {
      ids.forEach(id => setCount(id, counts[status]));
    }
    const donut = document.querySelector('.donut');
    if (donut) {
      let position = 0;
      const colors = ['#64a98a', '#e58c7e', '#e9c963', '#9ca3af', '#7e75b8'];
      const stops = Object.values(counts).map((count, index) => {
        const start = position;
        position += data.length ? count / data.length * 100 : 0;
        return `${colors[index]} ${start}% ${position}%`;
      });
      donut.style.background = data.length ? `conic-gradient(${stops.join(', ')})` : '#e5e7eb';
    }
    if (message) message.textContent = data.length ? '' : 'No assets registered yet.';
  } catch (error) {
    console.error('Dashboard loading failed:', error);
    ['total-assets', 'donut-total-assets', 'active-assets', 'card-active-assets',
      'maintenance-assets', 'card-maintenance-assets', 'available-assets',
      'card-assets', 'retired-assets', 'other-assets'].forEach(id => setCount(id, '—'));
    if (message) message.textContent = `${error.message} Check that the backend is running and this page is served by Express.`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDashboard, { once: true });
} else {
  loadDashboard();
}
