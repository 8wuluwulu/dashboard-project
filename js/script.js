/* ============================================================
   FinDash — script.js
   SPA Router (Hash based) + Chart.js + Dropdowns + UI Interactions
   ============================================================ */

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

document.addEventListener('DOMContentLoaded', () => {
    initSPARouter();
    initSidebar();
    initDropdowns();
    initHeaderScroll();
});

/* ============================================================
   SPA ROUTER (Hash Routing)
   ============================================================ */

const PAGE_TITLES = {
    overview: 'Аналитика платформы',
    analytics: 'Сравнение трафика',
    transactions: 'Все транзакции платформы',
    wallets: 'Мои финансовые счета',
    settings: 'Настройки профиля',
};

function handleRoute() {
    let hash = window.location.hash.replace('#', '');

    // Silent Default Route: internally treat empty hash as 'overview'
    // DO NOT push history or replace state!
    if (!hash || !PAGE_TITLES[hash]) {
        hash = 'overview';
    }

    navigateTo(hash);
}

function initSPARouter() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link) {
            // Apply standard href attributes so native anchor clicks fire hashchange
            link.setAttribute('href', '#' + item.dataset.page);
            link.addEventListener('click', () => closeMobileSidebar());
        }
    });
}

function navigateTo(page) {
    // Update active nav link
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page title
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = PAGE_TITLES[page] || 'FinDash';

    // Render page content
    const container = document.getElementById('pageContent');
    if (!container) return;

    // Destroy existing Chart.js instances to prevent memory leaks
    destroyAllCharts();

    container.innerHTML = '';
    container.classList.remove('page-animate');

    switch (page) {
        case 'overview': container.innerHTML = renderOverview(); break;
        case 'analytics': container.innerHTML = renderAnalytics(); break;
        case 'transactions': container.innerHTML = renderTransactions(); break;
        case 'wallets': container.innerHTML = renderWallets(); break;
        case 'settings': container.innerHTML = renderSettings(); break;
    }

    // Trigger transitions
    void container.offsetWidth; // reflow
    container.classList.add('page-animate');

    // Initialize scripts based on current page
    requestAnimationFrame(() => {
        if (page === 'overview') {
            initRevenueChart();
            initTrafficChart();

            // Wire up "Смотреть все" button to use hash routing
            const viewAllBtn = container.querySelector('.table-view-all-btn');
            if (viewAllBtn) {
                viewAllBtn.addEventListener('click', () => {
                    window.location.hash = 'transactions';
                });
            }
        }
        if (page === 'analytics') {
            initTrafficBarChart();
        }
        if (page === 'settings') {
            initSettingsInteractions();
        }
    });
}

/* ── Chart instance tracking ── */
let chartInstances = [];

function trackChart(chart) {
    chartInstances.push(chart);
}

function destroyAllCharts() {
    chartInstances.forEach(c => {
        try { c.destroy(); } catch (_) { /* noop */ }
    });
    chartInstances = [];
}

/* ============================================================
   PAGE TEMPLATES
   ============================================================ */

/* ── Overview ── */
function renderOverview() {
    return `
        <section class="stats-grid" aria-label="Статистика">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Общая выручка</span>
                    <span class="stat-icon icon-revenue"><i class="ph ph-currency-dollar"></i></span>
                </div>
                <div class="stat-body">
                    <span class="stat-value">$124,500.00</span>
                </div>
                <div class="stat-footer">
                    <span class="stat-badge badge-success"><i class="ph ph-trend-up"></i> +12.5%</span>
                    <span class="stat-period">за месяц</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Активные пользователи</span>
                    <span class="stat-icon icon-users"><i class="ph ph-users"></i></span>
                </div>
                <div class="stat-body">
                    <span class="stat-value">8,240</span>
                </div>
                <div class="stat-footer">
                    <span class="stat-badge badge-success"><i class="ph ph-trend-up"></i> +3.1%</span>
                    <span class="stat-period">за месяц</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Новые регистрации</span>
                    <span class="stat-icon icon-registrations"><i class="ph ph-user-plus"></i></span>
                </div>
                <div class="stat-body">
                    <span class="stat-value">342</span>
                </div>
                <div class="stat-footer">
                    <span class="stat-badge badge-danger"><i class="ph ph-trend-down"></i> -1.2%</span>
                    <span class="stat-period">за месяц</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Конверсия</span>
                    <span class="stat-icon icon-conversion"><i class="ph ph-percent"></i></span>
                </div>
                <div class="stat-body">
                    <span class="stat-value">4.6%</span>
                </div>
                <div class="stat-footer">
                    <span class="stat-badge badge-success"><i class="ph ph-trend-up"></i> +0.4%</span>
                    <span class="stat-period">за месяц</span>
                </div>
            </div>
        </section>

        <section class="charts-grid" aria-label="Графики">
            <div class="chart-card chart-card-large">
                <div class="chart-header">
                    <h2 class="chart-title">Выручка за полугодие</h2>
                    <div class="chart-actions">
                        <button class="chart-action-btn active">6 мес</button>
                        <button class="chart-action-btn">1 год</button>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
            <div class="chart-card chart-card-small">
                <div class="chart-header">
                    <h2 class="chart-title">Источники трафика</h2>
                </div>
                <div class="chart-body chart-body-doughnut">
                    <canvas id="trafficChart"></canvas>
                </div>
                <div class="doughnut-legend" id="doughnutLegend"></div>
            </div>
        </section>

        <section class="table-section" aria-label="Последние транзакции">
            <div class="table-header">
                <h2 class="table-title">Последние транзакции</h2>
                <button class="table-view-all-btn">Смотреть все <i class="ph ph-arrow-right"></i></button>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr></thead>
                    <tbody>
                        ${buildTransactionRows(TRANSACTIONS_SHORT)}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

/* ── Analytics (Stacked Bar Chart) ── */
function renderAnalytics() {
    return `
        <div class="analytics-chart-container">
            <div class="chart-header">
                <h2 class="chart-title">Сравнение трафика за квартал</h2>
                <div class="chart-actions">
                    <button class="chart-action-btn active">Квартал</button>
                </div>
            </div>
            <div class="analytics-chart-body">
                <canvas id="trafficBarChart"></canvas>
            </div>
        </div>
    `;
}

/* ── Transactions (Full Table) ── */
function renderTransactions() {
    return `
        <section class="table-section">
            <div class="table-header">
                <h2 class="table-title">Все транзакции платформы</h2>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr></thead>
                    <tbody>
                        ${buildTransactionRows(TRANSACTIONS_FULL)}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

/* ── Wallets ── */
function renderWallets() {
    return `
        <div class="wallets-grid">
            <div class="wallet-card">
                <div class="wallet-card-header">
                    <div class="wallet-icon wallet-icon-primary"><i class="ph ph-credit-card"></i></div>
                    <span class="wallet-badge">Активен</span>
                </div>
                <div class="wallet-card-body">
                    <div class="wallet-label">Основной кошелек</div>
                    <div class="wallet-balance">$48,230.00</div>
                    <div class="wallet-currency">USD — Долл. США</div>
                </div>
                <div class="wallet-card-footer">
                    <button class="wallet-btn wallet-btn-primary"><i class="ph ph-paper-plane-tilt"></i> Перевести</button>
                    <button class="wallet-btn wallet-btn-outline"><i class="ph ph-download-simple"></i> Пополнить</button>
                </div>
            </div>
            <div class="wallet-card">
                <div class="wallet-card-header">
                    <div class="wallet-icon wallet-icon-success"><i class="ph ph-piggy-bank"></i></div>
                    <span class="wallet-badge">Активен</span>
                </div>
                <div class="wallet-card-body">
                    <div class="wallet-label">Сбережения</div>
                    <div class="wallet-balance">€12,750.00</div>
                    <div class="wallet-currency">EUR — Евро</div>
                </div>
                <div class="wallet-card-footer">
                    <button class="wallet-btn wallet-btn-primary"><i class="ph ph-paper-plane-tilt"></i> Перевести</button>
                    <button class="wallet-btn wallet-btn-outline"><i class="ph ph-download-simple"></i> Пополнить</button>
                </div>
            </div>
            <div class="wallet-card">
                <div class="wallet-card-header">
                    <div class="wallet-icon wallet-icon-warning"><i class="ph ph-bitcoin-logo"></i></div>
                    <span class="wallet-badge">Активен</span>
                </div>
                <div class="wallet-card-body">
                    <div class="wallet-label">Криптопортфель</div>
                    <div class="wallet-balance">₿ 1.4820</div>
                    <div class="wallet-currency">BTC — Биткойн</div>
                </div>
                <div class="wallet-card-footer">
                    <button class="wallet-btn wallet-btn-primary"><i class="ph ph-paper-plane-tilt"></i> Перевести</button>
                    <button class="wallet-btn wallet-btn-outline"><i class="ph ph-download-simple"></i> Пополнить</button>
                </div>
            </div>
        </div>
    `;
}

/* ── Settings ── */
function renderSettings() {
    return `
        <div class="settings-container">
            <div class="settings-section">
                <div class="settings-section-title">Основные данные</div>
                <div class="form-group">
                    <label class="form-label" for="settingsName">Имя пользователя</label>
                    <input type="text" class="form-input" id="settingsName" value="Алексей С." placeholder="Введите имя">
                </div>
                <div class="form-group">
                    <label class="form-label" for="settingsEmail">Email</label>
                    <input type="email" class="form-input" id="settingsEmail" value="alexey@findash.io" placeholder="Введите email">
                </div>
            </div>
            <div class="settings-section">
                <div class="settings-section-title">Параметры интерфейса</div>
                <div class="form-group">
                    <label class="form-label" for="settingsTheme">Тема</label>
                    <select class="form-select" id="settingsTheme">
                        <option value="dark" selected>Тёмная</option>
                        <option value="light">Светлая</option>
                    </select>
                </div>
                <div class="form-group">
                    <div class="toggle-row">
                        <span class="toggle-label-text">Уведомления</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="settingsNotifications" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            <button class="settings-save-btn" id="settingsSaveBtn"><i class="ph ph-floppy-disk"></i> Сохранить</button>
        </div>
    `;
}

/* ============================================================
   TRANSACTION DATA
   ============================================================ */

const TRANSACTIONS_SHORT = [
    { id: '#TR-1001', client: 'ООО «ТехПром»', icon: 'ph-fill ph-buildings', date: '24 Окт 2023', amount: '$4,500', status: 'success', statusText: 'Успешно' },
    { id: '#TR-1002', client: 'ИП Смирнов А.', icon: 'ph-fill ph-user', date: '23 Окт 2023', amount: '$1,250', status: 'success', statusText: 'Успешно' },
    { id: '#TR-1003', client: 'Global Solutions', icon: 'ph-fill ph-globe', date: '23 Окт 2023', amount: '$8,900', status: 'warning', statusText: 'В обработке' },
    { id: '#TR-1004', client: 'WebStudio PRO', icon: 'ph-fill ph-code', date: '21 Окт 2023', amount: '$340', status: 'danger', statusText: 'Отклонено' },
];

const TRANSACTIONS_FULL = [
    ...TRANSACTIONS_SHORT,
    { id: '#TR-1005', client: 'Дизайн Лаб', icon: 'ph-fill ph-palette', date: '20 Окт 2023', amount: '$2,100', status: 'success', statusText: 'Успешно' },
    { id: '#TR-1006', client: 'ООО «МедиаГрупп»', icon: 'ph-fill ph-television', date: '19 Окт 2023', amount: '$6,340', status: 'success', statusText: 'Успешно' },
    { id: '#TR-1007', client: 'DataStream Inc.', icon: 'ph-fill ph-database', date: '18 Окт 2023', amount: '$11,200', status: 'warning', statusText: 'В обработке' },
    { id: '#TR-1008', client: 'ИП Козлов Д.', icon: 'ph-fill ph-user', date: '17 Окт 2023', amount: '$780', status: 'success', statusText: 'Успешно' },
    { id: '#TR-1009', client: 'АО «ФинИнвест»', icon: 'ph-fill ph-bank', date: '16 Окт 2023', amount: '$15,900', status: 'danger', statusText: 'Отклонено' },
    { id: '#TR-1010', client: 'NetCode Studio', icon: 'ph-fill ph-code', date: '15 Окт 2023', amount: '$3,450', status: 'success', statusText: 'Успешно' },
];

function buildTransactionRows(data) {
    return data.map(t => `
        <tr>
            <td class="cell-id">${t.id}</td>
            <td class="cell-client">
                <div class="client-info">
                    <span class="client-avatar"><i class="${t.icon}"></i></span>
                    <span>${t.client}</span>
                </div>
            </td>
            <td class="cell-date">${t.date}</td>
            <td class="cell-amount">${t.amount}</td>
            <td class="cell-status"><span class="status-badge status-${t.status}">${t.statusText}</span></td>
        </tr>
    `).join('');
}

/* ============================================================
   CHART.JS — Revenue Line Chart
   ============================================================ */
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.08)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            datasets: [{
                label: 'Выручка ($)',
                data: [12000, 19000, 15000, 22000, 18000, 25000],
                borderColor: '#4f46e5',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#4f46e5',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1d24',
                    titleColor: '#f3f4f6',
                    bodyColor: '#9ca3af',
                    borderColor: '#2a2e39',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => 'Выручка: $' + ctx.parsed.y.toLocaleString()
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280', font: { family: "'Inter', sans-serif", size: 12 } },
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: '#6b7280',
                        font: { family: "'Inter', sans-serif", size: 12 },
                        callback: (v) => '$' + (v / 1000) + 'k'
                    },
                    border: { display: false }
                }
            }
        }
    });
    trackChart(chart);
}

/* ============================================================
   CHART.JS — Traffic Doughnut Chart
   ============================================================ */
function initTrafficChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;

    const labels = ['Органика', 'Реклама', 'Прямые', 'Рефералы'];
    const dataValues = [45, 25, 20, 10];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6'];

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataValues,
                backgroundColor: colors,
                borderColor: 'transparent',
                borderWidth: 0,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1d24',
                    titleColor: '#f3f4f6',
                    bodyColor: '#9ca3af',
                    borderColor: '#2a2e39',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => ctx.label + ': ' + ctx.parsed + '%'
                    }
                }
            }
        }
    });
    trackChart(chart);

    // Custom legend
    const container = document.getElementById('doughnutLegend');
    if (container) {
        container.innerHTML = labels.map((l, i) => `
            <div class="legend-item">
                <span class="legend-dot" style="background:${colors[i]}"></span>
                <span>${l} — ${dataValues[i]}%</span>
            </div>
        `).join('');
    }
}

/* ============================================================
   CHART.JS — Analytics Stacked Bar Chart
   ============================================================ */
function initTrafficBarChart() {
    const ctx = document.getElementById('trafficBarChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Янв', 'Фев', 'Мар'],
            datasets: [
                {
                    label: 'Органика',
                    data: [4200, 5100, 4800],
                    backgroundColor: '#4f46e5',
                    borderRadius: 4,
                    borderSkipped: false,
                },
                {
                    label: 'Реклама',
                    data: [2800, 3200, 2600],
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    borderSkipped: false,
                },
                {
                    label: 'Прямые',
                    data: [1500, 1800, 2100],
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#9ca3af',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1d24',
                    titleColor: '#f3f4f6',
                    bodyColor: '#9ca3af',
                    borderColor: '#2a2e39',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: '#6b7280', font: { family: "'Inter', sans-serif", size: 13 } },
                    border: { display: false }
                },
                y: {
                    stacked: true,
                    grid: { color: 'rgba(42,46,57,0.5)', drawTicks: false },
                    ticks: {
                        color: '#6b7280',
                        font: { family: "'Inter', sans-serif", size: 12 },
                        padding: 8,
                    },
                    border: { display: false }
                }
            }
        }
    });
    trackChart(chart);
}

/* ============================================================
   SETTINGS INTERACTIONS
   ============================================================ */
function initSettingsInteractions() {
    const saveBtn = document.getElementById('settingsSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.innerHTML = '<i class="ph ph-check-circle"></i> Сохранено!';
            saveBtn.style.background = '#10b981';
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Сохранить';
                saveBtn.style.background = '';
            }, 1800);
        });
    }
}

/* ============================================================
   DROPDOWNS — Notification & Profile
   ============================================================ */
function initDropdowns() {
    // Notification dropdown
    const notifBtn = document.getElementById('notificationBtn');
    const notifDrop = document.getElementById('notificationDropdown');
    if (notifBtn && notifDrop) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(notifDrop);
            notifDrop.classList.toggle('open');
        });
    }

    // Profile dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const profileDrop = document.getElementById('profileDropdown');
    if (userMenuBtn && profileDrop) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(profileDrop);
            profileDrop.classList.toggle('open');
        });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    // Prevent closing when clicking inside a dropdown
    document.querySelectorAll('.dropdown-menu').forEach(d => {
        d.addEventListener('click', (e) => e.stopPropagation());
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });
}

function closeAllDropdowns(except) {
    document.querySelectorAll('.dropdown-menu.open').forEach(d => {
        if (d !== except) d.classList.remove('open');
    });
}

/* ============================================================
   SIDEBAR TOGGLE (Mobile)
   ============================================================ */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (!sidebar || !overlay) return;

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
    overlay.addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeMobileSidebar();
        }
    });
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ============================================================
   HEADER SCROLL EFFECT
   ============================================================ */
function initHeaderScroll() {
    const header = document.querySelector('.top-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    });
}
