/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated
 * Redirects to login if not authenticated
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                // User is authenticated
                return data.data;
            }
        }
        
        // Not authenticated - only redirect if not on login/register pages
        const currentPage = window.location.pathname;
        if (!currentPage.includes('login.html') && !currentPage.includes('register.html')) {
            window.location.href = '/pages/login.html';
        }
        
        return null;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

/**
 * Get current user information
 */
async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/pages/login.html';
        } else {
            console.error('Logout failed');
            // Force redirect anyway
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect anyway
        window.location.href = '/pages/login.html';
    }
}

/**
 * Redirect based on user role
 */
function redirectByRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = '/pages/dashboard-admin.html';
            break;
        case 'collector':
            window.location.href = '/pages/dashboard-collector.html';
            break;
        case 'resident':
            window.location.href = '/pages/dashboard-resident.html';
            break;
        default:
            window.location.href = '/pages/login.html';
    }
}
