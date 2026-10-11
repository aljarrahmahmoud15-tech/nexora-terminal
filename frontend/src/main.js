const icon = (name, size = 19) => {
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 1v4M15 1v4M9 19v4M15 19v-4M1 9h4M1 15h4M19 9h4M19 15h-4"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1A2 2 0 0 1 3 15.1l.1-.1A2 2 0 0 0 1.7 11.6h-.2a2 2 0 0 1 0-4h.2A2 2 0 0 0 3.1 4.2L3 4.1A2 2 0 0 1 5.8 1.3l.1.1a2 2 0 0 0 3.4-1.4v-.2a2 2 0 0 1 4 0V0a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.4 3.4Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    refresh: '<path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11"/><path d="M3 5v6h6M4 13a8.1 8.1 0 0 0 14.9 3L21 13"/><path d="M21 19v-6h-6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-2 0 2 2m-5 1 2 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    terminal: '<path d="m4 7 5 5-5 5M12 17h8"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    play: '<path d="m8 5 12 7-12 7V5Z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  };
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
};

const app = document.querySelector('#app');
const navItems = [
  { id: 'dashboard', label: 'المركز التشغيلي', icon: 'grid', group: 'العمليات' },
  { id: 'commands', label: 'كتالوج الأوامر', icon: 'terminal', group: 'العمليات' },
  { id: 'devices', label: 'البوتات والطبقات', icon: 'layers', group: 'العمليات' },
  { id: 'executions', label: 'سجل التنفيذ', icon: 'activity', group: 'السجلات' },
  { id: 'requests', label: 'طلبات HMAC', icon: 'shield', group: 'السجلات' },
  { id: 'security', label: 'أحداث الأمان', icon: 'alert', group: 'السجلات' },
  { id: 'render', label: 'خدمات Render', icon: 'activity', group: 'الإدارة' },
  { id: 'integration', label: 'اتصال الجسر', icon: 'link', group: 'الإدارة' },
  { id: 'settings', label: 'الإعدادات والمفاتيح', icon: 'settings', group: 'الإدارة' },
];
const statusLabel = { online: 'متصل', warning: 'تحذير', offline: 'غير متصل', verified: 'موثّق', rejected: 'مرفوض', expired: 'منتهي' };
const actionLabel = { start: 'تشغيل', stop: 'إيقاف', restart: 'إعادة تشغيل', command: 'أمر مسموح' };
const executionLabel = { success: 'نجح', failed: 'فشل', timeout: 'انتهت المهلة', spawn_error: 'تعذر البدء', rejected: 'مرفوض', confirmation_required: 'ينتظر التأكيد' };
const state = {
  section: 'dashboard', menuOpen: false, modal: null, toast: '', search: '', deviceFilter: 'all', requestFilter: 'all', securityFilter: 'all',
  live: false, liveError: '', lastSync: '', overview: null, stations: [], requests: [], securityEvents: [], keys: [], executions: [],
  commandsConfigured: false, commandsReason: 'missing', commands: [], selectedCommandId: '', commandError: '', commandResult: null,
  renderServices: [], renderError: '', renderFetchedAt: '',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
function relativeTime(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'غير متاح';
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60_000));
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}
function fmtDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'غير متاح';
  return new Date(value).toLocaleString('ar-JO', { dateStyle: 'medium', timeStyle: 'short' });
}
async function apiRequest(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
  let body = {};
  try { body = await response.json(); } catch { /* non-JSON response */ }
  if (!response.ok) {
    const error = new Error(body.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}
function statusPill(status, text) {
  const valid = ['online', 'warning', 'offline', 'verified', 'rejected', 'expired', 'success', 'failed', 'active', 'disabled'].includes(status) ? status : 'offline';
  return `<span class="status-pill ${valid}"><span class="status-dot"></span>${escapeHtml(text || statusLabel[status] || status)}</span>`;
}
function button(label, cls = 'button secondary', action = '', iconName = '') {
  return `<button type="button" class="${cls}" data-action="${escapeHtml(action)}">${iconName ? icon(iconName, 16) : ''}<span>${escapeHtml(label)}</span></button>`;
}
function sectionTitle(kicker, title, description, actions = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${escapeHtml(kicker)}</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function commandCatalogStatus() {
  if (state.commandError) return { cls: 'warning', text: 'تعذر قراءة الكتالوج' };
  if (!state.commandsConfigured) return { cls: 'warning', text: 'كتالوج الأوامر غير مهيأ' };
  if (!state.commands.length) return { cls: 'warning', text: 'الكتالوج فارغ' };
  return { cls: 'online', text: `${state.commands.length} أمرًا مسموحًا` };
}
function bridgeStatus() {
  const telemetry = state.overview?.telemetry;
  if (!state.live || !telemetry) return { cls: 'warning', text: 'حالة الجسر غير متاحة' };
  if (!telemetry.configured) return { cls: 'warning', text: 'مفاتيح الجسر غير مهيأة' };
  if (!telemetry.heartbeatReceived) return { cls: 'warning', text: 'بانتظار أول نبض من الجسر' };
  return state.overview.devices?.online
    ? { cls: 'online', text: `${state.overview.devices.online} محطة تتصل حاليًا` }
    : { cls: 'warning', text: 'لا توجد محطة بنبض حديث' };
}
async function loadLiveData() {
  const [overview, devices, requests, security, keys, executions, commandCatalog] = await Promise.allSettled([
    apiRequest('/api/control/overview'), apiRequest('/api/control/devices'), apiRequest('/api/control/requests'),
    apiRequest('/api/control/security'), apiRequest('/api/control/keys'), apiRequest('/api/control/executions'), apiRequest('/api/commands'),
  ]);
  state.live = overview.status === 'fulfilled';
  state.liveError = overview.status === 'rejected' ? overview.reason.message : '';
  state.overview = overview.status === 'fulfilled' ? overview.value : null;
  state.stations = devices.status === 'fulfilled' && Array.isArray(devices.value.devices) ? devices.value.devices : [];
  state.requests = requests.status === 'fulfilled' && Array.isArray(requests.value.requests) ? requests.value.requests : [];
  state.securityEvents = security.status === 'fulfilled' && Array.isArray(security.value.events) ? security.value.events : [];
  state.keys = keys.status === 'fulfilled' && Array.isArray(keys.value.keys) ? keys.value.keys : [];
  state.executions = executions.status === 'fulfilled' && Array.isArray(executions.value.executions) ? executions.value.executions : [];
  if (commandCatalog.status === 'fulfilled') {
    state.commandsConfigured = Boolean(commandCatalog.value.configured);
    state.commandsReason = commandCatalog.value.reason || 'missing';
    state.commands = Array.isArray(commandCatalog.value.commands) ? commandCatalog.value.commands : [];
    state.commandError = '';
    if (!state.commands.some((command) => command.id === state.selectedCommandId)) state.selectedCommandId = state.commands[0]?.id || '';
  } else {
    state.commandsConfigured = false;
    state.commands = [];
    state.commandError = commandCatalog.reason.message;
  }
  state.lastSync = state.live ? new Date().toISOString() : '';
  render();
}
async function loadRenderServices() {
  state.renderError = '';
  render();
  try {
    const response = await apiRequest('/api/render/services');
    state.renderServices = Array.isArray(response.services) ? response.services : [];
    state.renderFetchedAt = response.fetchedAt || '';
  } catch (error) {
    state.renderError = error.status === 503 && error.body?.configured === false ? 'مفتاح Render غير مهيأ على الخادم.' : 'تعذرت قراءة خدمات Render من المصدر.';
  }
  render();
}
async function bootstrap() {
  try {
    const session = await apiRequest('/api/auth/session');
    if (!session.configured) {
      app.innerHTML = '<div class="nexora-login" dir="rtl"><div class="nexora-login-card"><h1>الإدارة غير مهيأة</h1><p>يجب ضبط CONTROL_API_KEY في أسرار خدمة الخادم (32 محرفًا على الأقل).</p></div></div>';
      return;
    }
    if (!session.authenticated) return renderLogin();
    render();
    loadLiveData();
  } catch {
    app.innerHTML = '<div class="nexora-login" dir="rtl"><div class="nexora-login-card"><h1>تعذر الاتصال بالخادم</h1><p>تحقق من اتصال الشبكة ثم أعد تحميل الصفحة.</p></div></div>';
  }
}
function renderLogin() {
  app.innerHTML = `<div class="nexora-login" dir="rtl"><form id="nexora-login-form" class="nexora-login-card"><div class="eyebrow">NEXORA COMMAND · دخول محمي</div><h1>مركز التشغيل</h1><p>أدخل مفتاح الإدارة. يُستخدم لإنشاء جلسة HttpOnly ولا يُحفظ في الواجهة.</p><label for="nexora-admin-secret">مفتاح الإدارة</label><input id="nexora-admin-secret" type="password" autocomplete="current-password" required minlength="32" /><button class="button primary" type="submit">دخول آمن</button><div id="nexora-login-error" role="alert"></div></form></div>`;
  document.querySelector('#nexora-login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector('#nexora-admin-secret');
    const error = document.querySelector('#nexora-login-error');
    const submit = event.currentTarget.querySelector('button');
    submit.disabled = true;
    try {
      await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ secret: input.value }) });
      input.value = '';
      await bootstrap();
    } catch (err) { error.textContent = err.message; submit.disabled = false; }
  });
}
function renderNav() {
  let group = '';
  return navItems.map((item) => {
    const title = item.group !== group ? `<div class="nav-group-label">${escapeHtml(item.group)}</div>` : '';
    group = item.group;
    return `${title}<button class="nav-item ${state.section === item.id ? 'active' : ''}" data-section="${item.id}" title="${escapeHtml(item.label)}">${icon(item.icon)}<span>${escapeHtml(item.label)}</span></button>`;
  }).join('');
}
function renderShell(content) {
  const bridge = bridgeStatus();
  const dockIds = ['dashboard', 'commands', 'devices', 'executions'];
  return `<div class="shell ${state.menuOpen ? 'menu-open' : ''}">
    <aside class="sidebar"><div class="brand"><div class="brand-mark"><i></i><i></i></div><div><strong>NEXORA COMMAND</strong><small>LINUX BRIDGE · CONTROL</small></div></div>
      <div class="workspace-card"><span class="workspace-dot ${bridge.cls}"></span><div><small>اتصال الجسر</small><strong>${escapeHtml(bridge.text)}</strong></div>${icon('activity', 16)}</div>
      <nav class="main-nav">${renderNav()}</nav>
      <div class="sidebar-footer"><div class="uptime-line"><span class="status-dot ${bridge.cls}"></span><span>${escapeHtml(bridge.text)}</span><strong>${state.lastSync ? escapeHtml(relativeTime(state.lastSync)) : '—'}</strong></div><div class="profile"><div class="avatar">N</div><div><strong>جلسة مدير</strong><small>مصادقة الخادم</small></div>${icon('shield', 16)}</div></div>
    </aside><div class="sidebar-backdrop" data-action="close-menu"></div>
    <main class="main-content"><header class="topbar"><button class="mobile-menu" data-action="toggle-menu" aria-label="فتح القائمة">${icon('grid')}</button><div class="breadcrumb"><span>NEXORA</span><b>/</b><strong>${escapeHtml(navItems.find((item) => item.id === state.section)?.label || 'المركز التشغيلي')}</strong></div><div class="topbar-actions"><div class="last-sync">${state.lastSync ? `آخر تحديث <strong>${escapeHtml(relativeTime(state.lastSync))}</strong>` : 'لا توجد مزامنة مؤكدة'}</div><button class="icon-button" data-action="refresh-data" aria-label="تحديث البيانات">${icon('refresh')}</button></div></header><div class="content-wrap">${content}</div></main>
    <nav class="mobile-dock">${dockIds.map((id) => { const item = navItems.find((entry) => entry.id === id); return `<button class="${state.section === id ? 'active' : ''}" data-section="${id}">${icon(item.icon, 18)}<span>${escapeHtml(item.label)}</span></button>`; }).join('')}</nav>
    ${state.modal ? renderModal() : ''}${state.toast ? `<div class="toast"><span class="toast-icon">${icon('check', 16)}</span>${escapeHtml(state.toast)}</div>` : ''}
  </div>`;
}
function renderStatusBanner() {
  const bridge = bridgeStatus();
  const commands = commandCatalogStatus();
  const noHeartbeat = state.overview?.telemetry?.configured && !state.overview?.telemetry?.heartbeatReceived;
  return `<div class="ops-banner ${bridge.cls === 'online' ? 'ok' : 'warn'}"><div class="ops-banner-icon">${icon(bridge.cls === 'online' ? 'activity' : 'alert', 20)}</div><div class="ops-banner-copy"><strong>${escapeHtml(bridge.text)}</strong><p>${noHeartbeat ? 'مفاتيح HMAC مهيأة، لكن لم يصل أي نبض بعد؛ لن تُعرض أجهزة أو مؤشرات تجريبية.' : !state.overview?.telemetry?.configured ? 'يلزم إعداد مفتاح HMAC فعّال في الخادم لاستقبال نبضات الجسر.' : state.liveError ? escapeHtml(state.liveError) : 'قراءة مباشرة من واجهات NEXORA ذات المصدر نفسه.'}</p></div><div class="ops-banner-side"><span class="mini-status ${commands.cls}">${escapeHtml(commands.text)}</span><small>${state.overview?.telemetry?.latestHeartbeat ? `آخر نبض ${escapeHtml(relativeTime(state.overview.telemetry.latestHeartbeat))}` : 'لا يوجد نبض مسجل'}</small></div></div>`;
}
function renderStat(label, value, caption, glyph, tone = 'blue') {
  return `<article class="stat-card ops-stat"><div class="stat-top"><span>${escapeHtml(label)}</span><span class="stat-icon ${tone}">${icon(glyph, 18)}</span></div><div class="stat-value">${escapeHtml(value)}</div><div class="stat-foot"><span>${escapeHtml(caption)}</span></div></article>`;
}
function renderDashboard() {
  const overview = state.overview;
  const telemetry = overview?.telemetry;
  const bridgeConfigured = Boolean(telemetry?.configured);
  const liveHeartbeats = Boolean(telemetry?.heartbeatReceived);
  const deviceValue = !bridgeConfigured || !liveHeartbeats ? 'غير مهيأ' : `${overview.devices?.online ?? 0} / ${overview.devices?.total ?? 0}`;
  const requestValue = overview?.requests?.total ? String(overview.requests.total) : 'بانتظار أول طلب';
  const commandStatus = commandCatalogStatus();
  const commandValue = !state.commandsConfigured ? 'غير مهيأ' : String(state.commands.length);
  const securityValue = overview?.requests?.total ? String(overview.security?.open ?? 0) : 'لا توجد بيانات';
  const commandActions = state.commands.filter((command) => command.serviceAction);
  const recentDevices = state.stations.slice(0, 5);
  return `${sectionTitle('NEXORA · مركز تشغيل Linux Bridge', 'مركز التشغيل المتقدم', 'اتصال مباشر وآمن بالخادم: راقب النبضات، اختر أمرًا من القائمة المسموحة، وتابع كل تنفيذ.', `${button('مزامنة الآن', 'button secondary', 'refresh-data', 'refresh')}`)}
    ${renderStatusBanner()}
    <div class="stat-grid ops-stats">${renderStat('اتصال الجسر', bridgeStatus().text, telemetry?.configured ? 'مفتاح HMAC على الخادم' : 'إعداد الجسر مطلوب', 'link', bridgeConfigured ? 'green' : 'orange')}${renderStat('البوتات / المحطات', deviceValue, liveHeartbeats ? `${overview.devices.online} متصل · ${overview.devices.offline} دون نبض حديث` : 'لن تظهر أرقام حتى وصول heartbeat موثّق', 'layers', liveHeartbeats ? 'blue' : 'orange')}${renderStat('كتالوج الأوامر', commandValue, commandStatus.text, 'terminal', state.commands.length ? 'purple' : 'orange')}${renderStat('طلبات HMAC', requestValue, overview?.requests?.total ? `${overview.requests.verified} موثّق · ${overview.requests.rejected} مرفوض` : 'السجل فارغ منذ تشغيل العملية', 'shield', overview?.requests?.total ? 'green' : 'blue')}</div>
    <div class="ops-layout"><section class="panel ops-panel command-panel">${renderCommandForm(true)}</section><section class="panel ops-panel"><div class="panel-head"><div><h2>أوامر الخدمات المعرّفة</h2><p>لا تظهر إجراءات تشغيل/إيقاف/إعادة تشغيل إلا إذا عرّفها المشغّل في قائمة الخادم.</p></div><span class="panel-icon">${icon('cpu', 18)}</span></div><div class="service-actions">${commandActions.length ? commandActions.map((command) => `<button class="service-action-card" data-select-command="${escapeHtml(command.id)}"><span class="action-symbol">${icon(command.serviceAction.operation === 'stop' ? 'stop' : command.serviceAction.operation === 'start' ? 'play' : 'refresh', 16)}</span><span><strong>${escapeHtml(command.serviceAction.service)}</strong><small>${escapeHtml(actionLabel[command.serviceAction.operation] || 'إجراء خدمة')} · ${escapeHtml(command.title)}</small></span>${icon('arrow', 16)}</button>`).join('') : `<div class="empty-state compact">${icon('layers', 25)}<h3>لا توجد إجراءات خدمة مهيأة</h3><p>أضف فقط إجراءات موثوقة إلى commands.json على الخادم؛ لن يتم اختراع أوامر هنا.</p></div>`}</div><div class="panel-footnote">كل تنفيذ خدمة يتطلب تأكيدًا صريحًا قبل الإرسال، ويتحقق الخادم من هوية الأمر وقائمة السماح.</div></section></div>
    <div class="ops-layout secondary-layout"><section class="panel ops-panel"><div class="panel-head"><div><h2>البوتات والطبقات</h2><p>تعرض المحطات التي وصلت عبر heartbeat موقّع فقط.</p></div>${button('عرض الكل', 'text-button', 'go-devices', 'arrow')}</div>${recentDevices.length ? `<div class="device-list">${recentDevices.map((device) => `<div class="device-row"><span class="device-glyph">${icon('cpu', 16)}</span><span class="device-copy"><strong>${escapeHtml(device.name || device.id)}</strong><small><code>${escapeHtml(device.id)}</code> · ${escapeHtml(device.region || 'منطقة غير محددة')}</small></span>${statusPill(device.status, statusLabel[device.status] || device.status)}<small class="device-seen">${escapeHtml(relativeTime(device.lastSeen))}</small></div>`).join('')}</div>` : `<div class="empty-state compact">${icon('activity', 25)}<h3>بانتظار أول heartbeat</h3><p>تأكد من إعداد مفتاح HMAC ثم وصل الجسر إلى /api/terminal/heartbeat.</p></div>`}</section><section class="panel ops-panel"><div class="panel-head"><div><h2>آخر عمليات التنفيذ</h2><p>تدقيق داخلي لآخر 100 تنفيذ في ذاكرة هذه العملية.</p></div>${button('فتح السجل', 'text-button', 'go-executions', 'arrow')}</div>${state.executions.length ? `<div class="mini-execution-list">${state.executions.slice(0, 4).map(renderExecutionRow).join('')}</div>` : `<div class="empty-state compact">${icon('terminal', 25)}<h3>لا يوجد تنفيذ مسجل</h3><p>سيظهر هنا الأمر المختار ونتيجته بعد الإرسال.</p></div>`}</section></div>
    ${state.commandResult ? renderCommandResult() : ''}`;
}
function commandInputFields(command) {
  return (command?.inputs || []).map((field) => `<label class="command-field"><span>${escapeHtml(field.name)}</span>${/prompt|message|text|query/i.test(field.name) ? `<textarea data-command-arg="${escapeHtml(field.name)}" rows="3" placeholder="${escapeHtml(field.example || 'أدخل القيمة المطلوبة لهذا الأمر فقط')}"></textarea>` : `<input data-command-arg="${escapeHtml(field.name)}" type="text" placeholder="${escapeHtml(field.example || 'قيمة وسيطة للأمر المحدد')}">`}</label>`).join('');
}
function renderCommandForm(compact = false) {
  const title = compact ? 'جسر Linux · تنفيذ آمن' : 'تشغيل أمر من القائمة المسموحة';
  const description = compact ? 'الواجهة لا ترسل نص shell. الخادم يختار التنفيذ من commands.json فقط.' : 'اختر عنصرًا مهيأً على الخادم؛ المدخلات ترتبط بعناصر القائمة ولا تتحول إلى أمر shell حر.';
  if (state.commandError) return `<div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div></div><div class="empty-state compact"><h3>تعذر تحميل كتالوج الخادم</h3><p>${escapeHtml(state.commandError)}</p></div>`;
  if (!state.commandsConfigured) return `<div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div></div><div class="empty-state compact"><span class="unconfigured-chip">غير مهيأ</span><h3>ملف commands.json غير موجود أو غير صالح</h3><p>لا يمكن تشغيل أي شيء قبل أن يوفّر المشغّل قائمة أوامر صحيحة على الخادم.</p></div>`;
  if (!state.commands.length) return `<div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div></div><div class="empty-state compact"><span class="unconfigured-chip">قائمة فارغة</span><h3>لا يوجد أمر مسموح للتشغيل</h3><p>لم يُنفّذ أي أمر؛ أضف فقط الأوامر المعتمدة إلى ملف الخادم.</p></div>`;
  const selected = state.commands.find((command) => command.id === state.selectedCommandId) || state.commands[0];
  const options = state.commands.map((command) => `<option value="${escapeHtml(command.id)}" ${command.id === selected.id ? 'selected' : ''}>${escapeHtml(command.title)}${command.serviceAction ? ` · ${escapeHtml(actionLabel[command.serviceAction.operation])} ${escapeHtml(command.serviceAction.service)}` : ''}</option>`).join('');
  const runLabel = selected.serviceAction ? `${actionLabel[selected.serviceAction.operation] || 'تنفيذ'} الخدمة` : 'تشغيل الأمر المختار';
  return `<div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div><span class="mini-status online">${state.commands.length} مُدرج</span></div><div class="command-console"><label class="command-select-label" for="command-select">الأمر المتاح</label><select id="command-select">${options}</select><div class="command-description"><strong>${escapeHtml(selected.title)}</strong><p>${escapeHtml(selected.description || 'لا يوجد وصف لهذا الأمر.')}</p>${selected.serviceAction ? `<span class="service-meta">${escapeHtml(actionLabel[selected.serviceAction.operation])} · ${escapeHtml(selected.serviceAction.service)}</span>` : ''}</div><div class="command-fields">${commandInputFields(selected) || '<p class="no-args">هذا الأمر لا يتطلب مدخلات.</p>'}</div><button type="button" class="button primary run-button" data-action="run-selected">${icon(selected.serviceAction ? 'shield' : 'play', 16)}<span>${escapeHtml(runLabel)}</span></button><p class="command-safety-note">${selected.serviceAction ? 'سيفتح تأكيد واضح للعملية قبل إرسالها إلى الخادم.' : 'التنفيذ متاح فقط لهذا المعرّف المسجّل على الخادم.'} لا يتم إرسال CONTROL_API_KEY إلى المتصفح.</p></div>`;
}
function renderCommandResult() {
  const result = state.commandResult;
  if (!result) return '';
  return `<section class="panel command-result"><div class="panel-head"><div><h2>نتيجة التنفيذ</h2><p>${escapeHtml(result.title || result.commandId)} · ${escapeHtml(fmtDate(result.executedAt || new Date().toISOString()))}</p></div>${statusPill(result.ok ? 'success' : 'failed', result.ok ? 'اكتمل' : 'لم يكتمل')}</div><div class="result-meta"><span>الحالة: ${escapeHtml(result.code ?? 'غير متاح')}</span><span>المدة: ${escapeHtml(result.durationMs ?? 0)} ms</span>${result.service ? `<span>${escapeHtml(actionLabel[result.operation] || result.operation)} · ${escapeHtml(result.service)}</span>` : ''}</div><div class="result-output"><strong>stdout</strong><pre>${escapeHtml(result.stdout || '—')}</pre>${result.stderr ? `<strong>stderr</strong><pre class="stderr">${escapeHtml(result.stderr)}</pre>` : ''}</div></section>`;
}
function renderCommandCatalog() {
  return `${sectionTitle('العمليات / قائمة الخادم', 'كتالوج الأوامر', 'هذه القائمة تأتي من commands.json على الخادم. لا توجد خانة shell خام ولا يتم إنشاء أوامر تلقائيًا.', `${button('إعادة تحميل', 'button secondary', 'refresh-data', 'refresh')}`)}<section class="panel ops-panel command-page">${renderCommandForm(false)}${state.commandResult ? renderCommandResult() : ''}</section><div class="ops-banner info"><div class="ops-banner-icon">${icon('shield', 19)}</div><div class="ops-banner-copy"><strong>حدّ الأمان</strong><p>كل طلب يتطلب جلسة المدير وcommandId موجودًا فعليًا في القائمة. الأسرار تبقى على الخادم، وتُعزل بيئة الأمر عن مفاتيح الإدارة وHMAC وRender.</p></div></div>`;
}
function renderDevices() {
  const filtered = state.stations.filter((device) => (state.deviceFilter === 'all' || device.status === state.deviceFilter) && `${device.id} ${device.name || ''} ${device.region || ''}`.toLowerCase().includes(state.search.toLowerCase()));
  return `${sectionTitle('العمليات / البوتات والطبقات', 'البوتات والطبقات', 'محطات حقيقية فقط: تُسجّل بعد نجاح توقيع HMAC، وتتحول إلى غير متصلة عند تجاوز مهلة النبض.', `${button('تحديث', 'button secondary', 'refresh-data', 'refresh')}`)}<div class="ops-banner ${state.overview?.telemetry?.heartbeatReceived ? 'ok' : 'warn'}"><div class="ops-banner-icon">${icon('activity', 19)}</div><div class="ops-banner-copy"><strong>${state.overview?.telemetry?.heartbeatReceived ? 'مصدر النبض مستلم' : 'لا يوجد مصدر heartbeat مسجل'}</strong><p>${state.overview?.telemetry?.configured ? `مهلة اعتبار المحطة متصلة: ${escapeHtml(state.overview.telemetry.staleAfterSeconds)} ثانية.` : 'يلزم مفتاح HMAC فعّال على الخادم لاستقبال النبضات.'}</p></div></div><div class="toolbar"><label class="search-field">${icon('search')}<input data-search="devices" value="${escapeHtml(state.search)}" placeholder="ابحث باسم المحطة أو المعرّف..." /></label><div class="filter-pills">${[['all','الكل'],['online','متصل'],['offline','غير متصل']].map(([key,label]) => `<button class="${state.deviceFilter === key ? 'active' : ''}" data-device-filter="${key}">${label}</button>`).join('')}</div></div><section class="panel table-panel full-panel">${filtered.length ? `<div class="table-scroll"><table><thead><tr><th>البوت / المحطة</th><th>المعرّف</th><th>الحالة</th><th>آخر نبض</th><th>الإصدار</th><th>المنطقة</th></tr></thead><tbody>${filtered.map((device) => `<tr data-device="${escapeHtml(device.id)}"><td><div class="entity-cell"><span class="device-glyph">${icon('cpu',17)}</span><div><strong>${escapeHtml(device.name || device.id)}</strong><small>${escapeHtml(device.type || 'Terminal')}</small></div></div></td><td><code>${escapeHtml(device.id)}</code></td><td>${statusPill(device.status, statusLabel[device.status] || device.status)}</td><td><span class="muted-text">${escapeHtml(relativeTime(device.lastSeen))}</span><small class="sub-value">${escapeHtml(device.lastSeen || '')}</small></td><td><code class="version">${escapeHtml(device.version || '—')}</code></td><td>${escapeHtml(device.region || 'غير محدد')}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state">${icon('layers', 28)}<h3>${state.stations.length ? 'لا توجد نتائج' : 'لا توجد بوتات أو طبقات مسجلة'}</h3><p>${state.stations.length ? 'غيّر البحث أو الفلتر.' : 'ستظهر العقد هنا فقط بعد أول heartbeat HMAC صالح من الجسر.'}</p></div>`}</section>`;
}
function renderExecutionRow(entry) {
  const label = executionLabel[entry.status] || entry.status || 'غير معروف';
  const operation = entry.operation && entry.operation !== 'command' ? `${actionLabel[entry.operation] || entry.operation}${entry.service ? ` · ${entry.service}` : ''}` : 'أمر مسموح';
  return `<div class="execution-row"><span class="execution-mark ${entry.status === 'success' ? 'ok' : entry.status === 'confirmation_required' ? 'wait' : 'bad'}">${icon(entry.status === 'success' ? 'check' : entry.status === 'confirmation_required' ? 'shield' : 'alert', 15)}</span><div class="execution-copy"><strong>${escapeHtml(entry.title || entry.commandId || 'أمر')}</strong><small><code>${escapeHtml(entry.commandId || '—')}</code> · ${escapeHtml(operation)}</small></div><span class="execution-status ${entry.status === 'success' ? 'ok' : ''}">${escapeHtml(label)}</span><time>${escapeHtml(fmtDate(entry.time))}</time></div>`;
}
function renderExecutions() {
  return `${sectionTitle('السجلات / تدقيق العمليات', 'سجل التنفيذ', 'سجل داخلي محدود لآخر 100 محاولة تشغيل. لا يسجل قيم المدخلات؛ السجل يمسح عند إعادة تشغيل العملية.', `${button('تحديث', 'button secondary', 'refresh-data', 'refresh')}`)}<section class="panel ops-panel full-panel">${state.executions.length ? `<div class="execution-list">${state.executions.map(renderExecutionRow).join('')}</div>` : `<div class="empty-state">${icon('terminal', 28)}<h3>لا يوجد سجل تنفيذ بعد</h3><p>سيتم تدوين الأمر المختار وحالته ومدة التنفيذ عند استدعائه.</p></div>`}</section>`;
}
function renderRequests() {
  const filtered = state.requests.filter((request) => (state.requestFilter === 'all' || request.status === state.requestFilter) && `${request.path} ${request.device} ${request.hash}`.toLowerCase().includes(state.search.toLowerCase()));
  const items = [['all','الكل'],['verified','موثّق'],['rejected','مرفوض']];
  return `${sectionTitle('السجلات / HMAC', 'طلبات الجسر الواردة', 'الطلبات التي استقبلها الخادم من مصدر الجسر وتم التحقق منها أو رفضها.', `${button('تحديث', 'button secondary', 'refresh-data', 'refresh')}`)}<div class="toolbar"><label class="search-field">${icon('search')}<input data-search="requests" value="${escapeHtml(state.search)}" placeholder="ابحث بالمسار أو المحطة أو البصمة..." /></label><div class="filter-pills">${items.map(([key,label]) => `<button class="${state.requestFilter === key ? 'active' : ''}" data-request-filter="${key}">${label}</button>`).join('')}</div></div><section class="panel table-panel full-panel">${filtered.length ? `<div class="table-scroll"><table><thead><tr><th>الوقت</th><th>المسار</th><th>المحطة</th><th>نتيجة التحقق</th><th>الزمن</th><th>بصمة التوقيع</th></tr></thead><tbody>${filtered.map((request) => `<tr><td><code>${escapeHtml(request.time || request.receivedAt || '—')}</code></td><td><code>${escapeHtml(request.path)}</code></td><td><code>${escapeHtml(request.device)}</code></td><td>${statusPill(request.status, statusLabel[request.status] || request.status)}</td><td>${escapeHtml(request.latency || '—')}</td><td><code>${escapeHtml(request.hash || '—')}</code></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state">${icon('shield',28)}<h3>لا توجد طلبات HMAC مسجلة</h3><p>هذا السجل يبدأ فارغًا ويعرض ما يصل إلى الخادم منذ تشغيله الحالي.</p></div>`}</section>`;
}
function renderSecurityEvent(event) {
  const level = ['high','medium','low'].includes(event.level) ? event.level : 'low';
  return `<div class="event-row"><span class="event-icon ${level}">${icon(level === 'low' ? 'check' : 'alert', 16)}</span><div class="event-copy"><strong>${escapeHtml(event.title)}</strong><p>${escapeHtml(event.detail)}</p><code>${escapeHtml(event.code)}</code></div><div class="event-meta"><span class="severity ${level}">${level === 'high' ? 'عالٍ' : level === 'medium' ? 'متوسط' : 'منخفض'}</span><small>${escapeHtml(fmtDate(event.time))}</small></div></div>`;
}
function renderSecurity() {
  const filtered = state.securityEvents.filter((event) => state.securityFilter === 'all' || event.level === state.securityFilter);
  return `${sectionTitle('السجلات / الأمن', 'أحداث الأمان', 'الأحداث الواردة إلى مخزن الجسر فقط؛ لا تُعرض درجة أمن أو أرقام تقديرية.', `${button('تحديث', 'button secondary', 'refresh-data', 'refresh')}`)}<div class="toolbar compact-toolbar"><div class="filter-pills">${[['all','كل المستويات'],['high','عالٍ'],['medium','متوسط'],['low','منخفض']].map(([key,label]) => `<button class="${state.securityFilter === key ? 'active' : ''}" data-security-filter="${key}">${label}</button>`).join('')}</div></div><section class="panel ops-panel full-panel">${filtered.length ? `<div class="event-list large-events">${filtered.map(renderSecurityEvent).join('')}</div>` : `<div class="empty-state">${icon('shield',28)}<h3>لا توجد أحداث أمان مسجلة</h3><p>ستظهر هنا أحداث الطرفية الموقعة والتنبيهات التي يسجلها الخادم.</p></div>`}</section>`;
}
function renderRenderServices() {
  const cards = state.renderServices.map((service) => `<article class="render-service-card"><div><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(service.type)} · ${escapeHtml(service.region || 'المنطقة غير متاحة')}</small></div><span class="render-status ${service.suspended ? 'suspended' : 'active'}">${service.suspended ? 'معلّقة' : escapeHtml(service.latestDeploy?.status || 'حالة النشر غير معروفة')}</span><div class="render-service-meta"><code>${escapeHtml(service.id)}</code>${service.url ? `<a href="${escapeHtml(service.url)}" target="_blank" rel="noopener noreferrer">فتح الخدمة</a>` : ''}${service.dashboardUrl ? `<a href="${escapeHtml(service.dashboardUrl)}" target="_blank" rel="noopener noreferrer">لوحة Render</a>` : ''}</div></article>`).join('');
  return `${sectionTitle('الإدارة / المصدر الخارجي', 'خدمات Render', 'قراءة فقط من واجهة Render؛ لا توجد عمليات نشر أو إعادة تشغيل من هذه الصفحة.', `${button('قراءة الآن', 'button secondary', 'refresh-render', 'refresh')}`)}<section class="panel ops-panel render-panel"><div class="panel-head"><div><h2>الخدمات المرتبطة</h2><p>${state.renderFetchedAt ? `آخر قراءة ${escapeHtml(fmtDate(state.renderFetchedAt))}` : 'لم تُقرأ بعد'}</p></div><span class="mini-status info">قراءة فقط</span></div>${state.renderError ? `<div class="empty-state compact"><h3>مصدر Render غير متاح</h3><p>${escapeHtml(state.renderError)}</p></div>` : cards || `<div class="empty-state compact"><h3>لم تُقرأ الخدمات بعد</h3><p>استخدم «قراءة الآن» لاستدعاء المصدر المتصل.</p></div>`}</section>`;
}
function renderIntegration() {
  const telem = state.overview?.telemetry;
  return `${sectionTitle('الإدارة / اتصال الجسر', 'اتصال NEXORA بالجسر', 'واجهة الويب والـ Linux Bridge يتشاركان نفس الخادم والنطاق؛ لا يوجد رابط API وهمي.', `${button('فحص الجلسة والبيانات', 'button primary', 'refresh-data', 'activity')}`)}<div class="ops-layout"><section class="panel ops-panel"><div class="panel-head"><div><h2>مسارات الجسر الفعلية</h2><p>الخادم نفسه الذي يقدم واجهة الإدارة.</p></div><span class="mini-status ${telem?.configured ? 'online' : 'warning'}">${telem?.configured ? 'مهيأ لاستقبال HMAC' : 'HMAC غير مهيأ'}</span></div><div class="bridge-endpoints"><div><code>GET /api/control/overview</code><span>ملخص الحالة الفعلية · جلسة مدير</span></div><div><code>GET /api/commands</code><span>الكتالوج المسموح · جلسة مدير</span></div><div><code>POST /api/run</code><span>تنفيذ أمر whitelisted · جلسة مدير</span></div><div><code>POST /api/terminal/heartbeat</code><span>نبض الجسر · توقيع HMAC-SHA256</span></div><div><code>POST /api/terminal/event</code><span>حدث الجسر · توقيع HMAC-SHA256</span></div></div><div class="panel-footnote">الجلسة HttpOnly ومحدودة العمر. مفتاح CONTROL_API_KEY وأسرار HMAC لا تغادر الخادم.</div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>حالة المصدر</h2><p>من بيانات الخادم الحالية فقط.</p></div></div><div class="bridge-status-list"><div><span>مفتاح HMAC فعّال</span>${statusPill(telem?.configured ? 'online' : 'offline', telem?.configured ? 'نعم' : 'غير مهيأ')}</div><div><span>وصل heartbeat</span>${statusPill(telem?.heartbeatReceived ? 'online' : 'offline', telem?.heartbeatReceived ? 'نعم' : 'لم يصل بعد')}</div><div><span>كتالوج الأوامر</span>${statusPill(state.commands.length ? 'online' : 'offline', state.commands.length ? `${state.commands.length} أمر` : 'غير مهيأ / فارغ')}</div><div><span>آخر نبض</span><code>${escapeHtml(fmtDate(telem?.latestHeartbeat))}</code></div></div></section></div><section class="panel ops-panel hmac-guide"><div class="panel-head"><div><h2>مصادقة الطرفية الواردة</h2><p>حافظ على توقيع الجسم الخام كما هو؛ لا تغيّر JSON بعد التوقيع.</p></div></div><div class="code-window"><div class="code-top"><span><i></i><i></i><i></i></span><small>HMAC-SHA256</small></div><pre>x-nexora-key: &lt;key-id&gt;
x-nexora-timestamp: &lt;unix-seconds&gt;
x-nexora-signature: sha256=&lt;hex-signature&gt;

HMAC(secret, timestamp + "." + rawRequestBody)</pre></div></section>`;
}
function renderSettings() {
  return `${sectionTitle('الإدارة / أسرار التشغيل', 'الإعدادات والمفاتيح', 'قيم الخادم الحساسة لا تُعرض. إدارة مفاتيح الطرفية تتم ضمن جلسة المدير الموثقة.', `${button('إنشاء مفتاح طرفية', 'button primary', 'create-key', 'plus')}`)}<div class="ops-banner info"><div class="ops-banner-icon">${icon('shield',19)}</div><div class="ops-banner-copy"><strong>الأسرار تبقى على الخادم</strong><p>CONTROL_API_KEY وRENDER_API_KEY وNEXORA_KEYS_JSON وCOMMANDS_FILE تُدار في بيئة تشغيل الخادم، وليس من المتصفح.</p></div></div><section class="panel ops-panel keys-panel"><div class="panel-head"><div><h2>مفاتيح HMAC للطرفيات</h2><p>السر لا يظهر في القائمة. عند إنشاء مفتاح جديد يُعرض مرة واحدة فقط.</p></div></div>${state.keys.length ? `<div class="keys-list">${state.keys.map((key) => `<div class="key-row"><span class="key-symbol">${icon('key',18)}</span><div class="key-details"><strong>${escapeHtml(key.name)}</strong><code>${escapeHtml(key.id)}</code></div><span class="key-date">أُنشئ ${escapeHtml(fmtDate(key.created))}<small>آخر استخدام ${escapeHtml(fmtDate(key.lastUsed))}</small></span>${statusPill(key.status, key.status === 'active' ? 'فعال' : 'معطل')}<button class="icon-button" data-disable-key="${escapeHtml(key.id)}" ${key.status !== 'active' ? 'disabled' : ''} aria-label="تعطيل المفتاح">${icon('close',16)}</button></div>`).join('')}</div>` : `<div class="empty-state compact"><h3>لا توجد مفاتيح HMAC مهيأة</h3><p>لن تُقبل نبضات الجسر قبل وجود مفتاح فعّال.</p></div>`}</section><section class="panel ops-panel"><div class="panel-head"><div><h2>قائمة الأوامر</h2><p>${state.commandsConfigured ? `${state.commands.length} أمرًا في ملف الخادم.` : 'لم يهيّأ commands.json على الخادم.'}</p></div><span class="mini-status ${state.commandsConfigured && state.commands.length ? 'online' : 'warning'}">${state.commandsConfigured && state.commands.length ? 'مهيأ' : 'غير مهيأ'}</span></div><div class="panel-footnote">ملف الأوامر server-side فقط، ويُحمّل عند الطلب. لا يوجد تحرير أو رفع أوامر من الواجهة.</div></section>`;
}
function renderModal() {
  if (state.modal.type === 'confirm-run') {
    const command = state.commands.find((item) => item.id === state.modal.commandId);
    if (!command) return '';
    const op = command.serviceAction;
    const phrase = actionLabel[op.operation] || op.operation;
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal small-modal" data-modal-content role="dialog" aria-modal="true"><div class="modal-head"><div><span class="eyebrow">تأكيد تنفيذ خدمة</span><h2>${escapeHtml(phrase)} · ${escapeHtml(op.service)}</h2></div><button class="icon-button" data-action="close-modal">${icon('close',18)}</button></div><div class="confirm-warning"><span>${icon('alert',20)}</span><p>سيُرسل الأمر <strong>${escapeHtml(command.title)}</strong> إلى خادم NEXORA. قد يؤدي الإجراء إلى توقف مؤقت أو انقطاع الخدمة. لن يبدأ التنفيذ إلا بعد تأكيدك.</p></div><div class="modal-actions">${button('إلغاء', 'button secondary', 'close-modal')}${button(`أؤكد ${phrase} الخدمة`, 'button danger', 'confirm-run', 'shield')}</div></div></div>`;
  }
  if (state.modal.type === 'device') {
    const device = state.stations.find((item) => item.id === state.modal.id);
    if (!device) return '';
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-content><div class="modal-head"><div><span class="eyebrow">نبض موثّق</span><h2>${escapeHtml(device.name || device.id)}</h2></div><button class="icon-button" data-action="close-modal">${icon('close',18)}</button></div><div class="modal-status">${statusPill(device.status, statusLabel[device.status])}<code>${escapeHtml(device.id)}</code></div><div class="detail-grid"><div><small>عنوان الشبكة</small><strong>${escapeHtml(device.ip || 'غير مبلّغ')}</strong></div><div><small>الإصدار</small><strong>${escapeHtml(device.version || 'غير مبلّغ')}</strong></div><div><small>المنطقة</small><strong>${escapeHtml(device.region || 'غير محدد')}</strong></div><div><small>آخر نبض</small><strong>${escapeHtml(fmtDate(device.lastSeen))}</strong></div></div><div class="modal-actions">${button('إغلاق', 'button secondary', 'close-modal')}</div></div></div>`;
  }
  if (state.modal.type === 'create-key') {
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal small-modal" data-modal-content><div class="modal-head"><div><span class="eyebrow">مفتاح جديد</span><h2>إنشاء مفتاح HMAC</h2></div><button class="icon-button" data-action="close-modal">${icon('close',18)}</button></div><label class="form-label">اسم المفتاح<input id="new-key-name" maxlength="80" placeholder="مثال: production-terminal" /></label><div class="modal-actions">${button('إلغاء', 'button secondary', 'close-modal')}${button('إنشاء', 'button primary', 'confirm-key', 'plus')}</div></div></div>`;
  }
  if (state.modal.type === 'created-key') {
    const key = state.modal.key;
    return `<div class="modal-backdrop"><div class="modal small-modal" data-modal-content role="dialog" aria-modal="true"><div class="modal-head"><div><span class="eyebrow">يُعرض مرة واحدة فقط</span><h2>احفظ سر المفتاح الآن</h2></div></div><p class="form-hint">لن يعاد عرض السر بعد إغلاق هذه النافذة. خزّنه في أسرار الطرفية؛ لا تضعه في GitHub أو السجلات.</p><code class="new-secret">${escapeHtml(key.secret)}</code><div class="modal-actions"><button class="button secondary" data-copy="${escapeHtml(key.secret)}">${icon('copy',16)}<span>نسخ السر</span></button>${button('تم الحفظ', 'button primary', 'close-modal')}</div></div></div>`;
  }
  return '';
}
function render() {
  let content = renderDashboard();
  if (state.section === 'commands') content = renderCommandCatalog();
  if (state.section === 'devices') content = renderDevices();
  if (state.section === 'requests') content = renderRequests();
  if (state.section === 'security') content = renderSecurity();
  if (state.section === 'executions') content = renderExecutions();
  if (state.section === 'render') content = renderRenderServices();
  if (state.section === 'integration') content = renderIntegration();
  if (state.section === 'settings') content = renderSettings();
  app.innerHTML = renderShell(content);
  bindEvents();
}
function bindEvents() {
  document.querySelectorAll('[data-section]').forEach((element) => element.addEventListener('click', () => {
    state.section = element.dataset.section;
    state.search = '';
    state.menuOpen = false;
    render();
    if (state.section === 'render' && !state.renderFetchedAt && !state.renderError) loadRenderServices();
  }));
  document.querySelectorAll('[data-search]').forEach((element) => element.addEventListener('input', (event) => {
    state.search = event.target.value;
    const caret = event.target.selectionStart;
    render();
    const input = document.querySelector(`[data-search="${element.dataset.search}"]`);
    if (input) { input.focus(); input.setSelectionRange(caret, caret); }
  }));
  document.querySelectorAll('[data-device-filter]').forEach((element) => element.addEventListener('click', () => { state.deviceFilter = element.dataset.deviceFilter; render(); }));
  document.querySelectorAll('[data-request-filter]').forEach((element) => element.addEventListener('click', () => { state.requestFilter = element.dataset.requestFilter; render(); }));
  document.querySelectorAll('[data-security-filter]').forEach((element) => element.addEventListener('click', () => { state.securityFilter = element.dataset.securityFilter; render(); }));
  document.querySelectorAll('[data-device]').forEach((element) => element.addEventListener('click', () => { state.modal = { type: 'device', id: element.dataset.device }; render(); }));
  document.querySelectorAll('[data-select-command]').forEach((element) => element.addEventListener('click', () => { state.selectedCommandId = element.dataset.selectCommand; state.section = 'commands'; render(); }));
  document.querySelectorAll('[data-copy]').forEach((element) => element.addEventListener('click', async () => { try { await navigator.clipboard?.writeText(element.dataset.copy); showToast('تم النسخ'); } catch { showToast('تعذر الوصول إلى الحافظة'); } }));
  document.querySelectorAll('[data-disable-key]').forEach((element) => element.addEventListener('click', () => { if (window.confirm('هل تريد تعطيل هذا المفتاح؟ ستُرفض بعد ذلك نبضات هذا المصدر.')) disableKey(element.dataset.disableKey); }));
  document.querySelectorAll('[data-action]').forEach((element) => element.addEventListener('click', () => handleAction(element.dataset.action, element)));
  document.querySelectorAll('[data-modal-content]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
  document.querySelector('#command-select')?.addEventListener('change', (event) => { state.selectedCommandId = event.target.value; render(); });
}
function collectCommandArgs() {
  const args = {};
  document.querySelectorAll('[data-command-arg]').forEach((field) => { args[field.dataset.commandArg] = field.value; });
  return args;
}
async function executeCommand(commandId, args = {}, confirmed = false) {
  const command = state.commands.find((item) => item.id === commandId);
  if (!command) return showToast('الأمر غير موجود في القائمة الحالية');
  if (command.serviceAction && !confirmed) {
    state.modal = { type: 'confirm-run', commandId, args };
    render();
    return;
  }
  state.modal = null;
  state.commandResult = null;
  render();
  try {
    const response = await apiRequest('/api/run', { method: 'POST', body: JSON.stringify({ commandId, args, ...(confirmed ? { confirmedCommandId: commandId } : {}) }) });
    state.commandResult = { ...response, executedAt: new Date().toISOString() };
    await loadLiveData();
    showToast(response.ok ? 'اكتمل التنفيذ' : 'انتهى التنفيذ بحالة غير ناجحة؛ راجع النتيجة والسجل');
  } catch (error) {
    if (error.status === 428 && error.body?.confirmationRequired) {
      state.modal = { type: 'confirm-run', commandId, args };
      render();
      return;
    }
    state.commandResult = { commandId, title: command.title, ok: false, stderr: error.message, code: `HTTP ${error.status || '?'}`, executedAt: new Date().toISOString() };
    await loadLiveData();
    showToast(error.message);
  }
}
async function createKey() {
  const name = document.querySelector('#new-key-name')?.value.trim();
  if (!name) return showToast('أدخل اسم المفتاح أولًا');
  try {
    const result = await apiRequest('/api/control/keys', { method: 'POST', body: JSON.stringify({ name }) });
    state.modal = { type: 'created-key', key: result.key };
    await loadLiveData();
    state.modal = { type: 'created-key', key: result.key };
    render();
  } catch (error) { showToast(error.message); }
}
async function disableKey(id) {
  try { await apiRequest(`/api/control/keys/${encodeURIComponent(id)}/disable`, { method: 'POST', body: '{}' }); await loadLiveData(); showToast('تم تعطيل المفتاح'); }
  catch (error) { showToast(error.message); }
}
function showToast(message) {
  state.toast = message;
  render();
  clearTimeout(window.__nexoraToastTimer);
  window.__nexoraToastTimer = setTimeout(() => { state.toast = ''; render(); }, 2800);
}
function handleAction(action) {
  if (action === 'toggle-menu') { state.menuOpen = !state.menuOpen; render(); }
  else if (action === 'close-menu') { state.menuOpen = false; render(); }
  else if (action === 'close-modal') { state.modal = null; render(); }
  else if (action === 'refresh-data') loadLiveData();
  else if (action === 'refresh-render') loadRenderServices();
  else if (action === 'go-devices') { state.section = 'devices'; render(); }
  else if (action === 'go-executions') { state.section = 'executions'; render(); }
  else if (action === 'run-selected') executeCommand(state.selectedCommandId, collectCommandArgs(), false);
  else if (action === 'confirm-run') { const modal = state.modal; if (modal?.commandId) executeCommand(modal.commandId, modal.args || {}, true); }
  else if (action === 'create-key') { state.modal = { type: 'create-key' }; render(); }
  else if (action === 'confirm-key') createKey();
}
bootstrap();
