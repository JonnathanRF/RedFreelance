    // RedFreelance/frontend/js/landing.js

    const SERVICE_SERVICE_URL = 'http://localhost:8001';
    const categoriesList = document.getElementById('categoriesList');
    const loadingCategories = document.getElementById('loadingCategories');
    const noCategories = document.getElementById('noCategories');

    async function loadLandingCategories() {
        if (loadingCategories) loadingCategories.classList.remove('hidden');
        if (noCategories) noCategories.classList.add('hidden');
        if (categoriesList) categoriesList.innerHTML = ''; // Limpiar contenido previo

        try {
            const response = await fetch(`${SERVICE_SERVICE_URL}/landing-categories/`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();

            if (loadingCategories) loadingCategories.classList.add('hidden');

            if (data.length === 0) {
                if (noCategories) noCategories.classList.remove('hidden');
            } else {
                data.forEach(categoryData => {
                    const categoryCard = document.createElement('div');
                    categoryCard.classList.add(
                        'category-card', 'bg-gray-700', 'p-6', 'rounded-xl', 'shadow-lg',
                        'border', 'border-gray-600', 'flex', 'flex-col', 'items-center',
                        'text-center', 'cursor-pointer'
                    );
                    // Icono de categoría (puedes usar Font Awesome o Lucide React si los incluyes)
                    // Por ahora, un simple emoji o placeholder
                    categoryCard.innerHTML = `
                        <div class="text-5xl mb-4 text-teal-300">✨</div> 
                        <h3 class="text-2xl font-bold text-teal-400 mb-4">${categoryData.category}</h3>
                        <p class="text-gray-300 mb-4">${categoryData.sample_services.length > 0 ? 'Servicios destacados:' : 'No hay servicios en esta categoría.'}</p>
                        <ul class="list-none p-0 m-0 w-full">
                            ${categoryData.sample_services.map(service => `
                                <li class="bg-gray-600 p-3 rounded-lg mb-2 text-sm text-gray-200 border border-gray-500">
                                    <strong>${service.title}</strong> - $${service.price.toFixed(2)} (ID: ${service.freelancer_id})
                                </li>
                            `).join('')}
                        </ul>
                        <button class="mt-6 bg-blue-500 text-white py-2 px-6 rounded-full font-semibold hover:bg-blue-600 transition-all duration-200 ease-in-out active:scale-95">
                            Ver más en ${categoryData.category}
                        </button>
                    `;
                    
                    categoryCard.addEventListener('click', () => {
                        window.location.href = `services.html?category=${encodeURIComponent(categoryData.category)}`;
                    });
                    categoryCard.querySelector('button').addEventListener('click', (event) => {
                        event.stopPropagation();
                        window.location.href = `services.html?category=${encodeURIComponent(categoryData.category)}`;
                    });


                    if (categoriesList) categoriesList.appendChild(categoryCard);
                });
            }
        } catch (error) {
            console.error('Error al cargar categorías para la landing page:', error);
            // Usar showNotification para errores de carga de categorías
            showNotification(`Error al cargar categorías: ${error.message}`, 'error');
            if (loadingCategories) loadingCategories.classList.add('hidden');
            if (noCategories) noCategories.classList.remove('hidden');
            if (noCategories) noCategories.textContent = `Error al cargar categorías: ${error.message}`; // Mantener el mensaje en el elemento también
        }
    }

    document.addEventListener('DOMContentLoaded', loadLandingCategories);
    