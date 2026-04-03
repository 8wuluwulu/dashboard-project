/* ============================================================
   FinDash — script.js
   Chart.js initialization + Sidebar toggle + UI interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initSidebar();
    initHeaderScroll();
});

/* ── Chart Initialization ── */
function initCharts() {
    initRevenueChart();
    initTrafficChart();
}

/* Revenue Line Chart */
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.08)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    new Chart(ctx, {
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
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
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
                        label: function(context) {
                            return 'Выручка: $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                        }
                    },
                    border: {
                        display: false,
                    }
                },
                y: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                        },
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    },
                    border: {
                        display: false,
                    }
                }
            }
        }
    });
}

/* Traffic Doughnut Chart */
function initTrafficChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;

    const labels = ['Органика', 'Реклама', 'Прямые', 'Рефералы'];
    const dataValues = [45, 25, 20, 10];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
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
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: '#1a1d24',
                    titleColor: '#f3f4f6',
                    bodyColor: '#9ca3af',
                    borderColor: '#2a2e39',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });

    // Build custom legend
    buildDoughnutLegend(labels, colors, dataValues);
}

function buildDoughnutLegend(labels, colors, data) {
    const container = document.getElementById('doughnutLegend');
    if (!container) return;

    container.innerHTML = labels.map((label, i) => `
        <div class="legend-item">
            <span class="legend-dot" style="background: ${colors[i]}"></span>
            <span>${label} — ${data[i]}%</span>
        </div>
    `).join('');
}

/* ── Sidebar Toggle (Mobile) ── */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (!sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

/* ── Header scroll effect ── */
function initHeaderScroll() {
    const header = document.querySelector('.top-header');
    if (!header) return;

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', mainContent.scrollTop > 10);
    });

    // Also listen on window scroll for non-scrollable main
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    });
}
