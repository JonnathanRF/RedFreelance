// RedFreelance/frontend/script.js

const API_BASE_URL = 'http://localhost:8000'; // URL de tu backend FastAPI

// --- Elementos Comunes ---
const welcomeSection = document.getElementById('welcomeSection');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const logoutButton = document.getElementById('logoutButton');

// Botones de rutas protegidas
const clientDashboardButton = document.getElementById('clientDashboardButton');
const clientMessage = document.getElementById('clientMessage');
const freelancerProfileButton = document.getElementById('freelancerProfileButton');
const freelancerMessage = document.getElementById('freelancerMessage');
const adminPanelButton = document.getElementById('adminPanelButton');
const adminMessage = document.getElementById('adminMessage');


// --- Elementos Específicos de index.html (Login) ---
const loginSection = document.getElementById('loginSection');
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const goToRegisterButton = document.getElementById('goToRegisterButton'); // Nuevo botón


// --- Elementos Específicos de register.html (Registro) ---
const registerSection = document.getElementById('registerSection'); // Será null en index.html
const registerForm = document.getElementById('registerForm'); // Será null en index.html
const registerEmailInput = document.getElementById('registerEmail'); // Será null en index.html
const registerPasswordInput = document.getElementById('registerPassword'); // Será null en index.html
const registerRoleSelect = document.getElementById('registerRole'); // Será null en index.html
const registerMessage = document.getElementById('registerMessage'); // Será null en index.html
const registerErrorMessage = document.getElementById('registerErrorMessage'); // Será null en index.html
const goToLoginButton = document.getElementById('goToLoginButton'); // Nuevo botón


// --- Funciones de Navegación ---
function navigateTo(page) {
    window.location.href = page + '.html';
}

// --- Manejo del Estado de la UI ---
function updateUI() {
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userEmail && userRole) {
        // Usuario logueado: Mostrar sección de bienvenida, ocultar login/registro
        if (welcomeSection) welcomeSection.style.display = 'block';
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'none'; // Asegura ocultar si estamos en register.html y se recarga después de login

        if (userEmailDisplay) userEmailDisplay.textContent = userEmail;
        if (userRoleDisplay) userRoleDisplay.textContent = userRole;

        // Limpiar mensajes anteriores
        if (clientMessage) clientMessage.textContent = '';
        if (freelancerMessage) freelancerMessage.textContent = '';
        if (adminMessage) adminMessage.textContent = '';

    } else {
        // Usuario no logueado: Ocultar bienvenida
        if (welcomeSection) welcomeSection.style.display = 'none';

        // Mostrar u ocultar login/registro dependiendo de la página actual
        if (loginSection) loginSection.style.display = 'block'; // Mostrar login si estamos en index.html
        if (registerSection) registerSection.style.display = 'block'; // Mostrar registro si estamos en register.html
    }
}


// --- Event Listeners Globales (presentes en ambas páginas si los elementos existen) ---

// Botón Cerrar Sesión
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        updateUI();
        navigateTo('index'); // Vuelve a la página de login
    });
}

// Botones de Acceso a Rutas Protegidas (se mantienen en index.html para demostrar acceso)
if (clientDashboardButton) {
    clientDashboardButton.addEventListener('click', async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            clientMessage.textContent = 'No estás logueado.';
            clientMessage.className = 'error-message';
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/client-dashboard/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                clientMessage.textContent = `Acceso exitoso a /client-dashboard/! Datos: ${JSON.stringify(data)}`;
                clientMessage.className = 'success-message';
            } else {
                clientMessage.textContent = `Acceso denegado a /client-dashboard/: ${data.detail || 'Error desconocido'}`;
                clientMessage.className = 'error-message';
            }
        } catch (error) {
            clientMessage.textContent = `Error de conexión con el servidor al acceder /client-dashboard/. Inténtalo de nuevo más tarde.`;
            clientMessage.className = 'error-message';
            console.error('Error al acceder al dashboard de cliente:', error);
        }
    });
}

if (freelancerProfileButton) {
    freelancerProfileButton.addEventListener('click', async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            freelancerMessage.textContent = 'No estás logueado.';
            freelancerMessage.className = 'error-message';
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/freelancer-profile/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                freelancerMessage.textContent = `Acceso exitoso a /freelancer-profile/! Datos: ${JSON.stringify(data)}`;
                freelancerMessage.className = 'success-message';
            } else {
                freelancerMessage.textContent = `Acceso denegado a /freelancer-profile/: ${data.detail || 'Error desconocido'}`;
                freelancerMessage.className = 'error-message';
            }
        } catch (error) {
            freelancerMessage.textContent = `Error de conexión con el servidor al acceder /freelancer-profile/. Inténtalo de nuevo más tarde.`;
            freelancerMessage.className = 'error-message';
            console.error('Error al acceder al perfil de freelancer:', error);
        }
    });
}

if (adminPanelButton) {
    adminPanelButton.addEventListener('click', async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            adminMessage.textContent = 'No estás logueado.';
            adminMessage.className = 'error-message';
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin-panel/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                adminMessage.textContent = `Acceso exitoso a /admin-panel/! Datos: ${JSON.stringify(data)}`;
                adminMessage.className = 'success-message';
            } else {
                adminMessage.textContent = `Acceso denegado a /admin-panel/: ${data.detail || 'Error desconocido'}`;
                adminMessage.className = 'error-message';
            }
        } catch (error) {
            adminMessage.textContent = `Error de conexión con el servidor al acceder /admin-panel/. Inténtalo de nuevo más tarde.`;
            adminMessage.className = 'error-message';
            console.error('Error al acceder al panel de admin:', error);
        }
    });
}


// --- Event Listeners Específicos de cada Página ---

// En index.html: Manejar el formulario de Login y el botón "Registrar Usuario"
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const formData = new URLSearchParams();
        formData.append('username', email); // FastAPI usa 'username' para el email en OAuth2
        formData.append('password', password);

        try {
            const response = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('userEmail', email);
                // Decodificar el token para obtener el rol, ya que no se devuelve directamente en /token
                const decodedToken = JSON.parse(atob(data.access_token.split('.')[1]));
                localStorage.setItem('userRole', decodedToken.role);
                loginMessage.textContent = ''; // Limpia mensajes de error previos
                updateUI();
            } else {
                loginMessage.textContent = `Error al iniciar sesión: ${data.detail || 'Credenciales inválidas'}`;
                loginMessage.className = 'error-message';
                console.error('Error de login:', data);
            }
        } catch (error) {
            loginMessage.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.';
            loginMessage.className = 'error-message';
            console.error('Error de red durante el login:', error);
        }
    });
}

if (goToRegisterButton) {
    goToRegisterButton.addEventListener('click', () => {
        navigateTo('register');
    });
}


// En register.html: Manejar el formulario de Registro y el botón "Iniciar Sesión"
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const role = registerRoleSelect.value;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = `Usuario ${data.email} registrado exitosamente como ${data.role}!`;
                registerMessage.className = 'success-message';
                registerErrorMessage.textContent = ''; // Limpia errores previos
                registerForm.reset(); // Limpia el formulario
                // Opcional: Redirigir al login después de un registro exitoso
                // setTimeout(() => navigateTo('index'), 2000);
            } else {
                registerErrorMessage.textContent = `Error al registrar: ${data.detail || 'Error desconocido'}`;
                registerErrorMessage.className = 'error-message';
                registerMessage.textContent = ''; // Limpia mensaje de éxito
                console.error('Error de registro:', data);
            }
        } catch (error) {
            registerErrorMessage.textContent = 'Error de conexión con el servidor. Inténtalo de nuevo más tarde.';
            registerErrorMessage.className = 'error-message';
            registerMessage.textContent = ''; // Limpia mensaje de éxito
            console.error('Error de red durante el registro:', error);
        }
    });
}

if (goToLoginButton) {
    goToLoginButton.addEventListener('click', () => {
        navigateTo('index');
    });
}


// --- Inicialización ---
// Asegurarse de que la UI se actualice correctamente al cargar la página
document.addEventListener('DOMContentLoaded', updateUI);