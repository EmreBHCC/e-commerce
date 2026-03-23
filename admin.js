/* ── admin.js – ShopX Admin Control Panel ── */

// ── BROADCASTCHANNEL ───────────────────────────────────
const CHANNEL_NAME = 'shopx_admin_bridge';
const bc = new BroadcastChannel(CHANNEL_NAME);

// ── LOCALSTORAGE KEYS ─────────────────────────────────
const LS_KEY      = 'shopx_test_sessions';
const LS_LOGS_KEY = 'shopx_live_logs';   // persisted live log stream
const LS_LOGS_MAX = 500;                 // max logs to keep in storage

// ── STATE ─────────────────────────────────────────────
const Admin = {
  logs: [],
  logFilter: 'all',
  connected: false,
  sessionStart: Date.now(),
  notifCount: 0,
  stats: { system: 0, navigation: 0, product: 0, cart: 0, search: 0, ui: 0 },
  // Subject session management
  activeSessionId: null,   // ID of the currently running subject session
  activeSessionTimer: null,
};

// ── LOCALSTORAGE HELPERS ───────────────────────────────
function loadSessions() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Session load error:', e);
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Session save error:', e);
    showAdminToast('⚠️ Veri kaydetme hatası! localStorage dolu olabilir.', 'error');
  }
}

function getSession(id) {
  return loadSessions().find(s => s.id === id) || null;
}

function upsertSession(session) {
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  saveSessions(sessions);
}

// ── SUBJECT SESSION MANAGEMENT ─────────────────────────

function startSubjectSession() {
  const nameInput = document.getElementById('subj-name');
  const notesInput = document.getElementById('subj-notes');
  const name = nameInput?.value.trim();
  const notes = notesInput?.value.trim();

  if (!name) {
    showAdminToast('⚠️ Denek adı / kodu girin', 'warning');
    nameInput?.focus();
    return;
  }

  // Stop existing active session first
  if (Admin.activeSessionId) {
    stopSubjectSession(true); // silent stop
  }

  const now = new Date();
  const session = {
    id: `sess_${Date.now()}`,
    name,
    notes: notes || '',
    status: 'running',
    startTime: now.toISOString(),
    startTimeDisplay: now.toLocaleString('tr-TR'),
    endTime: null,
    endTimeDisplay: null,
    durationSecs: 0,
    logs: [],
    stats: { system: 0, navigation: 0, product: 0, cart: 0, search: 0, ui: 0 },
  };

  upsertSession(session);
  Admin.activeSessionId = session.id;

  // Clear form
  if (nameInput) nameInput.value = '';
  if (notesInput) notesInput.value = '';

  // Update UI
  updateActiveSessionUI(session);
  refreshSubjectList();
  updateActiveBadge(name);

  // Start elapsed timer
  clearInterval(Admin.activeSessionTimer);
  Admin.activeSessionTimer = setInterval(() => {
    if (!Admin.activeSessionId) return;
    const sess = getSession(Admin.activeSessionId);
    if (!sess) return;
    const elapsed = Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000);
    sess.durationSecs = elapsed;
    const el = document.getElementById('active-sess-elapsed');
    if (el) {
      const m = Math.floor(elapsed / 60), s = elapsed % 60;
      el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    const lc = document.getElementById('active-sess-logcount');
    if (lc) lc.textContent = sess.logs.length;
    // Persist elapsed time periodically
    upsertSession(sess);
    refreshSubjectListSilent(); // update duration in list without full re-render
  }, 1000);

  showAdminToast(`▶ "${name}" oturumu başlatıldı`, 'success');
  switchTab('subjects');
}

function stopSubjectSession(silent = false) {
  if (!Admin.activeSessionId) {
    if (!silent) showAdminToast('⚠️ Aktif oturum yok', 'warning');
    return;
  }

  const sessions = loadSessions();
  const sess = sessions.find(s => s.id === Admin.activeSessionId);
  if (sess) {
    const now = new Date();
    sess.status = 'stopped';
    sess.endTime = now.toISOString();
    sess.endTimeDisplay = now.toLocaleString('tr-TR');
    sess.durationSecs = Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000);
    saveSessions(sessions);
  }

  clearInterval(Admin.activeSessionTimer);
  Admin.activeSessionTimer = null;
  const stoppedName = sess?.name || Admin.activeSessionId;
  Admin.activeSessionId = null;

  // Update UI
  const card = document.getElementById('active-session-card');
  if (card) card.style.display = 'none';
  const bar = document.getElementById('active-subject-bar');
  if (bar) bar.style.display = 'none';

  refreshSubjectList();
  if (!silent) showAdminToast(`⏹ "${stoppedName}" oturumu durduruldu`, 'info');
}

function updateActiveSessionUI(session) {
  const card = document.getElementById('active-session-card');
  if (card) card.style.display = 'block';
  const nameEl = document.getElementById('active-sess-name');
  if (nameEl) nameEl.textContent = session.name;
  const startEl = document.getElementById('active-sess-start');
  if (startEl) startEl.textContent = session.startTimeDisplay;
  const elapsed = document.getElementById('active-sess-elapsed');
  if (elapsed) elapsed.textContent = '00:00';
  const lc = document.getElementById('active-sess-logcount');
  if (lc) lc.textContent = '0';
}

function updateActiveBadge(name) {
  const bar = document.getElementById('active-subject-bar');
  const nameEl = document.getElementById('asb-name');
  if (bar) bar.style.display = 'flex';
  if (nameEl) nameEl.textContent = name;
}

// ── LOG ROUTING TO ACTIVE SESSION ─────────────────────
function appendLogToActiveSession(entry) {
  if (!Admin.activeSessionId) return;
  const sessions = loadSessions();
  const sess = sessions.find(s => s.id === Admin.activeSessionId);
  if (!sess || sess.status !== 'running') return;
  sess.logs.push(entry);
  if (sess.stats[entry.type] !== undefined) sess.stats[entry.type]++;
  saveSessions(sessions);
}

// ── SESSION LIST RENDERING ─────────────────────────────
function refreshSubjectList() {
  const sessions = loadSessions();
  const list = document.getElementById('subj-list');
  const empty = document.getElementById('subj-empty');
  const countEl = document.getElementById('subj-count');
  const badge = document.getElementById('nav-badge-subjects');

  if (countEl) countEl.textContent = `${sessions.length} oturum`;
  if (badge) {
    badge.textContent = sessions.length;
    badge.classList.toggle('visible', sessions.length > 0);
  }

  if (!list) return;

  if (sessions.length === 0) {
    list.innerHTML = `
      <div class="subj-empty" id="subj-empty">
        <div style="font-size:2.5rem;opacity:.3">🧪</div>
        <div style="color:var(--text3);font-size:.82rem;margin-top:8px">Henüz oturum yok</div>
      </div>`;
    return;
  }

  list.innerHTML = sessions.map(sess => {
    const isActive = sess.id === Admin.activeSessionId;
    const durationStr = formatDuration(sess.durationSecs || 0);
    const statusBadge = isActive
      ? `<span class="sess-status running">▶ Aktif</span>`
      : `<span class="sess-status stopped">⏹ Tamamlandı</span>`;
    const statsSummary = `
      <div class="sess-mini-stats">
        <span title="Sepet">🛒${sess.stats.cart}</span>
        <span title="Ürün">📦${sess.stats.product}</span>
        <span title="Arama">🔍${sess.stats.search}</span>
        <span title="Navigasyon">🧭${sess.stats.navigation}</span>
      </div>`;
    return `
      <div class="sess-item ${isActive ? 'active' : ''}" id="sessitem-${sess.id}">
        <div class="sess-item-header">
          <div class="sess-item-name">${escHtml(sess.name)}</div>
          ${statusBadge}
        </div>
        <div class="sess-item-meta">
          <span>🕐 ${sess.startTimeDisplay}</span>
          ${sess.endTimeDisplay ? `<span>→ ${sess.endTimeDisplay}</span>` : ''}
          <span>⏱ ${durationStr}</span>
          <span>📋 ${sess.logs.length} log</span>
        </div>
        ${sess.notes ? `<div class="sess-item-notes">${escHtml(sess.notes)}</div>` : ''}
        ${statsSummary}
        <div class="sess-item-actions">
          <button class="action-btn secondary" onclick="viewSessionDetail('${sess.id}')">🔍 Detay</button>
          <button class="action-btn secondary" onclick="exportSession('${sess.id}')">⬇ JSON</button>
          <button class="action-btn secondary" onclick="exportSessionCSV('${sess.id}')">📊 CSV</button>
          ${!isActive ? `<button class="action-btn danger" onclick="deleteSession('${sess.id}')">🗑</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function refreshSubjectListSilent() {
  // Only update duration and log count for active session row, no full re-render
  if (!Admin.activeSessionId) return;
  const sess = getSession(Admin.activeSessionId);
  if (!sess) return;
  const item = document.getElementById(`sessitem-${sess.id}`);
  if (!item) return;
  // Update log count span if it exists
  const metaSpans = item.querySelectorAll('.sess-item-meta span');
  if (metaSpans.length >= 4) {
    metaSpans[2].textContent = `⏱ ${formatDuration(sess.durationSecs || 0)}`;
    metaSpans[3].textContent = `📋 ${sess.logs.length} log`;
  }
}

function deleteSession(id) {
  if (!confirm('Bu oturumu silmek istiyor musunuz? Bu işlem geri alınamaz.')) return;
  const sessions = loadSessions().filter(s => s.id !== id);
  saveSessions(sessions);
  refreshSubjectList();
  showAdminToast('🗑 Oturum silindi', 'info');
}

function clearAllSessions() {
  if (!confirm('TÜM oturumları ve loglarını silmek istiyor musunuz? Bu işlem GERİ ALINAMAZ!')) return;
  if (Admin.activeSessionId) stopSubjectSession(true);
  saveSessions([]);
  refreshSubjectList();
  showAdminToast('🗑 Tüm oturumlar silindi', 'info');
}

// ── SESSION DETAIL MODAL ──────────────────────────────
function viewSessionDetail(id) {
  const sess = getSession(id);
  if (!sess) return;

  let modal = document.getElementById('sess-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sess-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    document.body.appendChild(modal);
  }

  const logRows = sess.logs.map(l => `
    <div class="sdl-row">
      <span class="sdl-ts">${l.time}</span>
      <span class="log-badge badge-${l.type}">${l.type}</span>
      <span class="sdl-msg">${escHtml(l.msg)}</span>
    </div>`).join('') || '<div style="color:var(--text3);padding:16px;text-align:center">Log kaydı yok</div>';

  modal.innerHTML = `
    <div style="background:#151c30;border:1px solid rgba(99,102,241,.3);border-radius:16px;width:100%;max-width:700px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 0 40px rgba(99,102,241,.2)">
      <div style="padding:18px 20px;border-bottom:1px solid rgba(99,120,200,.15);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <div>
          <div style="font-size:1rem;font-weight:800;color:#e2e8f0">🧪 ${escHtml(sess.name)}</div>
          <div style="font-size:.73rem;color:#64748b;margin-top:3px">${sess.startTimeDisplay} ${sess.endTimeDisplay ? '→ '+sess.endTimeDisplay : '(devam ediyor)'} · ${sess.logs.length} log · ${formatDuration(sess.durationSecs||0)}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button style="padding:7px 12px;background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:8px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit" onclick="exportSession('${sess.id}')">⬇ JSON</button>
          <button style="padding:7px 12px;background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.3);border-radius:8px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit" onclick="exportSessionCSV('${sess.id}')">📊 CSV</button>
          <button onclick="document.getElementById('sess-detail-modal').style.display='none'" style="padding:7px 12px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit">✕ Kapat</button>
        </div>
      </div>
      ${sess.notes ? `<div style="padding:10px 20px;background:rgba(99,102,241,.08);border-bottom:1px solid rgba(99,120,200,.1);font-size:.78rem;color:#94a3b8">📝 ${escHtml(sess.notes)}</div>` : ''}
      <div style="padding:10px 20px;display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid rgba(99,120,200,.1);flex-shrink:0">
        ${Object.entries(sess.stats).map(([k,v]) => `<span style="font-size:.72rem;background:var(--surface2);padding:3px 8px;border-radius:99px;color:#94a3b8"><strong style="color:#a5b4fc">${v}</strong> ${k}</span>`).join('')}
      </div>
      <div style="overflow-y:auto;flex:1;font-family:'JetBrains Mono',monospace;font-size:.76rem">${logRows}</div>
    </div>`;
  modal.style.display = 'flex';
}

// ── EXPORT ────────────────────────────────────────────
function exportSession(id) {
  const sess = getSession(id);
  if (!sess) return;
  downloadJSON(sess, `shopx-${slugify(sess.name)}-${id.slice(-8)}.json`);
  showAdminToast('⬇ JSON indirildi', 'success');
}

function exportSessionCSV(id) {
  const sess = getSession(id);
  if (!sess) return;
  const header = 'Zaman,Tip,Mesaj,Cinsiyet,Sepet';
  const rows = sess.logs.map(l =>
    `"${l.time}","${l.type}","${(l.msg||'').replace(/"/g,'""')}","${l.gender||''}","${l.cartSize||0}"`
  );
  const csv = [header, ...rows].join('\n');
  downloadText(csv, `shopx-${slugify(sess.name)}-${id.slice(-8)}.csv`, 'text/csv');
  showAdminToast('📊 CSV indirildi', 'success');
}

function exportAllSessions() {
  const sessions = loadSessions();
  if (!sessions.length) { showAdminToast('⚠️ Kayıtlı oturum yok', 'warning'); return; }
  const out = {
    exportedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    totalLogs: sessions.reduce((s,x) => s + x.logs.length, 0),
    sessions,
  };
  downloadJSON(out, `shopx-all-sessions-${Date.now()}.json`);
  showAdminToast(`⬇ ${sessions.length} oturum indirildi`, 'success');
}

function exportAllSessionsCSV() {
  const sessions = loadSessions();
  if (!sessions.length) { showAdminToast('⚠️ Kayıtlı oturum yok', 'warning'); return; }
  const header = 'OturumID,Denek,OturumBaşlangıç,OturumBitiş,Süre(sn),Zaman,Tip,Mesaj,Cinsiyet,Sepet';
  const rows = [];
  sessions.forEach(sess => {
    if (!sess.logs.length) {
      rows.push(`"${sess.id}","${sess.name}","${sess.startTimeDisplay}","${sess.endTimeDisplay||''}","${sess.durationSecs||0}","","","","",""`);
    } else {
      sess.logs.forEach(l => {
        rows.push(`"${sess.id}","${sess.name}","${sess.startTimeDisplay}","${sess.endTimeDisplay||''}","${sess.durationSecs||0}","${l.time}","${l.type}","${(l.msg||'').replace(/"/g,'""')}","${l.gender||''}","${l.cartSize||0}"`);
      });
    }
  });
  downloadText([header, ...rows].join('\n'), `shopx-all-sessions-${Date.now()}.csv`, 'text/csv');
  showAdminToast(`📊 CSV indirildi`, 'success');
}

// ── DOWNLOAD HELPERS ──────────────────────────────────
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadText(text, filename, mime = 'text/plain') {
  // Add BOM for CSV to handle Turkish characters in Excel
  const bom = mime.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + text], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}s ${String(m).padStart(2,'0')}dk ${String(s).padStart(2,'0')}sn`;
  return `${String(m).padStart(2,'0')}dk ${String(s).padStart(2,'0')}sn`;
}

// ── BROADCAST: RECEIVE FROM MAIN SITE ─────────────────
bc.onmessage = (event) => {
  const { type, payload } = event.data || {};
  if (type === 'LOG') {
    handleIncomingLog(payload);
  } else if (type === 'HEARTBEAT') {
    setConnected(true);
  } else if (type === 'ACK') {
    showAdminToast(`✅ Komut işlendi: ${payload?.cmd || ''}`, 'success');
  }
};

// ── INCOMING LOG HANDLER ───────────────────────────────
function handleIncomingLog(entry) {
  if (!entry) return;

  // Hide empty state
  const emptyEl = document.getElementById('log-empty');
  if (emptyEl) emptyEl.style.display = 'none';

  Admin.logs.unshift(entry);
  if (Admin.stats[entry.type] !== undefined) Admin.stats[entry.type]++;

  // Route log to active subject session
  appendLogToActiveSession(entry);

  // Persist live log to localStorage
  _persistLiveLog(entry);

  renderLogRow(entry);
  updateCounters();

  // Notification badge
  Admin.notifCount++;
  const nc = document.getElementById('notif-count');
  if (nc) {
    nc.textContent = Admin.notifCount > 99 ? '99+' : Admin.notifCount;
    nc.style.display = 'block';
  }
}

function renderLogRow(entry) {
  const stream = document.getElementById('log-stream');
  if (!stream) return;

  const shouldHide = Admin.logFilter !== 'all' && entry.type !== Admin.logFilter;
  const div = document.createElement('div');
  div.className = `log-row${shouldHide ? ' hidden' : ''}`;
  div.dataset.type = entry.type;

  const genderClass = entry.gender === 'female' ? 'female' : entry.gender === 'male' ? 'male' : 'none';
  const genderLabel = entry.gender === 'female' ? '👩' : entry.gender === 'male' ? '👨' : '–';

  // Show active session indicator
  const sessTag = Admin.activeSessionId
    ? `<span class="sess-tag">🧪</span>`
    : '';

  div.innerHTML = `
    <span class="log-ts">${entry.time}</span>
    <span class="log-badge badge-${entry.type}">${entry.type}</span>
    <span class="log-msg">${escHtml(entry.msg)}${entry.cartSize > 0 ? `<span class="log-extra"> · 🛒 ${entry.cartSize}</span>` : ''}</span>
    ${sessTag}
    <span class="gender-pill ${genderClass}">${genderLabel}</span>
  `;

  stream.insertBefore(div, stream.firstChild);

  const autoScroll = document.getElementById('auto-scroll-check');
  if (autoScroll?.checked) stream.scrollTop = 0;
}

// ── BROADCAST: SEND COMMAND TO MAIN SITE ──────────────
function sendCommand(cmd, data = {}) {
  bc.postMessage({ type: 'COMMAND', cmd, ...data });
  showAdminToast(`📡 Komut gönderildi: ${cmd}`, 'info');
}

function sendToast() {
  const msg = document.getElementById('toast-message').value.trim();
  const toastType = document.getElementById('toast-type').value;
  if (!msg) { showAdminToast('⚠️ Mesaj girin', 'warning'); return; }
  bc.postMessage({ type: 'COMMAND', cmd: 'SHOW_TOAST', msg, toastType });
  showAdminToast('💬 Toast gönderildi', 'success');
}

function sendCustomPopup() {
  const title = document.getElementById('popup-title').value.trim();
  const body  = document.getElementById('popup-body').value.trim();
  if (!title) { showAdminToast('⚠️ Başlık girin', 'warning'); return; }
  bc.postMessage({ type: 'COMMAND', cmd: 'SHOW_CUSTOM_POPUP', title, body });
  showAdminToast('📢 Popup gönderildi', 'success');
}

// ── FILTER ────────────────────────────────────────────
function applyFilter(type, btn) {
  Admin.logFilter = type;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.log-row').forEach(row => {
    row.classList.toggle('hidden', type !== 'all' && row.dataset.type !== type);
  });
}

// ── TABS ──────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  document.getElementById(`nav-${tab}`)?.classList.add('active');

  const titles = {
    logs:     ['📊 Canlı Loglar',       'Kullanıcı hareketleri gerçek zamanlı'],
    control:  ['🎮 Kontrol Merkezi',    'Ana siteyi uzaktan yönet'],
    subjects: ['🧪 Denekler',           'Test oturumlarını yönet ve kaydet'],
    stats:    ['📈 İstatistikler',      'Log analizi ve dağılım'],
  };
  const [title, sub] = titles[tab] || ['', ''];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-sub').textContent = sub;

  if (tab === 'stats') updateStats();
  if (tab === 'subjects') refreshSubjectList();
}

// ── STATS ─────────────────────────────────────────────
function updateStats() {
  const s = Admin.stats;
  const total = Admin.logs.length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-cart').textContent = s.cart;
  document.getElementById('stat-search').textContent = s.search;
  document.getElementById('stat-product').textContent = s.product;
  document.getElementById('stat-nav').textContent = s.navigation;
  document.getElementById('stat-ui').textContent = s.ui;

  const barDefs = [
    { key: 'navigation', label: 'Navigasyon', color: '#3b82f6' },
    { key: 'cart',       label: 'Sepet',       color: '#22c55e' },
    { key: 'product',    label: 'Ürün',         color: '#a855f7' },
    { key: 'search',     label: 'Arama',        color: '#f59e0b' },
    { key: 'ui',         label: 'UI',           color: '#ec4899' },
    { key: 'system',     label: 'Sistem',       color: '#6366f1' },
  ];
  const max = Math.max(1, ...barDefs.map(b => s[b.key]));
  const barContainer = document.getElementById('chart-bars');
  if (barContainer) {
    barContainer.innerHTML = barDefs.map(b => `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${b.label}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${Math.round(s[b.key]/max*100)}%; background:${b.color}"></div>
        </div>
        <span class="chart-bar-count">${s[b.key]}</span>
      </div>
    `).join('');
  }
}

// ── TIMELINE ──────────────────────────────────────────
function updateTimeline(entry) {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  const div = document.createElement('div');
  div.className = 'tl-item';
  div.innerHTML = `<span class="tl-time">${entry.time}</span><span class="tl-msg">${escHtml(entry.msg)}</span>`;
  tl.insertBefore(div, tl.firstChild);
  while (tl.children.length > 20) tl.removeChild(tl.lastChild);
}

// ── COUNTERS ──────────────────────────────────────────
function updateCounters() {
  const total = Admin.logs.length;
  document.getElementById('admin-log-count').textContent = total;
  const badge = document.getElementById('nav-badge-logs');
  if (badge) {
    badge.textContent = total > 99 ? '99+' : total;
    badge.classList.toggle('visible', total > 0);
  }
}

// ── CLEAR LIVE LOGS ────────────────────────────────────
function clearAllLogs() {
  Admin.logs = [];
  Admin.stats = { system: 0, navigation: 0, product: 0, cart: 0, search: 0, ui: 0 };
  localStorage.removeItem(LS_LOGS_KEY); // clear persisted logs too
  const stream = document.getElementById('log-stream');
  if (stream) {
    stream.innerHTML = `
      <div class="log-empty" id="log-empty">
        <div class="log-empty-icon">📡</div>
        <div class="log-empty-title">Log akışı temizlendi</div>
        <div class="log-empty-sub">Yeni loglar gelince burada görünecek</div>
      </div>`;
  }
  updateCounters();
  const tl = document.getElementById('timeline');
  if (tl) tl.innerHTML = '';
  showAdminToast('🗑 Canlı log akışı temizlendi', 'info');
}

// ── LIVE LOG PERSISTENCE ──────────────────────────────
function _persistLiveLog(entry) {
  try {
    const raw = localStorage.getItem(LS_LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(entry);
    // Trim to max to avoid quota issues
    if (logs.length > LS_LOGS_MAX) logs.length = LS_LOGS_MAX;
    localStorage.setItem(LS_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    // Storage quota exceeded – skip silently
  }
}

function _restoreLiveLogs() {
  try {
    const raw = localStorage.getItem(LS_LOGS_KEY);
    if (!raw) return;
    const logs = JSON.parse(raw);
    if (!logs || !logs.length) return;

    // Hide empty placeholder
    const emptyEl = document.getElementById('log-empty');
    if (emptyEl) emptyEl.style.display = 'none';

    // Render oldest→newest (array is newest-first, so iterate reverse)
    for (let i = logs.length - 1; i >= 0; i--) {
      const entry = logs[i];
      Admin.logs.unshift(entry);
      if (Admin.stats[entry.type] !== undefined) Admin.stats[entry.type]++;
      renderLogRow(entry);
      updateTimeline(entry);
    }
    updateCounters();
    showAdminToast(`📂 ${logs.length} log geri yüklendi`, 'info');
  } catch (e) {
    console.warn('Live log restore error:', e);
  }
}

// ── CONNECTION STATUS ──────────────────────────────────
function setConnected(val) {
  Admin.connected = val;
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  const pulse = document.getElementById('sync-pulse');
  const lbl = document.getElementById('sync-label');
  if (val) {
    dot?.classList.replace('disconnected', 'connected');
    if (txt) txt.textContent = 'Ana site bağlı';
    if (pulse) pulse.style.background = '#22c55e';
    if (lbl) { lbl.textContent = 'Senkronize'; lbl.style.color = '#22c55e'; }
  } else {
    dot?.classList.replace('connected', 'disconnected');
    if (txt) txt.textContent = 'Bağlantı kesildi';
    if (pulse) pulse.style.background = '#ef4444';
    if (lbl) { lbl.textContent = 'Bağlantı Yok'; lbl.style.color = '#ef4444'; }
  }
}

let heartbeatTimeout = null;
function resetHeartbeatTimer() {
  clearTimeout(heartbeatTimeout);
  setConnected(true);
  heartbeatTimeout = setTimeout(() => setConnected(false), 6000);
}
bc.addEventListener('message', e => {
  if (e.data?.type === 'HEARTBEAT') resetHeartbeatTimer();
  if (e.data?.type === 'LOG') resetHeartbeatTimer();
});

// ── SESSION TIMER ─────────────────────────────────────
setInterval(() => {
  const elapsed = Math.floor((Date.now() - Admin.sessionStart) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const el = document.getElementById('admin-session-time');
  if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}, 1000);

// ── NOTIF BELL ─────────────────────────────────────────
function clearNotifBadge() {
  Admin.notifCount = 0;
  const nc = document.getElementById('notif-count');
  if (nc) nc.style.display = 'none';
}

// ── ADMIN TOAST ────────────────────────────────────────
function showAdminToast(msg, type = 'info') {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('admin-toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ── UTILS ─────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INIT ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Restore persisted live logs first
  _restoreLiveLogs();

  showAdminToast('🚀 Admin paneli hazır', 'success');
  refreshSubjectList();

  // Restore active session if the page was refreshed mid-session
  const sessions = loadSessions();
  const running = sessions.find(s => s.status === 'running');
  if (running) {
    Admin.activeSessionId = running.id;
    updateActiveSessionUI(running);
    updateActiveBadge(running.name);
    showAdminToast(`⏱ "${running.name}" oturumu devam ediyor`, 'info');
    // Re-attach timer
    clearInterval(Admin.activeSessionTimer);
    Admin.activeSessionTimer = setInterval(() => {
      if (!Admin.activeSessionId) return;
      const sess = getSession(Admin.activeSessionId);
      if (!sess) return;
      const elapsed = Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000);
      sess.durationSecs = elapsed;
      const el = document.getElementById('active-sess-elapsed');
      if (el) {
        const m = Math.floor(elapsed / 60), s = elapsed % 60;
        el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }
      const lc = document.getElementById('active-sess-logcount');
      if (lc) lc.textContent = sess.logs.length;
      upsertSession(sess);
      refreshSubjectListSilent();
    }, 1000);
  }

  // Ask main site to identify itself
  setTimeout(() => bc.postMessage({ type: 'PING' }), 500);
});

// ── EXPOSE GLOBALS ────────────────────────────────────
Object.assign(window, {
  switchTab, applyFilter, clearAllLogs,
  sendCommand, sendToast, sendCustomPopup,
  clearNotifBadge,
  startSubjectSession, stopSubjectSession,
  deleteSession, clearAllSessions,
  viewSessionDetail,
  exportSession, exportSessionCSV,
  exportAllSessions, exportAllSessionsCSV,
});
