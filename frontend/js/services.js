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
const listServicesSection = document.getElementById('listServicesSection');
const listServicesMessage = document.getElementById('listServicesMessage');

const manageServiceSection = document.getElementById('manageServiceSection');
const manageServiceIdSpan = document.getElementById('manageServiceId');
const updateServiceForm = document.getElementById('updateServiceForm');
const updateServiceTitleInput = document.getElementById('updateServiceTitle');
const updateServiceDescriptionInput = document.getElementById('updateServiceDescription');
const updateServicePriceInput = document.getElementById('updateServicePrice');
const updateServiceCategoryInput = document.getElementById('updateServiceCategory');
const updateServiceButton = document.getElementById('updateServiceButton');
const deleteServiceButton = document.getElementById('deleteServiceButton');
const cancelManageButton = document.getElementById('cancelManageButton');
const manageServiceMessage = document.getElementById('manageServiceMessage');
const manageServiceErrorMessage = document.getElementById('manageServiceErrorMessage');

// NUEVOS ELEMENTOS PARA FILTRADO
const servicesListTitle = document.getElementById('servicesListTitle');
const toggleMyServicesButton = document.createElement('button');
toggleMyServicesButton.id = 'toggleMyServicesButton';
toggleMyServicesButton.textContent = 'Ver Mis Servicios';
toggleMyServicesButton.style.marginTop = '10px';
toggleMyServicesButton.style.marginBottom = '20px';
toggleMyServicesButton.style.backgroundColor = '#007bff';
toggleMyServicesButton.style.color = 'white';
toggleMyServicesButton.style.padding = '10px 15px';
toggleMyServicesButton.style.border = 'none';
toggleMyServicesButton.style.borderRadius = '5px';
toggleMyServicesButton.style.cursor = 'pointer';
toggleMyServicesButton.style.transition = 'background-color 0.2s ease';
toggleMyServicesButton.onmouseover = () => toggleMyServicesButton.style.backgroundColor = '#0056b3';
toggleMyServicesButton.onmouseout = () => toggleMyServicesButton.style.backgroundColor = '#007bff';

const hrElement = document.querySelector('.container hr');
if (hrElement && hrElement.nextElementSibling) {
    hrElement.parentNode.insertBefore(toggleMyServicesButton, hrElement.nextElementSibling);
} else if (hrElement) {
    hrElement.parentNode.appendChild(toggleMyServicesButton);
}


let currentServiceId = null;
let showingMyServices = false;

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

    if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub;
    if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

    // Retornar el objeto con los datos del usuario decodificados
    return {
        email: decodedToken.sub,
        role: decodedToken.role,
        user_id: decodedToken.user_id
    };
}

// Función para cargar y mostrar servicios (ahora recibe currentUser como argumento)
async function loadServices(currentUser, filterCategory = null) { // Aceptar currentUser y filterCategory
    if (listServicesMessage) listServicesMessage.style.display = 'none';
    if (servicesList) servicesList.innerHTML = '';
    if (noServicesMessage) noServicesMessage.style.display = 'none';

    let url = `${SERVICE_SERVICE_URL}/services/`;
    let titleText = 'Todos los Servicios Disponibles';

    // Priorizar el filtro de categoría si existe
    if (filterCategory) {
        url += `?category=${encodeURIComponent(filterCategory)}`;
        titleText = `Servicios en: ${decodeURIComponent(filterCategory)}`;
        if (toggleMyServicesButton) toggleMyServicesButton.style.display = 'none'; // Ocultar si hay filtro de categoría
    } else {
        // Si no hay filtro de categoría, verificar si se deben mostrar "Mis Servicios"
        if (currentUser && currentUser.role === 'freelancer' && showingMyServices) {
            url = `${SERVICE_SERVICE_URL}/services/my/`;
            titleText = 'Mis Servicios Publicados';
            if (toggleMyServicesButton) toggleMyServicesButton.textContent = 'Ver Todos los Servicios';
        } else {
            // Mostrar todos los servicios
            url = `${SERVICE_SERVICE_URL}/services/`;
            titleText = 'Todos los Servicios Disponibles';
            if (toggleMyServicesButton) toggleMyServicesButton.textContent = 'Ver Mis Servicios';
        }
        // Mostrar el botón de alternar si el usuario es freelancer o admin y no hay filtro de categoría
        if (toggleMyServicesButton && (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin'))) {
            toggleMyServicesButton.style.display = 'block';
        } else if (toggleMyServicesButton) {
            toggleMyServicesButton.style.display = 'none';
        }
    }

    if (servicesListTitle) servicesListTitle.textContent = titleText;

    try {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token && (url.includes('/services/my/') || (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin')))) {
             headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers: headers });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('No autorizado para ver esta sección. Por favor, inicie sesión como freelancer.');
                localStorage.removeItem('accessToken');
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
                    manageButton.onclick = () => showManageService(service, currentUser); // Pasar currentUser
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

// Función para mostrar el formulario de gestionar servicio (recibe currentUser)
function showManageService(service, currentUser) {
    currentServiceId = service.id;
    if (manageServiceIdSpan) manageServiceIdSpan.textContent = service.id;
    if (updateServiceTitleInput) updateServiceTitleInput.value = service.title;
    if (updateServiceDescriptionInput) updateServiceDescriptionInput.value = service.description;
    if (updateServicePriceInput) updateServicePriceInput.value = service.price;
    if (updateServiceCategoryInput) updateServiceCategoryInput.value = service.category;

    if (createServiceSection) createServiceSection.style.display = 'none';
    if (listServicesSection) listServicesSection.style.display = 'none';
    if (manageServiceSection) manageServiceSection.style.display = 'block';
    
    if (toggleMyServicesButton) {
        toggleMyServicesButton.style.display = 'none';
    }

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

// Función para ocultar el formulario de gestionar y volver a la lista (recibe currentUser)
function hideManageService(currentUser) {
    currentServiceId = null;
    if (manageServiceSection) manageServiceSection.style.display = 'none';
    if (createServiceSection) createServiceSection.style.display = (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin')) ? 'block' : 'none';
    if (listServicesSection) listServicesSection.style.display = 'block';
    
    if (toggleMyServicesButton && (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin'))) {
        toggleMyServicesButton.style.display = 'block';
    }

    loadServices(currentUser); // Pasar currentUser al recargar
}

// --- Event Listeners ---

if (backToAuthButton) {
    backToAuthButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

if (toggleMyServicesButton) {
    toggleMyServicesButton.addEventListener('click', () => {
        showingMyServices = !showingMyServices;
        // El texto del botón se actualizará en loadServices
        const currentUser = checkAuthAndRole(); // Obtener el usuario actual para pasarlo
        if (currentUser) {
            loadServices(currentUser);
        }
    });
}


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
            createServiceForm.reset();
            const currentUser = checkAuthAndRole(); // Re-obtener currentUser
            if (currentUser) {
                loadServices(currentUser); // Pasar currentUser
            }
        } catch (error) {
            console.error('Error al crear servicio:', error);
            if (createServiceErrorMessage) showMessage(createServiceErrorMessage, `Error al crear servicio: ${error.message}`, true);
        }
    });
}


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
            const currentUser = checkAuthAndRole(); // Re-obtener currentUser
            if (currentUser) {
                hideManageService(currentUser); // Pasar currentUser
            }
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
            const currentUser = checkAuthAndRole(); // Re-obtener currentUser
            if (currentUser) {
                hideManageService(currentUser); // Pasar currentUser
            }
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            if (manageServiceErrorMessage) showMessage(manageServiceErrorMessage, `Error al eliminar servicio: ${error.message}`, true);
        }
    });
}


// Botón de cancelar gestión
if (cancelManageButton) {
    cancelManageButton.addEventListener('click', () => {
        const currentUser = checkAuthAndRole(); // Re-obtener currentUser
        if (currentUser) {
            hideManageService(currentUser); // Pasar currentUser
        }
    });
}

// Asegurarse de que el usuario esté autenticado y cargar servicios al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuthAndRole(); // Esto ya redirige si no hay token o está expirado
    if (user) {
        // Obtener la categoría de la URL si existe (para el filtrado desde la landing page)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('category');
        loadServices(user, categoryFilter); // Pasar el objeto 'user' y el filtro de categoría
    }
});
