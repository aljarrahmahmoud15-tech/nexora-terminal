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
  };
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
};

let stations = [
  { id: 'NX-00421', name: 'محطة الرياض — البوابة الشمالية', type: 'Kiosk Prime', status: 'online', last: 'منذ 18 ثانية', ip: '10.24.8.41', version: '2.8.1', region: 'الرياض' },
  { id: 'NX-00419', name: 'محطة جدة — صالة الوصول', type: 'Kiosk Prime', status: 'online', last: 'منذ 42 ثانية', ip: '10.24.6.18', version: '2.8.1', region: 'جدة' },
  { id: 'NX-00388', name: 'محطة الدمام — المدخل الرئيسي', type: 'Terminal Edge', status: 'warning', last: 'منذ 4 دقائق', ip: '10.18.3.72', version: '2.7.9', region: 'الدمام' },
  { id: 'NX-00352', name: 'محطة أبوظبي — المبنى B', type: 'Terminal Edge', status: 'offline', last: 'منذ 2 ساعة', ip: '10.16.4.09', version: '2.7.8', region: 'أبوظبي' },
  { id: 'NX-00341', name: 'محطة دبي — مركز العمليات', type: 'Kiosk Prime', status: 'online', last: 'منذ 8 دقائق', ip: '10.12.9.11', version: '2.8.1', region: 'دبي' },
];

let requests = [
  { time: '02:14:21', method: 'POST', path: '/v1/terminal/heartbeat', device: 'NX-00421', status: 'verified', latency: '84ms', hash: 'd5f0…a9c1' },
  { time: '02:14:19', method: 'GET', path: '/v1/config/poll', device: 'NX-00419', status: 'verified', latency: '112ms', hash: 'a1e3…7f02' },
  { time: '02:13:57', method: 'POST', path: '/v1/terminal/event', device: 'NX-00388', status: 'rejected', latency: '48ms', hash: '90b8…d120' },
  { time: '02:13:41', method: 'POST', path: '/v1/terminal/heartbeat', device: 'NX-00341', status: 'verified', latency: '76ms', hash: 'f3aa…18de' },
  { time: '02:12:04', method: 'GET', path: '/v1/config/poll', device: 'NX-00421', status: 'verified', latency: '95ms', hash: 'b992…4ce0' },
  { time: '02:11:48', method: 'POST', path: '/v1/terminal/event', device: 'NX-00352', status: 'expired', latency: '—', hash: '22d1…8a01' },
];

let securityEvents = [
  { level: 'high', title: 'تم رفض توقيع HMAC', detail: 'NX-00388 أرسل توقيعًا غير مطابق للمسار /v1/terminal/event', time: 'منذ 17 دقيقة', code: 'SIG_MISMATCH' },
  { level: 'medium', title: 'محاولة استخدام مفتاح منتهي', detail: 'المفتاح key_live_••••91f4 لم يعد فعالًا', time: 'منذ 36 دقيقة', code: 'KEY_EXPIRED' },
  { level: 'low', title: 'تم تدوير مفتاح وصول', detail: 'تم التدوير بواسطة system-admin من لوحة التحكم', time: 'منذ ساعة', code: 'KEY_ROTATED' },
  { level: 'medium', title: 'تأخر في نبض المحطة', detail: 'NX-00352 لم يرسل heartbeat خلال المهلة المحددة', time: 'منذ ساعتين', code: 'HEARTBEAT_LATE' },
];

let keys = [
  { name: 'production-terminal', id: 'key_live_••••91f4', created: '12 سبتمبر 2026', status: 'active', used: 'منذ 18 ثانية' },
  { name: 'staging-terminal', id: 'key_test_••••72a1', created: '03 سبتمبر 2026', status: 'active', used: 'منذ 4 ساعات' },
  { name: 'legacy-gateway', id: 'key_live_••••08b9', created: '14 يوليو 2026', status: 'disabled', used: 'منذ 27 يومًا' },
];

const state = {
  section: 'dashboard',
  search: '',
  deviceFilter: 'all',
  requestFilter: 'all',
  securityFilter: 'all',
  modal: null,
  toast: null,
  menuOpen: false,
  live: false,
};

const API_BASE = window.NEXORA_API_BASE || '';
async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}
async function loadLiveData() {
  try {
    const [deviceData, requestData, securityData, keyData] = await Promise.all([
      apiGet('/api/control/devices'),
      apiGet('/api/control/requests'),
      apiGet('/api/control/security'),
      apiGet('/api/control/keys'),
    ]);
    if (Array.isArray(deviceData.devices)) stations = deviceData.devices.map((device) => ({ ...device, last: device.lastSeen ? `منذ ${Math.max(1, Math.round((Date.now() - Date.parse(device.lastSeen)) / 60000))} دقيقة` : 'غير معروف' }));
    if (Array.isArray(requestData.requests)) requests = requestData.requests;
    if (Array.isArray(securityData.events)) securityEvents = securityData.events;
    if (Array.isArray(keyData.keys)) keys = keyData.keys.map((key) => ({ ...key, used: key.lastUsed ? 'مؤخرًا' : 'لم يُستخدم بعد' }));
    state.live = true;
    render();
  } catch (error) {
    console.info('Control API unavailable; keeping local preview data.', error);
  }
}

const navItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: 'grid', group: 'المراقبة' },
  { id: 'devices', label: 'الأجهزة والمحطات', icon: 'cpu', group: 'المراقبة', badge: '5' },
  { id: 'requests', label: 'طلبات HMAC', icon: 'activity', group: 'المراقبة', badge: '24' },
  { id: 'security', label: 'النشاط الأمني', icon: 'shield', group: 'الإدارة' },
  { id: 'integration', label: 'تفاصيل التكامل', icon: 'link', group: 'الإدارة' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings', group: 'الإدارة' },
];

const app = document.querySelector('#app');
const statusLabel = { online: 'متصل', warning: 'يحتاج انتباهًا', offline: 'غير متصل' };
const requestLabel = { verified: 'تم التحقق', rejected: 'مرفوض', expired: 'منتهي' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function pill(status, text) {
  return `<span class="status-pill ${status}"><span class="status-dot"></span>${text}</span>`;
}

function sectionTitle(kicker, title, description, actions = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;
}

function button(label, cls = 'button secondary', action = '', iconName = '') {
  return `<button class="${cls}" data-action="${action}">${iconName ? icon(iconName, 16) : ''}<span>${label}</span></button>`;
}

function renderNav() {
  let current = '';
  return navItems.map((item, index) => {
    const group = item.group !== current ? `<div class="nav-group-label">${item.group}</div>` : '';
    current = item.group;
    return `${group}<button class="nav-item ${state.section === item.id ? 'active' : ''}" data-section="${item.id}" title="${item.label}">${icon(item.icon)}<span>${item.label}</span>${item.badge ? `<b>${item.badge}</b>` : ''}</button>`;
  }).join('');
}

function renderShell(content) {
  return `<div class="shell ${state.menuOpen ? 'menu-open' : ''}">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark"><i></i><i></i></div><div><strong>NEXORA COMMAND</strong><small>META-BOT NODE</small></div></div>
      <div class="workspace-card"><span class="workspace-dot"></span><div><small>مساحة العمل</small><strong>Operations / KSA</strong></div>${icon('more', 16)}</div>
      <nav class="main-nav">${renderNav()}</nav>
      <div class="sidebar-footer"><div class="uptime-line"><span class="status-dot"></span><span>الخدمة مستقرة</span><strong>99.98%</strong></div><div class="profile"><div class="avatar">م</div><div><strong>محمد العتيبي</strong><small>مدير النظام</small></div>${icon('more', 16)}</div></div>
    </aside>
    <div class="sidebar-backdrop" data-action="close-menu"></div>
    <main class="main-content">
      <header class="topbar"><button class="mobile-menu" data-action="toggle-menu">${icon('grid')}</button><div class="breadcrumb"><span>NEXORA</span><b>/</b><strong>${navItems.find((item) => item.id === state.section)?.label || 'لوحة التحكم'}</strong></div><div class="topbar-actions"><div class="last-sync">آخر مزامنة <strong>منذ 18 ثانية</strong></div><button class="icon-button notification" aria-label="الإشعارات" data-action="notify">${icon('bell')}<span></span></button><div class="top-avatar">م</div></div></header>
      <div class="content-wrap">${content}</div>
    </main>
    ${state.modal ? renderModal() : ''}
    ${state.toast ? `<div class="toast"><span class="toast-icon">${icon('check', 16)}</span>${escapeHtml(state.toast)}</div>` : ''}
  </div>`;
}

function renderDashboard() {
  const recent = requests.slice(0, 4);
  return `${sectionTitle('نظرة عامة / 09 أكتوبر 2026', 'كل شيء تحت المراقبة.', 'راقب صحة محطاتك، تحقق من التوقيعات، وتعامل مع التنبيهات قبل أن تتحول إلى مشكلة.', button('تحديث البيانات', 'button secondary', 'refresh', 'refresh'))}
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-top"><span>المحطات المتصلة</span><span class="stat-icon green">${icon('cpu', 18)}</span></div><div class="stat-value">24 <small>/ 26</small></div><div class="stat-foot positive">${icon('arrow', 13)} <span>+2.4%</span><em>منذ الأمس</em></div></div>
      <div class="stat-card"><div class="stat-top"><span>طلبات HMAC اليوم</span><span class="stat-icon blue">${icon('activity', 18)}</span></div><div class="stat-value">18,492</div><div class="stat-foot positive">${icon('arrow', 13)} <span>+8.1%</span><em>عن المتوسط</em></div></div>
      <div class="stat-card"><div class="stat-top"><span>نسبة التحقق</span><span class="stat-icon purple">${icon('shield', 18)}</span></div><div class="stat-value">99.72<small>%</small></div><div class="stat-foot positive">${icon('arrow', 13)} <span>+0.18%</span><em>آخر 24 ساعة</em></div></div>
      <div class="stat-card alert-card"><div class="stat-top"><span>تنبيهات تحتاج مراجعة</span><span class="stat-icon orange">${icon('alert', 18)}</span></div><div class="stat-value">03</div><div class="stat-foot negative">${icon('alert', 13)} <span>1 عالي الخطورة</span><em>تحتاج إجراءً</em></div></div>
    </div>
    <div class="dashboard-grid">
      <section class="panel traffic-panel"><div class="panel-head"><div><h2>نشاط الطلبات</h2><p>طلبات HMAC خلال آخر 24 ساعة</p></div><div class="segmented"><button class="active">24 ساعة</button><button>7 أيام</button><button>30 يومًا</button></div></div><div class="chart"><div class="chart-y"><span>2.5k</span><span>2k</span><span>1.5k</span><span>1k</span><span>0</span></div><div class="chart-area"><div class="grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="bars">${[42, 51, 47, 64, 58, 72, 66, 81, 74, 91, 84, 68, 76, 87, 79, 94, 83, 88].map((height, i) => `<div class="bar-wrap"><div class="bar ${i > 13 ? 'hot' : ''}" style="height:${height}%"><span>${Math.round(height * 27)}</span></div></div>`).join('')}</div><div class="chart-x"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>الآن</span></div></div></div><div class="chart-legend"><span><i class="legend-dot verified"></i>طلبات موثقة <strong>18,441</strong></span><span><i class="legend-dot rejected"></i>مرفوضة <strong>51</strong></span><span class="chart-summary">متوسط الاستجابة <strong>86ms</strong></span></div></section>
      <section class="panel health-panel"><div class="panel-head"><div><h2>صحة المنظومة</h2><p>التوزيع الحالي للمحطات</p></div><button class="icon-button" data-action="go-devices">${icon('arrow', 17)}</button></div><div class="health-ring"><div><strong>92%</strong><span>متاح</span></div></div><div class="health-legend"><div><span><i class="legend-dot verified"></i>متصلة</span><strong>24</strong></div><div><span><i class="legend-dot warning"></i>تحتاج انتباهًا</span><strong>1</strong></div><div><span><i class="legend-dot muted"></i>غير متصلة</span><strong>1</strong></div></div><div class="health-note"><span>${icon('activity', 16)}</span><p><strong>الأداء مستقر</strong><br>لا توجد حوادث واسعة النطاق.</p></div></section>
    </div>
    <div class="lower-grid"><section class="panel table-panel"><div class="panel-head"><div><h2>آخر طلبات HMAC</h2><p>طلبات وصلت إلى نقطة التكامل مؤخرًا</p></div>${button('عرض السجل', 'text-button', 'go-requests', 'arrow')}</div>${renderRequestsTable(recent, true)}</section><section class="panel activity-panel"><div class="panel-head"><div><h2>النشاط الأمني</h2><p>آخر الأحداث التي تستحق الانتباه</p></div>${button('كل الأحداث', 'text-button', 'go-security', 'arrow')}</div><div class="event-list">${securityEvents.slice(0, 3).map(renderEvent).join('')}</div></section></div>`;
}

function renderDevices() {
  const filtered = stations.filter((station) => (state.deviceFilter === 'all' || station.status === state.deviceFilter) && `${station.id} ${station.name} ${station.region}`.toLowerCase().includes(state.search.toLowerCase()));
  return `${sectionTitle('المراقبة / الأجهزة والمحطات', 'الأجهزة والمحطات', 'اعرف ما هو متصل، وما الذي يحتاج إلى تدخل قبل أن يؤثر على التشغيل.', `${button('إضافة محطة', 'button primary', 'add-device', 'plus')}`)}
    <div class="toolbar"><label class="search-field">${icon('search')}<input data-search="devices" value="${escapeHtml(state.search)}" placeholder="ابحث باسم المحطة أو المعرّف..." /></label><div class="filter-pills"><button class="${state.deviceFilter === 'all' ? 'active' : ''}" data-device-filter="all">الكل <b>26</b></button><button class="${state.deviceFilter === 'online' ? 'active' : ''}" data-device-filter="online">متصل <b>24</b></button><button class="${state.deviceFilter === 'warning' ? 'active' : ''}" data-device-filter="warning">تنبيه <b>1</b></button><button class="${state.deviceFilter === 'offline' ? 'active' : ''}" data-device-filter="offline">غير متصل <b>1</b></button></div></div>
    <section class="panel table-panel full-panel">${filtered.length ? `<div class="table-scroll"><table><thead><tr><th>المحطة</th><th>المعرّف</th><th>الحالة</th><th>آخر اتصال</th><th>الإصدار</th><th>المنطقة</th><th></th></tr></thead><tbody>${filtered.map((station) => `<tr><td><div class="entity-cell"><span class="device-glyph">${icon('cpu', 18)}</span><div><strong>${station.name}</strong><small>${station.type}</small></div></div></td><td><code>${station.id}</code></td><td>${pill(station.status, statusLabel[station.status])}</td><td><span class="muted-text">${station.last}</span><small class="sub-value">${station.ip}</small></td><td><code class="version">v${station.version}</code></td><td>${station.region}</td><td><button class="icon-button" data-device="${station.id}">${icon('more', 18)}</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state">${icon('search', 28)}<h3>لا توجد نتائج</h3><p>جرّب تغيير كلمة البحث أو الفلتر.</p></div>`}</section>`;
}

function renderRequests() {
  const filtered = requests.filter((request) => (state.requestFilter === 'all' || request.status === state.requestFilter) && `${request.path} ${request.device} ${request.hash}`.toLowerCase().includes(state.search.toLowerCase()));
  return `${sectionTitle('المراقبة / سجل التوقيعات', 'طلبات HMAC', 'تتبع كل طلب وارد وتأكد أن هوية المرسل وسلامة الرسالة لم تتغير.', `${button('تصدير CSV', 'button secondary', 'export', 'arrow')}`)}
    <div class="toolbar"><label class="search-field">${icon('search')}<input data-search="requests" value="${escapeHtml(state.search)}" placeholder="ابحث بالمسار أو الجهاز أو البصمة..." /></label><div class="filter-pills"><button class="${state.requestFilter === 'all' ? 'active' : ''}" data-request-filter="all">كل الطلبات</button><button class="${state.requestFilter === 'verified' ? 'active' : ''}" data-request-filter="verified">موثقة</button><button class="${state.requestFilter === 'rejected' ? 'active' : ''}" data-request-filter="rejected">مرفوضة</button><button class="${state.requestFilter === 'expired' ? 'active' : ''}" data-request-filter="expired">منتهية</button></div></div>
    <section class="panel table-panel full-panel">${renderRequestsTable(filtered, false)}</section>`;
}

function renderRequestsTable(items, compact) {
  return `<div class="table-scroll"><table><thead><tr><th>الوقت</th><th>الطلب</th><th>المحطة</th><th>حالة التوقيع</th><th>الاستجابة</th><th>البصمة</th><th></th></tr></thead><tbody>${items.map((request) => `<tr data-request="${request.hash}"><td><code class="time-code">${request.time}</code></td><td><div class="request-cell"><span class="method ${request.method.toLowerCase()}">${request.method}</span><code>${request.path}</code></div></td><td><strong>${request.device}</strong></td><td>${pill(request.status, requestLabel[request.status])}</td><td><span class="latency">${request.latency}</span></td><td><code>${request.hash}</code></td><td><button class="icon-button" data-request-detail="${request.hash}">${icon('eye', 17)}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function renderSecurity() {
  const filtered = securityEvents.filter((event) => state.securityFilter === 'all' || event.level === state.securityFilter);
  return `${sectionTitle('الإدارة / مركز الأمان', 'النشاط الأمني', 'علامات واضحة للأحداث الحساسة ومحاولات التحقق التي تحتاج إلى قرار.', `<div class="date-select"><span>${icon('activity', 15)}</span> آخر 24 ساعة ${icon('arrow', 14)}</div>`)}
    <div class="security-summary"><div class="security-score"><div class="score-ring"><strong>98.4</strong><span>/ 100</span></div><div><span class="eyebrow">درجة الحماية</span><h3>الوضع جيد</h3><p>تم تحليل 18,492 طلبًا دون حوادث حرجة.</p></div></div><div class="security-mini"><span class="mini-icon green">${icon('check', 16)}</span><div><strong>18,441</strong><small>توقيع صحيح</small></div></div><div class="security-mini"><span class="mini-icon red">${icon('alert', 16)}</span><div><strong>51</strong><small>محاولة مرفوضة</small></div></div></div>
    <div class="toolbar compact-toolbar"><div class="filter-pills"><button class="${state.securityFilter === 'all' ? 'active' : ''}" data-security-filter="all">كل المستويات</button><button class="${state.securityFilter === 'high' ? 'active' : ''}" data-security-filter="high">عالي</button><button class="${state.securityFilter === 'medium' ? 'active' : ''}" data-security-filter="medium">متوسط</button><button class="${state.securityFilter === 'low' ? 'active' : ''}" data-security-filter="low">منخفض</button></div></div>
    <section class="panel table-panel full-panel"><div class="event-list large-events">${filtered.map(renderEvent).join('')}</div></section>`;
}

function renderEvent(event) {
  return `<div class="event-row"><span class="event-icon ${event.level}">${event.level === 'low' ? icon('check', 17) : icon('alert', 17)}</span><div class="event-copy"><strong>${event.title}</strong><p>${event.detail}</p><code>${event.code}</code></div><div class="event-meta"><span class="severity ${event.level}">${event.level === 'high' ? 'عالي' : event.level === 'medium' ? 'متوسط' : 'منخفض'}</span><small>${event.time}</small></div><button class="icon-button" data-action="show-event" data-code="${event.code}">${icon('more', 17)}</button></div>`;
}

function renderIntegration() {
  return `${sectionTitle('الإدارة / تكامل API', 'تفاصيل التكامل', 'كل ما يحتاجه فريق الطرفية لإرسال طلب موثوق إلى مركز التحكم.', `${button('اختبار الاتصال', 'button primary', 'test-connection', 'activity')}`)}
    <div class="integration-grid"><section class="panel integration-main"><div class="panel-head"><div><h2>نقطة الاتصال</h2><p>استخدم العنوان التالي في بيئة الإنتاج.</p></div><span class="live-label"><i></i> إنتاج</span></div><div class="endpoint-box"><code>https://control.nexora.io/api/v1/terminal</code><button class="icon-button" data-copy="https://control.nexora.io/api/v1/terminal">${icon('copy', 17)}</button></div><h3 class="subheading">الترويسات المطلوبة</h3><div class="headers-list"><div><code>x-nexora-key</code><span>مفتاح المحطة الخاص بك</span></div><div><code>x-nexora-timestamp</code><span>وقت الطلب بصيغة Unix</span></div><div><code>x-nexora-signature</code><span>توقيع HMAC-SHA256</span></div></div><div class="callout"><span>${icon('shield', 18)}</span><p><strong>تحقق قبل الإرسال</strong><br>يجب أن يكون فرق الوقت بين الطابع الزمني ووقت الخادم أقل من 5 دقائق.</p></div></section><section class="panel code-panel"><div class="panel-head"><div><h2>مثال الطلب</h2><p>نمط جاهز للنسخ والتجربة</p></div><button class="icon-button" data-copy="curl --request POST https://control.nexora.io/api/v1/terminal/heartbeat">${icon('copy', 17)}</button></div><div class="code-window"><div class="code-top"><span><i></i><i></i><i></i></span><small>bash · heartbeat.sh</small></div><pre><span class="syntax-blue">curl</span> --request POST \\
  https://control.nexora.io/api/v1/terminal/heartbeat \\
  --header <span class="syntax-green">'x-nexora-key: key_live_••••91f4'</span> \\
  --header <span class="syntax-green">'x-nexora-timestamp: 1791504861'</span> \\
  --header <span class="syntax-green">'x-nexora-signature: sha256=…'</span> \\
  --data <span class="syntax-orange">'{"status":"online"}'</span></pre></div><div class="hmac-note"><span>${icon('key', 17)}</span><div><strong>صيغة التوقيع</strong><code>HMAC(secret, timestamp + '.' + rawBody)</code></div></div></section></div>`;
}

function renderSettings() {
  return `${sectionTitle('الإدارة / تفضيلات النظام', 'الإعدادات', 'تحكم في سلوك المحطات، سياسة الأمان، وطريقة عرض مركز التحكم.', `${button('حفظ التغييرات', 'button primary', 'save-settings', 'check')}`)}
    <div class="settings-grid"><section class="panel settings-panel"><div class="settings-title"><span class="settings-icon blue">${icon('cpu', 19)}</span><div><h2>إعدادات المحطة</h2><p>القيم الافتراضية لاتصال الأجهزة</p></div></div><div class="setting-row"><div><strong>مهلة نبض المحطة</strong><small>ضع المحطة كغير متصلة بعد هذه المدة</small></div><div class="inline-control"><input value="5" /><span>دقائق</span></div></div><div class="setting-row"><div><strong>الإصدار الإلزامي</strong><small>أرسل تنبيهًا عند استخدام إصدار قديم</small></div><select><option>2.8.1 أو أحدث</option><option>2.7.9 أو أحدث</option></select></div><div class="setting-row"><div><strong>السماح بوضع الصيانة</strong><small>السماح للمحطات المعتمدة بدخول وضع الصيانة</small></div><button class="switch on" data-toggle="maintenance"><i></i></button></div></section><section class="panel settings-panel"><div class="settings-title"><span class="settings-icon purple">${icon('shield', 19)}</span><div><h2>سياسة الأمان</h2><p>قواعد التحقق والتوقيع</p></div></div><div class="setting-row"><div><strong>نافذة صلاحية التوقيع</strong><small>الفترة المسموحة لانحراف الطابع الزمني</small></div><div class="inline-control"><input value="300" /><span>ثانية</span></div></div><div class="setting-row"><div><strong>حظر بعد المحاولات الفاشلة</strong><small>إيقاف المصدر مؤقتًا عند تكرار الفشل</small></div><div class="inline-control"><input value="5" /><span>محاولات</span></div></div><div class="setting-row"><div><strong>إشعارات الحوادث الحرجة</strong><small>إرسال تنبيه إلى مديري النظام فورًا</small></div><button class="switch on" data-toggle="alerts"><i></i></button></div></section></div>
    <section class="panel keys-panel"><div class="panel-head"><div><h2>مفاتيح التكامل</h2><p>المفاتيح المستخدمة لتوقيع طلبات المحطات. لا تشارك الأسرار.</p></div>${button('إنشاء مفتاح', 'button secondary', 'create-key', 'plus')}</div><div class="keys-list">${keys.map((key) => `<div class="key-row"><span class="key-symbol">${icon('key', 18)}</span><div class="key-details"><strong>${key.name}</strong><code>${key.id}</code></div><span class="key-date">أُنشئ في ${key.created}<small>آخر استخدام ${key.used}</small></span>${pill(key.status, key.status === 'active' ? 'فعال' : 'معطل')}<button class="icon-button" data-key="${key.name}">${icon('more', 18)}</button></div>`).join('')}</div></section>`;
}

function renderModal() {
  if (state.modal.type === 'device') {
    const device = stations.find((item) => item.id === state.modal.id) || stations[0];
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-content><div class="modal-head"><div><span class="eyebrow">تفاصيل المحطة</span><h2>${device.name}</h2></div><button class="icon-button" data-action="close-modal">${icon('close', 18)}</button></div><div class="modal-status">${pill(device.status, statusLabel[device.status])}<code>${device.id}</code></div><div class="detail-grid"><div><small>عنوان الشبكة</small><strong>${device.ip}</strong></div><div><small>الإصدار</small><strong>v${device.version}</strong></div><div><small>المنطقة</small><strong>${device.region}</strong></div><div><small>آخر اتصال</small><strong>${device.last}</strong></div></div><div class="modal-note"><span>${icon('activity', 17)}</span><p>تستجيب المحطة ضمن النطاق الطبيعي. متوسط نبض آخر ساعة <strong>84ms</strong>.</p></div><div class="modal-actions">${button('إغلاق', 'button secondary', 'close-modal')}${button('إرسال اختبار نبض', 'button primary', 'ping-device', 'activity')}</div></div></div>`;
  }
  if (state.modal.type === 'request') {
    const request = requests.find((item) => item.hash === state.modal.id) || requests[0];
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-content><div class="modal-head"><div><span class="eyebrow">تفاصيل الطلب</span><h2>${request.path}</h2></div><button class="icon-button" data-action="close-modal">${icon('close', 18)}</button></div><div class="modal-status">${pill(request.status, requestLabel[request.status])}<code>${request.device} · ${request.time}</code></div><div class="request-detail"><div><small>البصمة المستلمة</small><code>${request.hash}</code></div><div><small>الزمن</small><strong>${request.latency}</strong></div><div><small>الطريقة</small><span class="method ${request.method.toLowerCase()}">${request.method}</span></div></div><div class="code-window mini-code"><pre><span class="syntax-blue">x-nexora-timestamp:</span> 1791504861
<span class="syntax-blue">x-nexora-signature:</span> sha256=${request.hash}
<span class="syntax-blue">content-type:</span> application/json</pre></div><div class="modal-actions">${button('إغلاق', 'button secondary', 'close-modal')}${button('نسخ التفاصيل', 'button primary', 'copy-request', 'copy')}</div></div></div>`;
  }
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal small-modal" data-modal-content><div class="modal-head"><div><span class="eyebrow">مفتاح جديد</span><h2>إنشاء مفتاح تكامل</h2></div><button class="icon-button" data-action="close-modal">${icon('close', 18)}</button></div><label class="form-label">اسم المفتاح<input id="new-key-name" placeholder="مثال: production-terminal-2" /></label><div class="form-hint">سيظهر السر مرة واحدة فقط بعد الإنشاء.</div><div class="modal-actions">${button('إلغاء', 'button secondary', 'close-modal')}${button('إنشاء المفتاح', 'button primary', 'confirm-key', 'plus')}</div></div></div>`;
}

function showToast(message) {
  state.toast = message;
  render();
  setTimeout(() => { state.toast = null; render(); }, 2600);
}

function render() {
  let content = renderDashboard();
  if (state.section === 'devices') content = renderDevices();
  if (state.section === 'requests') content = renderRequests();
  if (state.section === 'security') content = renderSecurity();
  if (state.section === 'integration') content = renderIntegration();
  if (state.section === 'settings') content = renderSettings();
  app.innerHTML = renderShell(content);
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-section]').forEach((el) => el.addEventListener('click', () => { state.section = el.dataset.section; state.search = ''; state.menuOpen = false; render(); }));
  document.querySelectorAll('[data-search]').forEach((el) => el.addEventListener('input', (event) => { state.search = event.target.value; render(); const input = document.querySelector(`[data-search="${el.dataset.search}"]`); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } }));
  document.querySelectorAll('[data-device-filter]').forEach((el) => el.addEventListener('click', () => { state.deviceFilter = el.dataset.deviceFilter; render(); }));
  document.querySelectorAll('[data-request-filter]').forEach((el) => el.addEventListener('click', () => { state.requestFilter = el.dataset.requestFilter; render(); }));
  document.querySelectorAll('[data-security-filter]').forEach((el) => el.addEventListener('click', () => { state.securityFilter = el.dataset.securityFilter; render(); }));
  document.querySelectorAll('[data-device]').forEach((el) => el.addEventListener('click', () => { state.modal = { type: 'device', id: el.dataset.device }; render(); }));
  document.querySelectorAll('[data-request-detail]').forEach((el) => el.addEventListener('click', () => { state.modal = { type: 'request', id: el.dataset.requestDetail }; render(); }));
  document.querySelectorAll('[data-copy]').forEach((el) => el.addEventListener('click', async () => { await navigator.clipboard?.writeText(el.dataset.copy); showToast('تم نسخ القيمة إلى الحافظة'); }));
  document.querySelectorAll('[data-action]').forEach((el) => el.addEventListener('click', () => handleAction(el.dataset.action, el)));
  document.querySelectorAll('[data-toggle]').forEach((el) => el.addEventListener('click', () => el.classList.toggle('on')));
  document.querySelectorAll('[data-modal-content]').forEach((el) => el.addEventListener('click', (event) => event.stopPropagation()));
}

function handleAction(action, element) {
  if (action === 'toggle-menu') { state.menuOpen = !state.menuOpen; render(); }
  if (action === 'close-menu') { state.menuOpen = false; render(); }
  if (action === 'close-modal') { state.modal = null; render(); }
  if (action === 'go-devices') { state.section = 'devices'; render(); }
  if (action === 'go-requests') { state.section = 'requests'; render(); }
  if (action === 'go-security') { state.section = 'security'; render(); }
  if (action === 'refresh') showToast('تم تحديث بيانات المراقبة');
  if (action === 'notify') showToast('لديك تنبيه أمني واحد عالي الخطورة');
  if (action === 'export') showToast('تم تجهيز سجل الطلبات للتصدير');
  if (action === 'test-connection') showToast('الاتصال ناجح — زمن الاستجابة 86ms');
  if (action === 'save-settings') { localStorage.setItem('nexora-settings-saved', '1'); showToast('تم حفظ الإعدادات محليًا'); }
  if (action === 'add-device') showToast('سيتم فتح معالج إضافة محطة في النسخة المتصلة');
  if (action === 'ping-device') { state.modal = null; showToast('تم إرسال اختبار نبض إلى المحطة'); }
  if (action === 'create-key') { state.modal = { type: 'key' }; render(); }
  if (action === 'confirm-key') { const name = document.querySelector('#new-key-name')?.value.trim(); state.modal = null; showToast(name ? `تم إنشاء المفتاح ${name}` : 'أدخل اسم المفتاح أولًا'); }
  if (action === 'copy-request') showToast('تم نسخ تفاصيل الطلب');
  if (action === 'show-event') showToast(`تم فتح الحدث ${element.dataset.code}`);
}
render();
loadLiveData();
