// RedFreelance/frontend/js/services.js

// Importar funciones de utilidad para notificaciones y modales
import { showNotification } from './notification.js';
import { showConfirmModal } from './confirmModal.js';

const SERVICE_API_URL = 'http://localhost:8001'; // URL del microservicio de servicios
const AUTH_API_URL = 'http://localhost:8000'; // URL del microservicio de autenticación
const CATEGORY_API_URL = 'http://localhost:8001'; // URL del microservicio de categorías (asumimos el mismo que services)

// Elementos de la UI
const userEmailDisplay = document.getElementById('userEmailDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const backToAuthButton = document.getElementById('backToAuthButton');

const createServiceSection = document.getElementById('createServiceSection');
const createServiceForm = document.getElementById('createServiceForm');
const serviceTitleInput = document.getElementById('serviceTitle');
const serviceDescriptionInput = document.getElementById('serviceDescription');
const servicePriceInput = document.getElementById('servicePrice');

// Nuevos elementos para el dropdown personalizado de creación
const createCategorySearchInput = document.getElementById('createCategorySearchInput');
const createSelectedCategoriesDisplay = document.getElementById('createSelectedCategoriesDisplay');
const createCategoryOptionsList = document.getElementById('createCategoryOptionsList');

const servicesList = document.getElementById('servicesList');
const noServicesMessage = document.getElementById('noServicesMessage');

const manageServiceSection = document.getElementById('manageServiceSection');
const updateServiceForm = document.getElementById('updateServiceForm');
const updateServiceTitleInput = document.getElementById('updateServiceTitle');
const updateServiceDescriptionInput = document.getElementById('updateServiceDescription');
const updateServicePriceInput = document.getElementById('updateServicePrice');
const manageServiceIdDisplay = document.getElementById('manageServiceId');

// Nuevos elementos para el dropdown personalizado de actualización
const updateCategorySearchInput = document.getElementById('updateCategorySearchInput');
const updateSelectedCategoriesDisplay = document.getElementById('updateSelectedCategoriesDisplay'); // Esta línea se mantiene
const updateCategoryOptionsList = document.getElementById('updateCategoryOptionsList');

const deleteServiceButton = document.getElementById('deleteServiceButton');
const cancelManageButton = document.getElementById('cancelManageButton');

let currentServiceId = null; // Para almacenar el ID del servicio que se está gestionando
let allCategories = []; // Para almacenar todas las categorías disponibles

/**
 * Verifica el token de autenticación del usuario y su rol.
 * Si no hay token o es inválido, redirige a la página de autenticación.
 * @returns {object|null} El usuario decodificado si es válido, de lo contrario null.
 */
function checkAuthAndRole() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showNotification('No autenticado. Redirigiendo al login.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirige a la página de autenticación
        }, 1500);
        return null;
    }

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));

        const userEmail = decodedPayload.sub;
        const userRole = decodedPayload.role;
        const userId = decodedPayload.id; // <--- ¡NUEVO! Obtener el ID del usuario

        if (userEmailDisplay) userEmailDisplay.textContent = userEmail;
        if (userRoleDisplay) userRoleDisplay.textContent = userRole;

        showNotification('Inicio de sesión exitoso!', 'success'); // Muestra la notificación aquí

        return { email: userEmail, role: userRole, token: token, id: userId }; // <--- ¡NUEVO! Devolver el ID
    } catch (error) {
        console.error('Error decodificando el token:', error);
        showNotification('Token inválido. Redirigiendo al login.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirige a la página de autenticación
        }, 1500);
        return null;
    }
}

/**
 * Carga las categorías disponibles desde el backend.
 */
async function loadCategories() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${CATEGORY_API_URL}/categories/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        allCategories = await response.json();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        showNotification(`Error al cargar categorías: ${error.message}`, 'error');
    }
}

/**
 * Configura los dropdowns de categoría personalizados.
 * @param {HTMLElement} searchInput - El input de búsqueda del dropdown.
 * @param {HTMLElement} selectedDisplay - El contenedor para mostrar las categorías seleccionadas.
 * @param {HTMLElement} optionsList - El contenedor para las opciones de categoría.
 * @param {Array<string>} initialSelectedCategories - Categorías seleccionadas inicialmente.
 * @returns {Array<string>} Un array que contendrá las categorías seleccionadas.
 */
function setupCategoryDropdown(searchInput, selectedDisplay, optionsList, initialSelectedCategories = []) {
    let selectedCategories = [...initialSelectedCategories];

    // Función para renderizar las categorías seleccionadas
    const renderSelectedCategories = () => {
        selectedDisplay.innerHTML = '';
        if (selectedCategories.length === 0) {
            selectedDisplay.innerHTML = '<span class="text-gray-400">Ninguna categoría seleccionada.</span>';
        } else {
            selectedCategories.forEach(catName => {
                const tag = document.createElement('span');
                tag.className = 'selected-category-tag-display';
                tag.innerHTML = `
                    ${catName}
                    <button type="button" class="remove-tag-btn" data-category="${catName}">&times;</button>
                `;
                tag.querySelector('.remove-tag-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitar que el clic se propague al input
                    selectedCategories = selectedCategories.filter(c => c !== catName);
                    renderSelectedCategories();
                    renderCategoryOptions(); // Actualizar la lista de opciones
                });
                selectedDisplay.appendChild(tag);
            });
        }
    };

    // Función para renderizar las opciones de categoría
    const renderCategoryOptions = (filter = '') => {
        optionsList.innerHTML = '';
        const filteredCategories = allCategories.filter(cat =>
            cat.name.toLowerCase().includes(filter.toLowerCase()) &&
            !selectedCategories.includes(cat.name)
        );

        if (filteredCategories.length === 0 && filter !== '') {
            const noResults = document.createElement('div');
            noResults.className = 'category-option text-gray-500 cursor-default';
            noResults.textContent = 'No se encontraron categorías.';
            optionsList.appendChild(noResults);
        } else if (filteredCategories.length === 0 && filter === '') {
             const noResults = document.createElement('div');
             noResults.className = 'category-option text-gray-500 cursor-default';
             noResults.textContent = 'No hay categorías disponibles.';
             optionsList.appendChild(noResults);
        } else {
            filteredCategories.forEach(cat => {
                const option = document.createElement('div');
                option.className = 'category-option';
                option.textContent = cat.name;
                option.dataset.categoryId = cat.id; // Almacenar el ID de la categoría
                option.addEventListener('click', () => {
                    if (!selectedCategories.includes(cat.name)) {
                        selectedCategories.push(cat.name);
                        renderSelectedCategories();
                        searchInput.value = ''; // Limpiar el input después de seleccionar
                        optionsList.style.display = 'none'; // Ocultar la lista de opciones
                        renderCategoryOptions(); // Actualizar la lista de opciones
                    }
                });
                optionsList.appendChild(option);
            });
        }
        optionsList.style.display = filteredCategories.length > 0 || filter !== '' ? 'block' : 'none';
    };

    // Event listeners
    searchInput.addEventListener('input', (e) => renderCategoryOptions(e.target.value));
    searchInput.addEventListener('focus', () => renderCategoryOptions(searchInput.value));
    searchInput.addEventListener('blur', (e) => {
        // Retrasar el ocultamiento para permitir clics en las opciones
        setTimeout(() => {
            if (!optionsList.contains(document.activeElement)) {
                optionsList.style.display = 'none';
            }
        }, 100);
    });

    // Clic fuera para cerrar el dropdown
    document.addEventListener('click', (e) => {
        if (!searchInput.closest('.category-custom-dropdown-container')?.contains(e.target) &&
            !optionsList.contains(e.target)) {
            optionsList.style.display = 'none';
        }
    });

    renderSelectedCategories();
    renderCategoryOptions();

    // Devolver el array para que pueda ser accedido desde fuera
    return selectedCategories;
}

let createFormSelectedCategories = [];
let updateFormSelectedCategories = [];

async function setupCategoryDropdowns() {
    await loadCategories(); // Cargar categorías al inicio
    if (createCategorySearchInput && createSelectedCategoriesDisplay && createCategoryOptionsList) {
        createFormSelectedCategories = setupCategoryDropdown(
            createCategorySearchInput,
            createSelectedCategoriesDisplay,
            createCategoryOptionsList
        );
    }
    if (updateCategorySearchInput && updateSelectedCategoriesDisplay && updateCategoryOptionsList) {
        updateFormSelectedCategories = setupCategoryDropdown(
            updateCategorySearchInput,
            updateSelectedCategoriesDisplay,
            updateCategoryOptionsList
        );
    }
}


/**
 * Muestra u oculta la sección de creación de servicios.
 * @param {object} user - El objeto de usuario autenticado.
 */
function toggleCreateServiceSection(user) {
    if (createServiceSection) {
        if (user && (user.role === 'freelancer' || user.role === 'admin')) {
            createServiceSection.classList.remove('hidden');
        } else {
            createServiceSection.classList.add('hidden');
        }
    }
}

/**
 * Oculta la sección de gestión de servicios y muestra la lista.
 * @param {object} user - El objeto de usuario autenticado.
 */
function hideManageService(user) {
    if (manageServiceSection) manageServiceSection.classList.add('hidden');
    // Asumiendo que listServicesSection es el contenedor de la lista de servicios
    const listServicesSection = document.getElementById('listServicesSection'); // Asegúrate de que este ID exista en tu HTML
    if (listServicesSection) listServicesSection.classList.remove('hidden');
    currentServiceId = null;
    loadServices(user); // Recargar la lista de servicios
}

/**
 * Muestra la sección de gestión de servicios y oculta la lista.
 * @param {object} service - El objeto de servicio a gestionar.
 */
function showManageService(service) {
    const listServicesSection = document.getElementById('listServicesSection'); // Asegúrate de que este ID exista en tu HTML
    if (listServicesSection) listServicesSection.classList.add('hidden');
    if (manageServiceSection) manageServiceSection.classList.remove('hidden');

    currentServiceId = service.id;
    if (manageServiceIdDisplay) manageServiceIdDisplay.textContent = service.id;
    if (updateServiceTitleInput) updateServiceTitleInput.value = service.title;
    if (updateServiceDescriptionInput) updateServiceDescriptionInput.value = service.description;
    if (updateServicePriceInput) updateServicePriceInput.value = service.price;

    // Reiniciar y configurar el dropdown de actualización con las categorías del servicio
    updateFormSelectedCategories = setupCategoryDropdown(
        updateCategorySearchInput,
        updateSelectedCategoriesDisplay,
        updateCategoryOptionsList,
        service.categories.map(cat => cat.name) // Pasar solo los nombres de las categorías
    );
}

/**
 * Carga y muestra la lista de servicios.
 * @param {object} user - El objeto de usuario autenticado.
 * @param {string|null} categoryFilter - ID de la categoría para filtrar, o null para no filtrar.
 */
async function loadServices(user, categoryFilter = null) {
    if (!user) return;

    if (servicesList) servicesList.innerHTML = ''; // Limpiar lista existente
    if (noServicesMessage) noServicesMessage.classList.add('hidden'); // Ocultar mensaje de no servicios

    let apiUrl = `${SERVICE_API_URL}/services/`;
    if (user.role === 'freelancer' || user.role === 'admin') {
        apiUrl = `${SERVICE_API_URL}/services/my/`;
    }

    // Si hay un filtro de categoría, añadirlo a la URL
    if (categoryFilter) {
        apiUrl += `?category_id=${categoryFilter}`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const services = await response.json();

        if (services.length === 0) {
            if (noServicesMessage) noServicesMessage.classList.remove('hidden');
            return;
        }

        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600 flex flex-col justify-between transition-transform duration-200 hover:scale-105';
            serviceCard.innerHTML = `
                <h4 class="text-xl font-bold text-teal-300 mb-2">${service.title}</h4>
                <p class="text-gray-300 text-sm mb-3">${service.description}</p>
                <p class="text-lg font-semibold text-green-400 mb-2">$${parseFloat(service.price).toFixed(2)}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${service.categories.map(cat => `<span class="category-tag">${cat.name}</span>`).join('')}
                </div>
                ${(user.role === 'freelancer' || user.role === 'admin') && service.owner_id === user.id ? `
                    <button class="manage-service-btn bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors duration-200 mt-auto" data-service-id="${service.id}">Gestionar</button>
                ` : ''}
            `;
            if (servicesList) servicesList.appendChild(serviceCard);
        });

        // Añadir event listeners a los botones de gestionar
        document.querySelectorAll('.manage-service-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const serviceId = e.target.dataset.serviceId;
                try {
                    const response = await fetch(`${SERVICE_API_URL}/services/${serviceId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
                    }
                    const serviceToManage = await response.json();
                    showManageService(serviceToManage);
                } catch (error) {
                    console.error('Error al cargar servicio para gestionar:', error);
                    showNotification(`Error al cargar servicio: ${error.message}`, 'error');
                }
            });
        });

    } catch (error) {
        console.error('Error al cargar servicios:', error);
        showNotification(`Error al cargar servicios: ${error.message}`, 'error');
    }
}

// Event Listeners
if (backToAuthButton) {
    backToAuthButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken'); // Limpiar token al volver
        window.location.href = 'index.html';
    });
}

if (createServiceForm) {
    createServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = checkAuthAndRole();
        if (!user) return;

        const title = serviceTitleInput.value;
        const description = serviceDescriptionInput.value;
        const price = parseFloat(servicePriceInput.value);

        // Obtener los IDs de las categorías seleccionadas
        const selectedCategoryIds = createFormSelectedCategories.map(catName => {
            const category = allCategories.find(c => c.name === catName);
            return category ? category.id : null;
        }).filter(id => id !== null);

        if (selectedCategoryIds.length === 0) {
            showNotification('Por favor, selecciona al menos una categoría.', 'error');
            return;
        }

        try {
            const response = await fetch(`${SERVICE_API_URL}/services/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    category_ids: selectedCategoryIds // Enviar los IDs de las categorías
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            showNotification('Servicio creado con éxito!', 'success');
            createServiceForm.reset();
            createFormSelectedCategories = setupCategoryDropdown( // Resetear el dropdown de categorías
                createCategorySearchInput,
                createSelectedCategoriesDisplay,
                createCategoryOptionsList
            );
            loadServices(user); // Recargar la lista de servicios
        } catch (error) {
            console.error('Error al crear servicio:', error);
            showNotification(`Error al crear servicio: ${error.message}`, 'error');
        }
    });
}

if (updateServiceForm) {
    updateServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = checkAuthAndRole();
        if (!user || !currentServiceId) return;

        const title = updateServiceTitleInput.value;
        const description = updateServiceDescriptionInput.value;
        const price = parseFloat(updateServicePriceInput.value);

        // Obtener los IDs de las categorías seleccionadas para la actualización
        const selectedCategoryIds = updateFormSelectedCategories.map(catName => {
            const category = allCategories.find(c => c.name === catName);
            return category ? category.id : null;
        }).filter(id => id !== null);

        if (selectedCategoryIds.length === 0) {
            showNotification('Por favor, selecciona al menos una categoría para actualizar.', 'error');
            return;
        }

        try {
            const response = await fetch(`${SERVICE_API_URL}/services/${currentServiceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    category_ids: selectedCategoryIds // Enviar los IDs de las categorías
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            showNotification('Servicio actualizado con éxito!', 'success');
            hideManageService(user); // Volver a la lista de servicios
        } catch (error) {
            console.error('Error al actualizar servicio:', error);
            showNotification(`Error al actualizar servicio: ${error.message}`, 'error');
        }
    });
}

if (deleteServiceButton) {
    deleteServiceButton.addEventListener('click', async () => {
        if (!currentServiceId) return;

        const confirm = await showConfirmModal('Confirmar Eliminación', '¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.');

        if (confirm) {
            const user = checkAuthAndRole();
            if (!user) return;

            try {
                const response = await fetch(`${SERVICE_API_URL}/services/${currentServiceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (response.status === 404) {
                    throw new Error('Servicio no encontrado.');
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
                }

                showNotification('Servicio eliminado con éxito!', 'success');
                hideManageService(user); // Volver a la lista de servicios
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                showNotification(`Error al eliminar servicio: ${error.message}`, 'error');
            }
        } else {
            showNotification('Eliminación de servicio cancelada.', 'info');
        }
    });
}

if (cancelManageButton) {
    cancelManageButton.addEventListener('click', () => {
        const currentUser = checkAuthAndRole();
        if (currentUser) {
            hideManageService(currentUser);
        }
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuthAndRole();
    if (user) {
        toggleCreateServiceSection(user);
        setupCategoryDropdowns(); // Configurar los nuevos dropdowns
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('category_id'); // Ahora se espera category_id
        loadServices(user, categoryFilter);
    }
});
