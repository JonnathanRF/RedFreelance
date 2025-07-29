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

    // Función para mostrar mensajes temporales (ahora usa showNotification)
    function showMessage(element, message, isError = false) {
        // Ocultar los elementos de mensaje HTML antiguos
        if (element) {
            element.classList.add('hidden');
        }
        // Usar la nueva función showNotification
        if (isError) {
            showNotification(message, 'error');
        } else {
            showNotification(message, 'success');
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
            showNotification('No autenticado. Por favor, inicie sesión.', 'error'); // Reemplaza alert
            window.location.href = 'index.html';
            return null;
        }

        const decodedToken = decodeJwt(token);
        if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
            showNotification('Sesión expirada. Por favor, inicie sesión nuevamente.', 'warning'); // Reemplaza alert
            localStorage.removeItem('accessToken');
            window.location.href = 'index.html';
            return null;
        }

        if (userEmailDisplay) userEmailDisplay.textContent = decodedToken.sub;
        if (userRoleDisplay) userRoleDisplay.textContent = decodedToken.role;

        return {
            email: decodedToken.sub,
            role: decodedToken.role,
            user_id: decodedToken.user_id
        };
    }

    // Función para cargar y mostrar servicios (ahora recibe currentUser como argumento)
    async function loadServices(currentUser, filterCategory = null) {
        if (listServicesMessage) listServicesMessage.classList.add('hidden'); // Usa classList.add('hidden')
        if (servicesList) servicesList.innerHTML = '';
        if (noServicesMessage) noServicesMessage.classList.add('hidden'); // Usa classList.add('hidden')

        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('category');

        let url = `${SERVICE_SERVICE_URL}/services/`;
        let titleText = 'Todos los Servicios Disponibles';

        if (categoryFilter) {
            url += `?category=${encodeURIComponent(categoryFilter)}`;
            titleText = `Servicios en: ${decodeURIComponent(categoryFilter)}`;
            if (toggleMyServicesButton) toggleMyServicesButton.classList.add('hidden'); // Usa classList.add('hidden')
        } else {
            if (currentUser && currentUser.role === 'freelancer' && showingMyServices) {
                url = `${SERVICE_SERVICE_URL}/services/my/`;
                titleText = 'Mis Servicios Publicados';
                if (toggleMyServicesButton) toggleMyServicesButton.textContent = 'Ver Todos los Servicios';
            } else {
                url = `${SERVICE_SERVICE_URL}/services/`;
                titleText = 'Todos los Servicios Disponibles';
                if (toggleMyServicesButton) toggleMyServicesButton.textContent = 'Ver Mis Servicios';
            }
            if (toggleMyServicesButton && (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin'))) {
                toggleMyServicesButton.classList.remove('hidden'); // Usa classList.remove('hidden')
            } else if (toggleMyServicesButton) {
                toggleMyServicesButton.classList.add('hidden'); // Usa classList.add('hidden')
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
                    showNotification('No autorizado para ver esta sección. Por favor, inicie sesión como freelancer.', 'error'); // Reemplaza alert
                    localStorage.removeItem('accessToken');
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const services = await response.json();

            if (services.length === 0) {
                if (noServicesMessage) noServicesMessage.classList.remove('hidden'); // Usa classList.remove('hidden')
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
                    if (currentUser && (currentUser.user_id === service.freelancer_id || currentUser.role === 'admin')) {
                        const manageButton = document.createElement('button');
                        manageButton.textContent = 'Gestionar';
                        manageButton.className = 'manage-button';
                        manageButton.onclick = () => showManageService(service, currentUser);
                        serviceCard.appendChild(manageButton);
                    }
                    if (servicesList) servicesList.appendChild(serviceCard);
                });
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            showMessage(listServicesMessage, `Error al cargar servicios: ${error.message}`, true);
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

        if (createServiceSection) createServiceSection.classList.add('hidden'); // Usa classList.add('hidden')
        if (listServicesSection) listServicesSection.classList.add('hidden'); // Usa classList.add('hidden')
        if (manageServiceSection) manageServiceSection.classList.remove('hidden'); // Usa classList.remove('hidden')
        
        if (toggleMyServicesButton) {
            toggleMyServicesButton.classList.add('hidden'); // Usa classList.add('hidden')
        }

        if (updateServiceButton && deleteServiceButton) {
            if (currentUser && (currentUser.user_id === service.freelancer_id || currentUser.role === 'admin')) {
                updateServiceButton.disabled = false;
                deleteServiceButton.disabled = false;
            } else {
                updateServiceButton.disabled = true;
                deleteServiceButton.disabled = true;
                showMessage(manageServiceErrorMessage, "No tienes permiso para editar/eliminar este servicio.", true);
            }
        }
    }

    // Función para ocultar el formulario de gestionar y volver a la lista (recibe currentUser)
    function hideManageService(currentUser) {
        currentServiceId = null;
        if (manageServiceSection) manageServiceSection.classList.add('hidden'); // Usa classList.add('hidden')
        if (createServiceSection) createServiceSection.classList.remove('hidden'); // Usa classList.remove('hidden')
        if (listServicesSection) listServicesSection.classList.remove('hidden'); // Usa classList.remove('hidden')
        
        if (toggleMyServicesButton && (currentUser && (currentUser.role === 'freelancer' || currentUser.role === 'admin'))) {
            toggleMyServicesButton.classList.remove('hidden'); // Usa classList.remove('hidden')
        }

        loadServices(currentUser); // Recargar la lista para reflejar cambios
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
            const currentUser = checkAuthAndRole();
            if (currentUser) {
                loadServices(currentUser);
            }
        });
    }


    if (createServiceForm) {
        createServiceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (createServiceMessage) createServiceMessage.classList.add('hidden'); // Usa classList.add('hidden')
            if (createServiceErrorMessage) createServiceErrorMessage.classList.add('hidden'); // Usa classList.add('hidden')

            const token = getAuthToken();
            if (!token) {
                showMessage(createServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
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
                showMessage(createServiceMessage, `Servicio "${newService.title}" creado con éxito!`, false);
                createServiceForm.reset();
                const currentUser = checkAuthAndRole();
                if (currentUser) {
                    loadServices(currentUser);
                }
            } catch (error) {
                console.error('Error al crear servicio:', error);
                showMessage(createServiceErrorMessage, `Error al crear servicio: ${error.message}`, true);
            }
        });
    }


    if (updateServiceForm) {
        updateServiceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (manageServiceMessage) manageServiceMessage.classList.add('hidden'); // Usa classList.add('hidden')
            if (manageServiceErrorMessage) manageServiceErrorMessage.classList.add('hidden'); // Usa classList.add('hidden')

            const token = getAuthToken();
            if (!token) {
                showMessage(manageServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
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
                showMessage(manageServiceMessage, `Servicio "${updatedService.title}" actualizado con éxito!`, false);
                const currentUser = checkAuthAndRole();
                if (currentUser) {
                    hideManageService(currentUser);
                }
            } catch (error) {
                console.error('Error al actualizar servicio:', error);
                showMessage(manageServiceErrorMessage, `Error al actualizar servicio: ${error.message}`, true);
            }
        });
    }


    if (deleteServiceButton) {
        deleteServiceButton.addEventListener('click', async () => {
            // Reemplazamos confirm() con showNotification para un mensaje más estético
            // Para una confirmación real, necesitarías un modal personalizado con botones de Sí/No.
            // Por ahora, solo mostraremos una notificación.
            showNotification('Funcionalidad de confirmación de eliminación pendiente de modal personalizado.', 'info', 3000);
            // Si realmente quieres eliminar sin un modal de confirmación, descomenta las siguientes líneas:
            /*
            if (manageServiceMessage) manageServiceMessage.classList.add('hidden');
            if (manageServiceErrorMessage) manageServiceErrorMessage.classList.add('hidden');

            const token = getAuthToken();
            if (!token) {
                showMessage(manageServiceErrorMessage, 'No autenticado. Por favor, inicie sesión.', true);
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

                showMessage(manageServiceMessage, 'Servicio eliminado con éxito!', false);
                const currentUser = checkAuthAndRole();
                if (currentUser) {
                    hideManageService(currentUser);
                }
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                showMessage(manageServiceErrorMessage, `Error al eliminar servicio: ${error.message}`, true);
            }
            */
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

    document.addEventListener('DOMContentLoaded', () => {
        const user = checkAuthAndRole();
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryFilter = urlParams.get('category');
            loadServices(user, categoryFilter);
        }
    });
    