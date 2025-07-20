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
        element.classList.remove('hidden'); // Asegurarse de que sea visible
        // Reemplazar clases de éxito/error con las de Tailwind
        element.classList.remove('bg-red-200', 'text-red-800', 'bg-green-200', 'text-green-800'); // Limpiar clases previas
        element.classList.add('p-3', 'rounded-lg', 'mt-4', 'font-bold', 'text-sm'); // Clases base para mensajes
        if (isError) {
            element.classList.add('bg-red-200', 'text-red-800');
        } else {
            element.classList.add('bg-green-200', 'text-green-800');
        }
        setTimeout(() => {
            if (element) { // Volver a verificar antes de ocultar
                element.classList.add('hidden'); // Ocultar después de un tiempo
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
    // Esta función se ejecuta en index.html y register.html
    // En index.html, decide si mostrar login o bienvenida
    // En register.html, solo se asegura de que el botón "Iniciar Sesión" funcione.

    if (token) {
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            // Token válido y no expirado:
            // Si estamos en index.html, mostrar la sección de bienvenida
            if (loginSection && welcomeSection) { // Estamos en index.html
                loginSection.classList.add('hidden');
                welcomeSection.classList.remove('hidden');
                if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub; // 'sub' es el email
                if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

                // Añadir el botón "Ir a Gestión de Servicios" si no existe
                if (!goToServicesButton) {
                    goToServicesButton = document.createElement('button');
                    goToServicesButton.id = 'goToServicesButton';
                    goToServicesButton.textContent = 'Ir a Gestión de Servicios';
                    goToServicesButton.classList.add(
                        'w-full', 'bg-blue-500', 'text-white', 'py-3', 'rounded-lg', 'font-bold',
                        'hover:bg-blue-600', 'transition-all', 'duration-200', 'ease-in-out', 'shadow-md', 'active:scale-95',
                        'mt-4' // Margen superior
                    );
                    welcomeSection.appendChild(goToServicesButton);
                    goToServicesButton.addEventListener('click', () => {
                        window.location.href = 'services.html';
                    });
                }
                goToServicesButton.classList.remove('hidden'); // Mostrarlo si ya existe
            } else { // Estamos en register.html o alguna otra página que carga este script
                // No hacemos nada con la UI principal aquí, solo nos aseguramos de que el token es válido
                // y que el usuario puede navegar a index.html si quiere loguearse.
            }
            
            // Mostrar/ocultar botones de rol (si existen en la página actual)
            if (clientDashboardButton) clientDashboardButton.classList.toggle('hidden', !(decodedToken.role === 'client' || decodedToken.role === 'admin'));
            if (freelancerProfileButton) freelancerProfileButton.classList.toggle('hidden', !(decodedToken.role === 'freelancer' || decodedToken.role === 'admin'));
            if (adminPanelButton) adminPanelButton.classList.toggle('hidden', !(decodedToken.role === 'admin'));

        } else {
            // Token expirado o inválido: Limpiar token y mostrar login (si estamos en index.html)
            localStorage.removeItem('accessToken');
            if (loginSection && welcomeSection) { // Estamos en index.html
                loginSection.classList.remove('hidden'); // Muestra el formulario de login
                welcomeSection.classList.add('hidden'); // Oculta la bienvenida
            }
            // Si estamos en register.html, simplemente el token se borra y la página de registro permanece visible.
        }
    } else {
        // No hay token: Mostrar sección de login (si estamos en index.html)
        if (loginSection && welcomeSection) { // Estamos en index.html
            loginSection.classList.remove('hidden'); // Muestra el formulario de login
            welcomeSection.classList.add('hidden'); // Oculta la bienvenida
        }
        // Si estamos en register.html, la página de registro permanece visible.
    }
}

// --- Manejadores de Eventos ---

// Formulario de Login
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (loginMessage) loginMessage.classList.add('hidden');

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
        // Después de cerrar sesión, si estamos en index.html, actualizamos la UI.
        // Si estamos en services.html, el checkAuthAndRole de services.js nos redirigirá a landing.html.
        updateUIForAuthStatus(); 
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
    if (messageElement) messageElement.classList.add('hidden');
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
document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar updateUIForAuthStatus si estamos en index.html
    // La página de registro no necesita esta lógica para su UI principal.
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        updateUIForAuthStatus();
    }
});

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
        if (registerMessage) registerMessage.classList.add('hidden');
        if (registerErrorMessage) registerErrorMessage.classList.add('hidden');

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
