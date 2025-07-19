// RedFreelance/frontend/js/services.js

const AUTH_SERVICE_URL = 'http://localhost:8000';
const SERVICE_SERVICE_URL = 'http://localhost:8001';

// Elementos de la UI (asegurarse de que existan)
const userEmailDisplay = document.getElementById('userEmailDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const backToAuthButton = document.getElementById('backToAuthButton');

const createServiceSection = document.getElementById('createServiceSection');
const createServiceForm = document.getElementById('createServiceForm');
const serviceTitleInput = document.getElementById('serviceTitle');
const serviceDescriptionInput = document.getElementById('serviceDescription');
const servicePriceInput = document.getElementById('servicePrice');
const serviceCategoryInput = document.getElementById('serviceCategory');
const createServiceMessage = document.getElementById('createServiceMessage');
const createServiceErrorMessage = document.getElementById('createServiceErrorMessage');

const servicesList = document.getElementById('servicesList');
const noServicesMessage = document.getElementById('noServicesMessage');
const listServicesMessage = document.getElementById('listServicesMessage');

const manageServiceSection = document.getElementById('manageServiceSection');
const manageServiceIdSpan = document.getElementById('manageServiceId');
const updateServiceForm = document.getElementById('updateServiceForm');
const updateServiceTitleInput = document.getElementById('updateServiceTitle');
const updateServiceDescriptionInput = document.getElementById('updateServiceDescription');
const updateServicePriceInput = document.getElementById('updateServicePrice'); // Corregido: antes era 'document ='
const updateServiceCategoryInput = document.getElementById('updateServiceCategory');
const updateServiceButton = document.getElementById('updateServiceButton');
const deleteServiceButton = document.getElementById('deleteServiceButton');
const cancelManageButton = document.getElementById('cancelManageButton');
const manageServiceMessage = document.getElementById('manageServiceMessage');
const manageServiceErrorMessage = document.getElementById('manageServiceErrorMessage');

// NUEVOS ELEMENTOS PARA FILTRADO
const servicesListTitle = document.getElementById('servicesListTitle'); // Nuevo título para la lista
const toggleMyServicesButton = document.createElement('button'); // Botón para alternar
toggleMyServicesButton.id = 'toggleMyServicesButton';
toggleMyServicesButton.textContent = 'Ver Mis Servicios';
toggleMyServicesButton.style.marginTop = '10px';
toggleMyServicesButton.style.marginBottom = '20px';
toggleMyServicesButton.style.backgroundColor = '#007bff'; // Estilo para el botón
toggleMyServicesButton.style.color = 'white';
toggleMyServicesButton.style.padding = '10px 15px';
toggleMyServicesButton.style.border = 'none';
toggleMyServicesButton.style.borderRadius = '5px';
toggleMyServicesButton.style.cursor = 'pointer';
toggleMyServicesButton.style.transition = 'background-color 0.2s ease';
toggleMyServicesButton.onmouseover = () => toggleMyServicesButton.style.backgroundColor = '#0056b3';
toggleMyServicesButton.onmouseout = () => toggleMyServicesButton.style.backgroundColor = '#007bff';

// Añadir el botón al DOM (por ejemplo, debajo del hr después del botón "Volver a Autenticación")
const hrElement = document.querySelector('.container hr');
if (hrElement && hrElement.nextElementSibling) {
    hrElement.parentNode.insertBefore(toggleMyServicesButton, hrElement.nextElementSibling);
} else if (hrElement) {
    hrElement.parentNode.appendChild(toggleMyServicesButton);
}


let currentServiceId = null; // Para almacenar el ID del servicio que se está gestionando
let showingMyServices = false; // Estado para saber qué servicios estamos mostrando

// Función para mostrar mensajes temporales
function showMessage(element, message, isError = false) {
    if (element) {
        element.textContent = message;
        element.className = isError ? 'error-message' : 'success-message';
        element.style.display = 'block';
        setTimeout(() => {
            if (element) {
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

// Función para obtener el token del localStorage
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Función para verificar la autenticación y el rol del usuario
function checkAuthAndRole() {
    const token = getAuthToken();
    if (!token) {
        alert('No autenticado. Por favor, inicie sesión.');
        window.location.href = 'index.html';
        return null;
    }

    const decodedToken = decodeJwt(token);
    if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
        alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
        localStorage.removeItem('accessToken');
        window.location.href = 'index.html';
        return null;
    }

    if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub; // 'sub' es el email
    if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

    // Mostrar/ocultar secciones según el rol
    if (createServiceSection) {
        if (decodedToken.role === 'freelancer' || decodedToken.role === 'admin') {
            createServiceSection.style.display = 'block';
            if (toggleMyServicesButton) toggleMyServicesButton.style.display = 'block'; // Mostrar el botón de alternar
        } else {
            createServiceSection.style.display = 'none';
            if (toggleMyServicesButton) toggleMyServicesButton.style.display = 'none'; // Ocultar el botón de alternar
        }
    }
    return decodedToken;
}

const currentUser = checkAuthAndRole(); // Obtener los datos del usuario al cargar la página

// --- Funciones de Interacción con el Service Service ---

// Función para cargar y mostrar servicios (ahora con lógica de filtrado)
async function loadServices() {
    if (listServicesMessage) listServicesMessage.style.display = 'none';
    if (servicesList) servicesList.innerHTML = '';
    if (noServicesMessage) noServicesMessage.style.display = 'none';

    let url = `${SERVICE_SERVICE_URL}/services/`;
    if (currentUser && currentUser.role === 'freelancer' && showingMyServices) {
        url = `${SERVICE_SERVICE_URL}/services/my/`; // Usar el nuevo endpoint
        if (servicesListTitle) servicesListTitle.textContent = 'Mis Servicios Publicados';
    } else {
        if (servicesListTitle) servicesListTitle.textContent = 'Todos los Servicios Disponibles';
    }

    try {
        const token = getAuthToken(); // Necesario para /services/my/
        const headers = {
            'Content-Type': 'application/json'
        };
        // Solo añadir el token si el endpoint lo requiere o si el usuario es freelancer/admin
        if (token && (url.includes('/services/my/') || currentUser.role === 'freelancer' || currentUser.role === 'admin')) {
             headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers: headers });

        if (!response.ok) {
            // Manejo de errores específicos para 401/403 en caso de que el token no sea válido para /services/my/
            if (response.status === 401 || response.status === 403) {
                alert('No autorizado para ver esta sección. Por favor, inicie sesión como freelancer.');
                window.location.href = 'index.html';
                return;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const services = await response.json();

        if (services.length === 0) {
            if (noServicesMessage) noServicesMessage.style.display = 'block';
        } else {
            services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <p><strong>Precio:</strong> $${service.price.toFixed(2)}</p>
                    <p><strong>Categoría:</strong> ${service.category}</p>
                    <p><strong>ID Freelancer:</strong> ${service.freelancer_id}</p>
                `;
                // Añadir botones de gestionar si el usuario es el propietario o admin
                if (currentUser && (currentUser.user_id === service.freelancer_id || currentUser.role === 'admin')) {
                    const manageButton = document.createElement('button');
                    manageButton.textContent = 'Gestionar';
                    manageButton.className = 'manage-button';
                    manageButton.onclick = () => showManageService(service);
                    serviceCard.appendChild(manageButton);
                }
                if (servicesList) servicesList.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        if (listServicesMessage) showMessage(listServicesMessage, `Error al cargar servicios: ${error.message}`, true);
    }
}

// Función para mostrar el formulario de gestionar servicio
function showManageService(service) {
    currentServiceId = service.id;
    if (manageServiceIdSpan) manageServiceIdSpan.textContent = service.id;
    if (updateServiceTitleInput) updateServiceTitleInput.value = service.title;
    if (updateServiceDescriptionInput) updateServiceDescriptionInput.value = service.description;
    if (updateServicePriceInput) updateServicePriceInput.value = service.price;
    if (updateServiceCategoryInput) updateServiceCategoryInput.value = service.category;

    // Ocultar sección de creación y mostrar la de gestión
    if (createServiceSection) createServiceSection.style.display = 'none';
    if (listServicesSection) listServicesSection.style.display = 'none';
    if (manageServiceSection) manageServiceSection.style.display = 'block';
    
    // OCULTAR EL BOTÓN "Ver Mis Servicios"
    if (toggleMyServicesButton) {
        toggleMyServicesButton.style.display = 'none';
    }

    // Deshabilitar botones de actualizar/eliminar si no es el propietario ni admin
    if (updateServiceButton && deleteServiceButton) {
        if (currentUser && (currentUser.user_id === service.freelancer_id || currentUser.role === 'admin')) {
            updateServiceButton.disabled = false;
            deleteServiceButton.disabled = false;
        } else {
            updateServiceButton.disabled = true;
            deleteServiceButton.disabled = true;
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, "No tienes permiso para editar/eliminar este servicio.", true);
        }
    }
}

// Función para ocultar el formulario de gestionar y volver a la lista
function hideManageService() {
    currentServiceId = null;
    if (manageServiceSection) manageServiceSection.style.display = 'none';
    if (createServiceSection) createServiceSection.style.display = (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin')) ? 'block' : 'none';
    if (listServicesSection) listServicesSection.style.display = 'block';
    
    // MOSTRAR EL BOTÓN "Ver Mis Servicios" de nuevo (solo si el usuario es freelancer o admin)
    if (toggleMyServicesButton && (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin'))) {
        toggleMyServicesButton.style.display = 'block';
    }

    loadServices(); // Recargar la lista para reflejar cambios
}

// --- Event Listeners ---

// Botón para volver a la página de autenticación
if (backToAuthButton) {
    backToAuthButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Botón para alternar entre mis servicios y todos los servicios
if (toggleMyServicesButton) {
    toggleMyServicesButton.addEventListener('click', () => {
        showingMyServices = !showingMyServices; // Cambiar el estado
        toggleMyServicesButton.textContent = showingMyServices ? 'Ver Todos los Servicios' : 'Ver Mis Servicios';
        loadServices(); // Volver a cargar los servicios con el nuevo filtro
    });
}


// Formulario de creación de servicio
if (createServiceForm) {
    createServiceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (createServiceMessage) createServiceMessage.style.display = 'none';
        if (createServiceErrorMessage) createServiceErrorMessage.style.display = 'none';

        const token = getAuthToken();
        if (!token) {
            if (createServiceErrorMessage) showMessage(createServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
            return;
        }

        const serviceData = {
            title: serviceTitleInput.value,
            description: serviceDescriptionInput.value,
            price: parseFloat(servicePriceInput.value),
            category: serviceCategoryInput.value
        };

        try {
            const response = await fetch(`${SERVICE_SERVICE_URL}/services/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData)
            });

            if (response.status === 401) {
                throw new Error('No autorizado. Token inválido o expirado.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado. Solo freelancers pueden crear servicios.');
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const newService = await response.json();
            if (createServiceMessage) showMessage(createServiceMessage, `Servicio "${newService.title}" creado con éxito!`, false);
            createServiceForm.reset(); // Limpiar formulario
            loadServices(); // Recargar la lista
        } catch (error) {
            console.error('Error al crear servicio:', error);
            if (createServiceErrorMessage) showMessage(createServiceErrorMessage, `Error al crear servicio: ${error.message}`, true);
        }
    });
}


// Formulario de actualización de servicio
if (updateServiceForm) {
    updateServiceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (manageServiceMessage) manageServiceMessage.style.display = 'none';
        if (manageServiceErrorMessage) manageServiceErrorMessage.style.display = 'none';

        const token = getAuthToken();
        if (!token) {
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
            return;
        }

        const updatedData = {
            title: updateServiceTitleInput.value,
            description: updateServiceDescriptionInput.value,
            price: parseFloat(updateServicePriceInput.value),
            category: updateServiceCategoryInput.value
        };

        try {
            const response = await fetch(`${SERVICE_SERVICE_URL}/services/${currentServiceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.status === 401) {
                throw new Error('No autorizado. Token inválido o expirado.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado. No tienes permiso para actualizar este servicio.');
            }
            if (response.status === 404) {
                throw new Error('Servicio no encontrado.');
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const updatedService = await response.json();
            if (manageServiceMessage) showMessage(manageServiceMessage, `Servicio "${updatedService.title}" actualizado con éxito!`, false);
            hideManageService(); // Volver a la lista
        } catch (error) {
            console.error('Error al actualizar servicio:', error);
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, `Error al actualizar servicio: ${error.message}`, true);
        }
    });
}


// Botón de eliminar servicio
if (deleteServiceButton) {
    deleteServiceButton.addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            return;
        }

        if (manageServiceMessage) manageServiceMessage.style.display = 'none';
        if (manageServiceErrorMessage) manageServiceErrorMessage.style.display = 'none';

        const token = getAuthToken();
        if (!token) {
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
            return;
        }

        try {
            const response = await fetch(`${SERVICE_SERVICE_URL}/services/${currentServiceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                throw new Error('No autorizado. Token inválido o expirado.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado. No tienes permiso para eliminar este servicio.');
            }
            if (response.status === 404) {
                throw new Error('Servicio no encontrado.');
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            if (manageServiceMessage) showMessage(manageServiceMessage, 'Servicio eliminado con éxito!', false);
            hideManageService(); // Volver a la lista
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, `Error al eliminar servicio: ${error.message}`, true);
        }
    });
}


// Botón de cancelar gestión
if (cancelManageButton) {
    cancelManageButton.addEventListener('click', hideManageService);
}

// Asegurarse de que el usuario esté autenticado y cargar servicios al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuthAndRole(); // Esto ya redirige si no hay token o está expirado
    if (user) {
        loadServices(); // Solo cargar servicios si el usuario está autenticado y su token es válido
    }
});
