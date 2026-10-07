// Confirm this category endpoint against your Express routes before use.
const lookupSettings = [
  { id: 'category', url: '/api/categories', key: 'category_id', label: row => row.category_name },
  { id: 'department', url: '/api/departments', key: 'department_id', label: row => row.department_name },
  { id: 'assigned-user', url: '/api/users', key: 'user_id', label: row => [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username },
];

async function requestJSON(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { throw new Error(`${url} returned a non-JSON response (HTTP ${response.status}). Check the API route.`); }
  if (!response.ok) throw new Error(data?.message || data?.error || `Request failed (HTTP ${response.status}).`);
  if (data?.success === false) throw new Error(data.message || 'The server rejected the request.');
  return data;
}

async function initializeCreateAsset() {
  const form = document.getElementById('create-asset-form');
  const message = document.getElementById('form-message');
  const save = form.querySelector('button[type="submit"]');
  let ready = false;
  let saving = false;
  save.disabled = true;
  message.textContent = 'Loading categories, departments and users…';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || saving || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() || null]));
    if (!payload.asset_tag || !payload.asset_name) {
      message.className = 'form-message error';
      message.textContent = 'Asset tag and asset name cannot be blank.';
      return;
    }
    for (const key of ['category_id', 'department_id', 'assigned_to', 'purchase_cost']) {
      if (payload[key] !== null) payload[key] = Number(payload[key]);
    }
    saving = true;
    save.disabled = true;
    message.className = 'form-message';
    message.textContent = 'Saving asset…';
    try {
      await requestJSON('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      message.className = 'form-message success';
      message.textContent = 'Asset created successfully.';
      form.reset();
    } catch (error) {
      message.className = 'form-message error';
      message.textContent = error.message;
    } finally {
      saving = false;
      save.disabled = false;
    }
  });
  try {
    // Validate all lookup results before enabling a database write.
    const results = await Promise.all(lookupSettings.map(async setting => {
      const rows = await requestJSON(setting.url);
      if (!Array.isArray(rows)) throw new Error(`${setting.url} must return an array.`);
      if (setting.id === 'category' && !rows.length) throw new Error('Create at least one category before registering assets.');
      if (rows.some(row => !row || !Number.isInteger(Number(row[setting.key])) || Number(row[setting.key]) <= 0 || !setting.label(row))) {
        throw new Error(`Unexpected fields in ${setting.url}. Check lookupSettings in create-asset.js.`);
      }
      return { setting, rows };
    }));
    for (const { setting, rows } of results) {
      const select = document.getElementById(setting.id);
      select.length = 1;
      rows.forEach(row => select.add(new Option(setting.label(row), row[setting.key])));
    }
    ready = true;
    save.disabled = false;
    message.textContent = '';
  } catch (error) {
    message.className = 'form-message error';
    message.textContent = `${error.message} Correct the API configuration and reload this page.`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCreateAsset, { once: true });
} else {
  initializeCreateAsset();
}
