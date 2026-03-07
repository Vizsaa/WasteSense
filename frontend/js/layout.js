/**
 * layout.js
 * Dynamically injects the shared sidebar and top navbar into authenticated pages.
 * Handles responsive behavior (sidebar collapse, mobile bottom nav).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine user role to render proper navigation items
    const checkRoleAndRender = async () => {
        if (typeof checkAuthStatus !== 'function') return;
        const user = await checkAuthStatus();
        if (!user) return; // auth.js handles 401 redirect
        renderLayout(user);
    };
    checkRoleAndRender();
});

function renderLayout(user) {
    const role = user.role;
    const body = document.body;

    // Create the global layout structure wrapper
    const layoutWrapper = document.createElement('div');
    layoutWrapper.id = 'app-layout';

    // Extract current body content
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'main-content';

    // Move all existing children into mainContent (except script tags that belong at end)
    while (body.firstChild) {
        if (body.firstChild.tagName === 'SCRIPT' && body.firstChild.src) {
            // Leave scripts alone or move them later
            break;
        }
        mainContent.appendChild(body.firstChild);
    }

    // Create Sidebar
    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <img src="../assets/banner.png" alt="WasteSense" class="brand-banner" style="height:48px; object-fit:contain; margin-top:20px;">
        </div>
        <nav class="sidebar-nav">
            ${getNavItems(role, false)}
        </nav>
        <div class="sidebar-footer">
            <div class="user-card d-flex align-items-center gap-3" style="padding:12px; background:rgba(255,255,255,0.05); border-radius:var(--radius-md); color:#fff;">
                <div class="avatar gradient-brand" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff;">
                    ${getInitials(user.full_name || 'U')}
                </div>
                <div class="user-info" style="flex:1; overflow:hidden;">
                    <div class="user-name" style="font-weight:600; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${user.full_name}</div>
                    <div class="badge badge-role-${role}" style="font-size:10px; margin-top:4px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff;">${capitalize(role)}</div>
                </div>
                <button onclick="logout()" style="background:transparent; color:#fff; border:none; cursor:pointer; font-size:18px; opacity:0.7;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'" title="Logout">🚪</button>
            </div>
        </div>
    `;

    // Create Top Navbar
    const topnav = document.createElement('header');
    topnav.id = 'top-navbar';
    topnav.className = 'top-navbar d-flex align-items-center justify-content-between';
    topnav.innerHTML = `
        <div class="page-title-area d-flex align-items-center gap-3">
            <button class="mobile-menu-btn btn-ghost" style="display:none; font-size:24px; border:none; cursor:pointer;">☰</button>
            <h1 class="page-title gradient-text mb-0" style="font-size:1.5rem;">${getPageTitle()}</h1>
        </div>
        <div class="nav-actions d-flex align-items-center gap-4">
            <div class="notification-bell" style="position:relative; cursor:pointer;" onclick="toggleNotifications()">
                <div style="font-size:24px;">🔔</div>
                <div id="bell-badge" class="badge-count" style="display:none; position:absolute; top:-4px; right:-4px; background:var(--brand-lime); color:var(--bg-base); border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center;">0</div>
            </div>
            <div class="avatar-dropdown" style="cursor:pointer;" onclick="window.location.href='profile.html'">
                 <div class="avatar gradient-brand" style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">
                    ${getInitials(user.full_name || 'U')}
                </div>
            </div>
        </div>
    `;

    // Create Mobile Bottom Nav
    const bottomNav = document.createElement('nav');
    bottomNav.id = 'bottom-nav';
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = getNavItems(role, true);

    // Assemble Layout
    layoutWrapper.appendChild(sidebar);

    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'content-wrapper';
    contentWrapper.appendChild(topnav);
    contentWrapper.appendChild(mainContent);

    layoutWrapper.appendChild(contentWrapper);
    layoutWrapper.appendChild(bottomNav);

    // Inject scripts back into body
    body.insertBefore(layoutWrapper, body.firstChild);

    setupNotificationsDropdown();
    initLayoutStyles();
}

function getInitials(name) {
    if (!name) return 'WS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPageTitle() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('submit-waste')) return 'Submit Waste';
    if (path.includes('submissions')) return 'Submissions';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('feedback')) return 'Feedback';
    if (path.includes('users')) return 'Users';
    if (path.includes('schedules')) return 'Schedules';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('categories')) return 'Categories';
    if (path.includes('locations')) return 'Locations';
    if (path.includes('performance')) return 'Performance';
    if (path.includes('profile')) return 'Profile';
    return document.title.split('-')[0].trim() || 'WasteSense';
}

function getNavItems(role, isMobile) {
    const path = window.location.pathname;
    const isCurrent = (href) => path.includes(href) ? 'active' : '';

    let items = [];

    if (role === 'resident') {
        items = [
            { label: 'Dashboard', icon: '🏠', href: 'dashboard-resident.html' },
            { label: 'Submit', icon: '♻️', href: 'submit-waste.html', mobileOnly: true }, // For bottom nav
            { label: 'Submissions', icon: '📦', href: 'my-submissions.html' },
            { label: 'Feedback', icon: '💬', href: 'resident-feedback.html' }
        ];
    } else if (role === 'collector') {
        items = [
            { label: 'Dashboard', icon: '🚛', href: 'dashboard-collector.html' },
            { label: 'Map View', icon: '🗺️', href: 'collector-submissions.html' },
            { label: 'History', icon: '🕒', href: 'collector-history.html' },
            { label: 'Profile', icon: '👤', href: 'profile.html' }
        ];
    } else if (role === 'admin') {
        items = [
            { label: 'Overview', icon: '👑', href: 'dashboard-admin.html' },
            { label: 'Users', icon: '👥', href: 'admin-users.html' },
            { label: 'Submissions', icon: '📂', href: 'admin-submissions.html' },
            { label: 'Schedules', icon: '📅', href: 'admin-schedules.html' },
            { label: 'Analytics', icon: '📊', href: 'admin-analytics.html' },
            { label: 'Locations', icon: '📍', href: 'admin-locations.html' },
            { label: 'Categories', icon: '🗂️', href: 'admin-categories.html' },
            { label: 'Feedback', icon: '💬', href: 'admin-feedback.html' }
        ];
    }

    if (isMobile) {
        // Render for bottom nav
        return items.filter(item => !item.desktopOnly).slice(0, 5).map(item => `
            <a href="${item.href}" class="bottom-nav-item ${isCurrent(item.href)}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            </a>
        `).join('');
    }

    // Render for sidebar
    return items.filter(item => !item.mobileOnly).map(item => `
        <a href="${item.href}" class="sidebar-item ${isCurrent(item.href) ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
        </a>
    `).join('');
}

function setupNotificationsDropdown() {
    const wrapper = document.getElementById('content-wrapper');
    const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'nm-raised';
    panel.style.cssText = 'display:none; position:absolute; top:70px; right:40px; width:360px; z-index:100; padding:16px; border:1px solid rgba(110,224,0,0.1);';
    panel.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 style="margin:0;">Notifications</h3>
            <a href="notifications.html" style="font-size:12px;">View all</a>
        </div>
        <div id="nav-dropdown-list" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
            <div class="text-center text-muted" style="font-size:13px; padding:20px 0;">Loading...</div>
        </div>
    `;
    wrapper.appendChild(panel);
}

window.toggleNotifications = async function () {
    const panel = document.getElementById('notifications-panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        // Fetch notifications
        try {
            const data = await apiFetch('/api/notifications');
            const list = document.getElementById('nav-dropdown-list');
            if (data.data && data.data.length > 0) {
                list.innerHTML = data.data.slice(0, 5).map(n => `
                    <div class="${n.is_read ? 'nm-flat' : 'nm-raised'}" style="padding:12px; border-radius:8px; ${!n.is_read ? 'border-left:3px solid var(--brand-lime);' : ''}">
                        <div style="font-size:13px; margin-bottom:4px;">${n.message}</div>
                        <div class="text-muted" style="font-size:11px;">${new Date(n.created_at).toLocaleString()}</div>
                    </div>
                `).join('');

                // Update badge
                const unread = data.data.filter(n => !n.is_read).length;
                const badge = document.getElementById('bell-badge');
                if (unread > 0) {
                    badge.textContent = unread;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            } else {
                list.innerHTML = `<div class="text-center text-muted" style="font-size:13px; padding:20px 0;">No new notifications.</div>`;
            }
        } catch (e) { /* silent fail for dropdown fetch */ }
    } else {
        panel.style.display = 'none';
    }
}

// Global layout styles dynamically injected since they are highly structural to this layout
function initLayoutStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        #app-layout {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }
        
        .sidebar {
            width: 260px;
            background: var(--bg-dark); /* Dark green anchor */
            border-right: 1px solid rgba(110,224,0,0.15);
            display: flex;
            flex-direction: column;
            transition: width 0.3s ease;
            position: relative;
            z-index: 50;
        }
        
        .sidebar-header {
            height: 80px;
            padding: 0 var(--space-4);
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #6EE000, #2E7D32);
        }
        
        .sidebar-nav {
            flex: 1;
            padding: var(--space-4);
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
        }
        
        .sidebar-item {
            height: 48px;
            display: flex;
            align-items: center;
            padding: 0 var(--space-4);
            border-radius: var(--radius-md);
            color: rgba(255,255,255,0.65);
            text-decoration: none;
            transition: all 0.2s ease;
            gap: 12px;
            font-weight: 600;
        }
        
        .sidebar-item .nav-label {
            color: rgba(255,255,255,0.75);
        }
        
        .sidebar-item.active {
            background: rgba(110, 224, 0, 0.15);
            color: #6EE000;
            border-left: 3px solid #6EE000;
        }
        
        .sidebar-item:hover:not(.active) {
            background: rgba(255,255,255,0.08);
            color: #FFFFFF;
            transform: translateY(-1px);
        }
        
        .sidebar-footer {
            padding: var(--space-4);
            border-top: 1px solid rgba(110,224,0,0.1);
        }
        
        #content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        
        .top-navbar {
            height: 64px;
            background: var(--bg-surface);
            border-bottom: 1px solid rgba(110,224,0,0.08);
            padding: 0 var(--space-6);
            z-index: 40;
        }
        
        #main-content {
            flex: 1;
            overflow-y: auto;
        }
        
        .bottom-nav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: var(--bg-surface);
            border-top: 1px solid rgba(110,224,0,0.1);
            z-index: 100;
        }
        
        .bottom-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            text-decoration: none;
            gap: 4px;
        }
        
        .bottom-nav-item .nav-label {
            font-size: 10px;
            font-weight: 600;
        }
        
        .bottom-nav-item.active {
            color: var(--brand-lime);
        }

        /* Wizard Mode override for Submit Waste Page */
        body.wizard-mode .sidebar {
            display: none !important;
        }
        body.wizard-mode .bottom-nav {
            display: none !important;
        }

        @media (max-width: 1024px) {
            .sidebar { width: 80px; }
            .sidebar .nav-label, .sidebar .brand-banner, .sidebar .user-info { display: none; }
            .sidebar-item { justify-content: center; padding: 0; }
        }
        
        @media (max-width: 640px) {
            .sidebar { display: none; }
            .bottom-nav { display: flex; }
            #main-content { padding-bottom: 80px; } /* Space for bottom nav */
            .top-navbar { padding: 0 var(--space-4); }
        }
    `;
    document.head.appendChild(style);
}
