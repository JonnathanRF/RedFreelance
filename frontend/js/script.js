// RedFreelance/frontend/js/script.js

const AUTH_SERVICE_URL = 'http://localhost:8000';
const PROTECTED_ROUTES = {
    'client': 'http://localhost:8000/client-dashboard/',
    'freelancer': 'http://localhost:8000/freelancer-profile/',
    'admin': 'http://localhost:8000/admin-panel/'
};

// Elementos de la UI
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const welcomeSection = document.getElementById('welcomeSection');

const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
// const loginMessage = document.getElementById('loginMessage'); // Ya no se usa directamente para mensajes visibles

const registerForm = document.getElementById('registerForm');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerRoleSelect = document.getElementById('registerRole');
// const registerMessage = document.getElementById('registerMessage'); // Ya no se usa directamente para mensajes visibles
// const registerErrorMessage = document.getElementById('registerErrorMessage'); // Ya no se usa directamente para mensajes visibles

const userEmailDisplay = document.getElementById('userEmailDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const logoutButton = document.getElementById('logoutButton');

const goToRegisterButton = document.getElementById('goToRegisterButton');
const goToLoginButton = document.getElementById('goToLoginButton');

const clientDashboardButton = document.getElementById('clientDashboardButton');
const freelancerProfileButton = document.getElementById('freelancerProfileButton');
const adminPanelButton = document.getElementById('adminPanelButton');

const clientMessage = document.getElementById('clientMessage'); // Todavía se usa para mensajes específicos de rutas
const freelancerMessage = document.getElementById('freelancerMessage'); // Todavía se usa para mensajes específicos de rutas
const adminMessage = document.getElementById('adminMessage'); // Todavía se usa para mensajes específicos de rutas

// showMessage ahora solo es un wrapper para showNotification
function showMessage(element, message, isError = false) {
    if (element) {
        element.classList.add('hidden'); // Asegurarse de que los elementos HTML de mensaje estén ocultos
    }
    showNotification(message, isError ? 'error' : 'success');
}

// Función para decodificar JWT (simplificada para frontend)
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

// Función para obtener el token del localStorage
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Función para verificar la autenticación y el rol del usuario
function checkAuthAndRole() {
    const token = getAuthToken();
    const currentPath = window.location.pathname;

    if (!token) {
        // Si no hay token, asegurar que se muestren las secciones de login/registro
        if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
            if (loginSection) loginSection.classList.remove('hidden');
            if (registerSection) registerSection.classList.add('hidden');
            if (welcomeSection) welcomeSection.classList.add('hidden');
        } else if (currentPath.endsWith('register.html')) {
            if (registerSection) registerSection.classList.remove('hidden');
            if (loginSection) loginSection.classList.add('hidden');
            if (welcomeSection) welcomeSection.classList.add('hidden');
        }
        return null;
    }

    const decodedToken = decodeJwt(token);
    if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
        // Si el token es inválido o expirado, limpiar y almacenar notificación
        localStorage.setItem('pendingNotification', JSON.stringify({
            message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
            type: 'warning'
        }));
        localStorage.removeItem('accessToken');
        if (!currentPath.endsWith('index.html') && !currentPath.endsWith('/')) {
            window.location.href = 'index.html'; // Redirigir si no estamos ya en index
        } else {
            // Si ya estamos en index, solo actualizar las secciones de login
            if (loginSection) loginSection.classList.remove('hidden');
            if (registerSection) registerSection.classList.add('hidden');
            if (welcomeSection) welcomeSection.classList.add('hidden');
        }
        return null;
    }

    // Si el token es válido, mostrar información del usuario y ocultar login/registro
    if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub;
    if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

    if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
        if (loginSection) loginSection.classList.add('hidden');
        if (registerSection) registerSection.classList.add('hidden');
        if (welcomeSection) welcomeSection.classList.remove('hidden');
    } else {
        // Si estamos en register.html y estamos logueados, redirigir a index.html
        if (currentPath.endsWith('register.html')) {
            window.location.href = 'index.html';
        }
    }

    // Añadir botón "Ir a Gestión de Servicios" si no existe
    let goToServicesButton = document.getElementById('goToServicesButton');
    if (!goToServicesButton) {
        goToServicesButton = document.createElement('button');
        goToServicesButton.id = 'goToServicesButton';
        goToServicesButton.textContent = 'Ir a Gestión de Servicios';
        goToServicesButton.classList.add(
            'w-full', 'bg-green-600', 'text-white', 'py-3', 'rounded-lg', 'font-bold',
            'hover:bg-green-700', 'transition-all', 'duration-200', 'ease-in-out', 'shadow-md', 'active:scale-95', 'mt-4'
        );
        if (welcomeSection) {
            welcomeSection.appendChild(goToServicesButton);
            goToServicesButton.addEventListener('click', () => {
                window.location.href = 'services.html';
            });
        }
    }

    return decodedToken;
}

// --- Event Listeners ---

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            // Almacenar la notificación de éxito en localStorage antes de redirigir
            localStorage.setItem('pendingNotification', JSON.stringify({
                message: 'Inicio de sesión exitoso!',
                type: 'success'
            }));
            checkAuthAndRole(); // Esto ya maneja la redirección o actualización de UI
        } catch (error) {
            // Mostrar error usando la notificación global (no hay redirección aquí)
            showNotification(`Error al iniciar sesión: ${error.message}`, 'error');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const role = registerRoleSelect.value;

        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // Almacenar la notificación de éxito en localStorage antes de redirigir
            localStorage.setItem('pendingNotification', JSON.stringify({
                message: `Usuario ${data.email} registrado como ${data.role}!`,
                type: 'success'
            }));
            registerForm.reset();
            window.location.href = 'index.html'; // Redirigir inmediatamente a la página de login
        } catch (error) {
            // Mostrar error usando la notificación global (no hay redirección aquí)
            showNotification(`Error al registrar: ${error.message}`, 'error');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        // Almacenar la notificación de éxito en localStorage antes de redirigir
        localStorage.setItem('pendingNotification', JSON.stringify({
            message: 'Sesión cerrada exitosamente.',
            type: 'success'
        }));
        window.location.href = 'index.html'; // Redirigir inmediatamente
    });
}

if (goToRegisterButton) {
    goToRegisterButton.addEventListener('click', () => {
        window.location.href = 'register.html';
    });
}

if (goToLoginButton) {
    goToLoginButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

async function accessProtectedRoute(url, messageElement) {
    const token = getAuthToken();
    if (!token) {
        showNotification('No autenticado. Por favor, inicie sesión.', 'error');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Para mensajes de rutas protegidas
        showNotification(`Acceso exitoso a ${url}. Mensaje: ${JSON.stringify(data)}`, 'success');
    } catch (error) {
        showNotification(`Error al acceder a ${url}: ${error.message}`, 'error');
    }
}

if (clientDashboardButton) {
    clientDashboardButton.addEventListener('click', () => accessProtectedRoute(PROTECTED_ROUTES.client, clientMessage));
}
if (freelancerProfileButton) {
    freelancerProfileButton.addEventListener('click', () => accessProtectedRoute(PROTECTED_ROUTES.freelancer, freelancerMessage));
}
if (adminPanelButton) {
    adminPanelButton.addEventListener('click', () => accessProtectedRoute(PROTECTED_ROUTES.admin, adminMessage));
}

document.addEventListener('DOMContentLoaded', checkAuthAndRole);
