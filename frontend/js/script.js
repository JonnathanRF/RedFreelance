// RedFreelance/frontend/js/script.js

const AUTH_SERVICE_URL = 'http://localhost:8000';

// Elementos del DOM (asegurarse de que existan antes de usarlos)
const loginSection = document.getElementById('loginSection');
const welcomeSection = document.getElementById('welcomeSection');
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const logoutButton = document.getElementById('logoutButton');
const goToRegisterButton = document.getElementById('goToRegisterButton');
const goToLoginButton = document.getElementById('goToLoginButton'); // Botón "Iniciar Sesión" en register.html

// Botones de rutas protegidas
const clientDashboardButton = document.getElementById('clientDashboardButton');
const clientMessage = document.getElementById('clientMessage');
const freelancerProfileButton = document.getElementById('freelancerProfileButton');
const freelancerMessage = document.getElementById('freelancerMessage');
const adminPanelButton = document.getElementById('adminPanelButton');
const adminMessage = document.getElementById('adminMessage');

// --- NUEVO: Botón para ir a la página de servicios (se añade dinámicamente) ---
let goToServicesButton; // Declarar aquí para que sea accesible

// Función para mostrar mensajes temporales
function showMessage(element, message, isError = false) {
    if (element) { // Asegurarse de que el elemento exista
        element.textContent = message;
        element.className = isError ? 'error-message' : 'success-message';
        element.style.display = 'block';
        setTimeout(() => {
            if (element) { // Volver a verificar antes de ocultar
                element.style.display = 'none';
                element.textContent = '';
            }
        }, 5000);
    }
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

// Función para actualizar la UI según el estado de autenticación
function updateUIForAuthStatus() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            // Token válido y no expirado
            if (loginSection) loginSection.style.display = 'none';
            if (welcomeSection) {
                welcomeSection.style.display = 'block';
                if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub; // 'sub' es el email
                if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

                // Añadir el botón "Ir a Gestión de Servicios" si no existe
                if (!goToServicesButton) {
                    goToServicesButton = document.createElement('button');
                    goToServicesButton.id = 'goToServicesButton';
                    goToServicesButton.textContent = 'Ir a Gestión de Servicios';
                    goToServicesButton.style.marginTop = '10px';
                    welcomeSection.appendChild(goToServicesButton);
                    goToServicesButton.addEventListener('click', () => {
                        window.location.href = 'services.html';
                    });
                }
                goToServicesButton.style.display = 'block'; // Mostrarlo si ya existe
            }
            
            // Mostrar/ocultar botones de rol
            if (clientDashboardButton) clientDashboardButton.style.display = (decodedToken.role === 'client' || decodedToken.role === 'admin') ? 'block' : 'none';
            if (freelancerProfileButton) freelancerProfileButton.style.display = (decodedToken.role === 'freelancer' || decodedToken.role === 'admin') ? 'block' : 'none';
            if (adminPanelButton) adminPanelButton.style.display = (decodedToken.role === 'admin') ? 'block' : 'none';

        } else {
            // Token expirado o inválido
            localStorage.removeItem('accessToken');
            if (loginSection) loginSection.style.display = 'block';
            if (welcomeSection) welcomeSection.style.display = 'none';
            if (loginMessage) showMessage(loginMessage, 'Sesión expirada o token inválido. Por favor, inicie sesión nuevamente.', true);
        }
    } else {
        // No hay token
        if (loginSection) loginSection.style.display = 'block';
        if (welcomeSection) welcomeSection.style.display = 'none';
    }
}

// --- Manejadores de Eventos ---

// Formulario de Login
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (loginMessage) loginMessage.style.display = 'none';

        const username = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const formData = new URLSearchParams();
        formData.append('username', username);
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
                throw new Error(errorData.detail || 'Error al iniciar sesión');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            updateUIForAuthStatus(); // Actualizar la UI después del login
        } catch (error) {
            console.error('Error de login:', error);
            if (loginMessage) showMessage(loginMessage, `Error: ${error.message}`, true);
        }
    });
}


// Botón de Cerrar Sesión
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        updateUIForAuthStatus(); // Actualizar la UI después de cerrar sesión
        if (loginMessage) showMessage(loginMessage, 'Sesión cerrada exitosamente.', false);
    });
}


// Botón para ir a la página de registro (en index.html)
if (goToRegisterButton) {
    goToRegisterButton.addEventListener('click', () => {
        window.location.href = 'register.html';
    });
}

// Botón para ir a la página de login (en register.html)
if (goToLoginButton) {
    goToLoginButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}


// --- Funciones para probar rutas protegidas por rol ---
async function testProtectedRoute(endpoint, messageElement) {
    if (messageElement) messageElement.style.display = 'none';
    const token = localStorage.getItem('accessToken');
    if (!token) {
        if (messageElement) showMessage(messageElement, 'No autenticado. Por favor, inicie sesión.', true);
        return;
    }

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            throw new Error('No autorizado. Token inválido o expirado.');
        }
        if (response.status === 403) {
            throw new Error('Acceso denegado. No tienes el rol requerido.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (messageElement) showMessage(messageElement, `Acceso exitoso! Datos: ${JSON.stringify(data)}`, false);
    } catch (error) {
        console.error(`Error al acceder a ${endpoint}:`, error);
        if (messageElement) showMessage(messageElement, `Error: ${error.message}`, true);
    }
}

if (clientDashboardButton) clientDashboardButton.addEventListener('click', () => testProtectedRoute('/client-dashboard/', clientMessage));
if (freelancerProfileButton) freelancerProfileButton.addEventListener('click', () => testProtectedRoute('/freelancer-profile/', freelancerMessage));
if (adminPanelButton) adminPanelButton.addEventListener('click', () => testProtectedRoute('/admin-panel/', adminMessage));


// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', updateUIForAuthStatus);

// Lógica de registro (Solo si estamos en register.html)
const registerForm = document.getElementById('registerForm');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerRoleSelect = document.getElementById('registerRole');
const registerMessage = document.getElementById('registerMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (registerMessage) registerMessage.style.display = 'none';
        if (registerErrorMessage) registerErrorMessage.style.display = 'none';

        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const role = registerRoleSelect.value;

        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await response.json();

            if (response.ok) {
                if (registerMessage) showMessage(registerMessage, `Usuario ${data.email} registrado exitosamente como ${data.role}!`, false);
                registerForm.reset(); // Limpia el formulario
            } else {
                if (registerErrorMessage) showMessage(registerErrorMessage, `Error al registrar: ${data.detail || 'Error desconocido'}`, true);
                console.error('Error de registro:', data);
            }
        } catch (error) {
            if (registerErrorMessage) showMessage(registerErrorMessage, 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.', true);
            console.error('Error de red durante el registro:', error);
        }
    });
}
