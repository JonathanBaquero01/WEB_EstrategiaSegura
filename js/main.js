/**
 * Main JavaScript - GestorFPQRS
 * Funciones utilitarias y componentes compartidos
 */

const App = (function() {
    'use strict';

    // Toast notifications
    function showToast(message, type) {
        type = type || 'info';
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'alert-triangle', 
            warning: 'alert-triangle',
            info: 'info'
        };
        
        const iconSvg = SidebarModule ? SidebarModule.getIcon(iconMap[type] || 'info') : '';
        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Modal functions
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Tab switching
    function setupTabs(container) {
        const tabs = container.querySelectorAll('.tab-btn');
        const contents = container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const target = this.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                const content = container.querySelector(`[data-tab-content="${target}"]`);
                if (content) content.classList.add('active');
            });
        });
    }

    // Format date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Format datetime
    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Time ago
    function timeAgo(dateStr) {
        const now = new Date();
        const past = new Date(dateStr);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'hace un momento';
        if (diffMins < 60) return `hace ${diffMins}m`;
        if (diffHours < 24) return `hace ${diffHours}h`;
        if (diffDays < 30) return `hace ${diffDays}d`;
        return formatDate(dateStr);
    }

    // Toggle password visibility
    function setupPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = document.querySelector(this.dataset.target);
                if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    this.innerHTML = SidebarModule.getIcon(isPassword ? 'eye-off' : 'eye');
                }
            });
        });
    }

    // Initialize on DOM ready
    function init() {
        // Setup tabs
        document.querySelectorAll('[data-tabs]').forEach(container => {
            setupTabs(container);
        });

        // Setup password toggles
        setupPasswordToggles();

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close modals on close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.show').forEach(modal => {
                    modal.classList.remove('show');
                });
                document.body.style.overflow = '';
            }
        });
    }

    return {
        showToast: showToast,
        showModal: showModal,
        hideModal: hideModal,
        setupTabs: setupTabs,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        timeAgo: timeAgo,
        init: init
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    App.init();
    if (window.SidebarModule) {
        SidebarModule.setupMobile();
    }
});

if (typeof window !== 'undefined') {
    window.App = App;
}
