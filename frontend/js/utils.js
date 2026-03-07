/**
 * utils.js
 * Global utility functions for UI behaviors, Toast notifications, and skeletons.
 */

/**
 * Display a Toast Notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Manage max stack of 3 toasts
    if (container.children.length >= 3) {
        container.removeChild(container.firstChild);
    }

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-fade');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 500); // Wait for transition
        }
    }, 3000);
}

/**
 * Generate a dynamic time-aware greeting
 * @param {string} name - User's name
 * @returns {string} - Greeting string
 */
function getGreeting(name) {
    const hr = new Date().getHours();
    let timeGreeting = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
    return `Good ${timeGreeting}, ${name} 👋`;
}

/**
 * Add skeleton loaders to a container
 * @param {HTMLElement} container - The container element
 * @param {number} count - Number of skeleton items to add
 * @param {string} type - 'card' or 'row'
 */
function showSkeletonList(container, count = 3, type = 'card') {
    if (!container) return;
    let html = '';
    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            html += `<div class="skeleton skeleton-card nm-raised mb-3 w-100 stagger-${(i % 4) + 1}"></div>`;
        } else {
            html += `<div class="skeleton skeleton-text w-100 stagger-${(i % 4) + 1}" style="height: 40px;"></div>`;
        }
    }
    container.innerHTML = html;
}

/**
 * Common fetch utility that handles JSON and triggers toasts on server errors.
 */
async function apiFetch(url, options = {}) {
    try {
        // Auto-configure Content-Type for JSON payloads
        if (options.body && typeof options.body === 'string') {
            options.headers = options.headers || {};
            // If it's a plain object, we can add Content-Type
            if (typeof options.headers.set === 'function') {
                if (!options.headers.has('Content-Type')) {
                    options.headers.set('Content-Type', 'application/json');
                }
            } else {
                if (!options.headers['Content-Type']) {
                    options.headers['Content-Type'] = 'application/json';
                }
            }
        }

        const response = await fetch(url, options);
        // We do not intercept 401s here exclusively if they need custom handling, 
        // but this helper makes boilerplate easier.
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const msg = data.message || `An error occurred (${response.status})`;
            // Show toast for all errors (except maybe 401 if you handle redirection silently, but showing it is fine too)
            if (response.status !== 401) {
                showToast(msg, 'error');
            }
            throw new Error(msg);
        }
        return data;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

// Override native window.alert globally across the front-end to use toast
window.alert = function (message) {
    showToast(message, 'info');
};

/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Display a Confirmation Toast Notification
 * @param {string} title - The title of the confirmation
 * @param {string} message - The message body
 * @returns {Promise<boolean>} - Resolves true if confirmed, false otherwise
 */
window.showConfirmToast = function (title, message) {
    return new Promise((resolve) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast toast-warning';
        toast.style.width = '300px';

        toast.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.9;">${message}</div>
            <div class="d-flex gap-2">
                <button class="btn btn-ghost" id="toast-cancel-btn" style="flex:1; height:36px; border:1px solid rgba(0,0,0,0.1); border-radius:4px;">No</button>
                <button class="btn gradient-brand" id="toast-confirm-btn" style="flex:1; height:36px; border-radius:4px; color:white;">Yes</button>
            </div>
        `;

        if (container.children.length >= 3) {
            container.removeChild(container.firstChild);
        }

        container.appendChild(toast);

        const cleanup = () => {
            toast.classList.add('toast-fade');
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 500);
        };

        toast.querySelector('#toast-cancel-btn').addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        toast.querySelector('#toast-confirm-btn').addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
    });
};

/**
 * Context-aware advanced confirmation dialog
 */
window.showConfirmDialog = function (config, onConfirm, onCancel) {
    // Remove any existing dialog
    const existing = document.getElementById('confirmDialogOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirmDialogOverlay';
    overlay.className = 'dialog-overlay';

    const warningBannerHTML = config.warningBanner
        ? `<div class="dialog-warning-banner">⚠️ ${config.warningBanner}</div>`
        : '';

    const typedConfirmHTML = config.requireTypedConfirm
        ? `<div class="typed-confirm-wrap">
         <label class="typed-confirm-label">${config.typedConfirmPrompt}:</label>
         <input type="text" id="typedConfirmInput" class="typed-confirm-input nm-inset"
                placeholder="${config.typedConfirmValue}"
                oninput="checkTypedConfirm('${config.typedConfirmValue}')">
       </div>`
        : '';

    overlay.innerHTML = `
    <div class="dialog-card nm-raised dialog-${config.type || 'info'}">
      <div class="dialog-icon" style="background:${config.iconBg}">${config.icon}</div>
      <h3 class="dialog-title">${config.title}</h3>
      ${warningBannerHTML}
      <p class="dialog-body">${config.body}</p>
      <p class="dialog-detail">${config.detail || ''}</p>
      ${typedConfirmHTML}
      <div class="dialog-actions">
        <button class="btn btn-ghost dialog-cancel" onclick="closeConfirmDialog()">${config.cancelLabel || 'Cancel'}</button>
        <button class="btn ${config.confirmClass} dialog-confirm"
                id="dialogConfirmBtn"
                ${config.requireTypedConfirm ? 'disabled' : ''}
                onclick="dialogConfirmAction()">
          ${config.confirmLabel}
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeConfirmDialog();
    });

    // Store callbacks
    window._dialogOnConfirm = onConfirm;
    window._dialogOnCancel = onCancel;

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('dialog-visible'));
};

window.closeConfirmDialog = function () {
    const overlay = document.getElementById('confirmDialogOverlay');
    if (!overlay) return;
    overlay.classList.remove('dialog-visible');
    setTimeout(() => overlay.remove(), 250);
    if (window._dialogOnCancel) window._dialogOnCancel();
};

window.dialogConfirmAction = function () {
    closeConfirmDialog();
    if (window._dialogOnConfirm) window._dialogOnConfirm();
};

window.checkTypedConfirm = function (expectedValue) {
    const input = document.getElementById('typedConfirmInput');
    const btn = document.getElementById('dialogConfirmBtn');
    if (input && btn) {
        btn.disabled = input.value.trim() !== expectedValue;
    }
};

/**
 * Helper to display human-readable relative time
 * @param {string|Date} dateParam
 * @returns {string} 
 */
function timeAgo(dateParam) {
    if (!dateParam) return '';
    const date = new Date(dateParam);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " minutes ago";

    return "just now";
}

/**
 * Display a Prompt Toast with a Custom Textarea for Notes
 * @param {string} title
 * @param {string} message
 * @param {string} textareaPlaceholder
 * @returns {Promise<string|boolean>} - Resolves string (notes) if confirmed, false otherwise
 */
window.showPromptToast = function (title, message, textareaPlaceholder = 'Notes (optional)') {
    return new Promise((resolve) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast toast-warning';
        toast.style.width = '300px';

        toast.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.9;">${message}</div>
            <textarea id="toast-prompt-textarea" placeholder="${textareaPlaceholder}" style="width: 100%; min-height: 60px; margin-bottom: 12px; font-size: 12px; padding: 8px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); background: var(--bg-inset); color: var(--text-primary);"></textarea>
            <div class="d-flex gap-2">
                <button class="btn btn-ghost" id="toast-cancel-btn" style="flex:1; height:36px; border:1px solid rgba(0,0,0,0.1); border-radius:4px;">Cancel</button>
                <button class="btn gradient-brand" id="toast-confirm-btn" style="flex:1; height:36px; border-radius:4px; color:white;">Confirm</button>
            </div>
        `;

        if (container.children.length >= 3) {
            container.removeChild(container.firstChild);
        }

        container.appendChild(toast);

        const cleanup = () => {
            toast.classList.add('toast-fade');
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 500);
        };

        toast.querySelector('#toast-cancel-btn').addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        toast.querySelector('#toast-confirm-btn').addEventListener('click', () => {
            const inputVal = toast.querySelector('#toast-prompt-textarea').value;
            cleanup();
            resolve(inputVal || " "); // Empty valid note string vs false
        });
    });
};
