// RedFreelance/frontend/js/confirmModal.js

const customConfirmModal = document.getElementById('customConfirmModal');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalMessage = document.getElementById('confirmModalMessage');
const confirmModalYesButton = document.getElementById('confirmModalYes');
const confirmModalNoButton = document.getElementById('confirmModalNo');

let resolvePromise; // Para almacenar la función resolve de la promesa

/**
 * Muestra un modal de confirmación personalizado.
 * @param {string} title - El título del modal.
 * @param {string} message - El mensaje de la pregunta de confirmación.
 * @returns {Promise<boolean>} Una promesa que se resuelve con true si el usuario confirma (Sí), o false si cancela (No).
 */
export function showConfirmModal(title, message) { // <-- ¡Añadido 'export' aquí!
    return new Promise((resolve) => {
        // Almacenar la función resolve para usarla cuando se haga clic en Sí/No
        resolvePromise = resolve;

        // Establecer el título y el mensaje del modal
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;

        // Asegurarse de que el modal esté en su estado inicial oculto antes de mostrarlo
        customConfirmModal.classList.remove('modal-show');
        customConfirmModal.style.opacity = '0';
        customConfirmModal.querySelector('div').style.transform = 'scale(0.95)'; // El div interno

        // Mostrar el modal y aplicar la animación
        customConfirmModal.classList.remove('hidden'); // Hacerlo visible (display: flex)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { // Doble requestAnimationFrame para asegurar la transición
                customConfirmModal.classList.add('modal-show');
            });
        });
    });
}

/**
 * Oculta el modal de confirmación.
 */
function hideConfirmModal() {
    customConfirmModal.classList.remove('modal-show');
    // Después de la animación de salida, ocultar completamente el elemento
    setTimeout(() => {
        customConfirmModal.classList.add('hidden');
    }, 300); // Coincide con la duración de la transición de opacidad
}

// Event listeners para los botones del modal
if (confirmModalYesButton) {
    confirmModalYesButton.addEventListener('click', () => {
        hideConfirmModal();
        if (resolvePromise) {
            resolvePromise(true); // Resolver la promesa con true (confirmado)
        }
    });
}

if (confirmModalNoButton) {
    confirmModalNoButton.addEventListener('click', () => {
        hideConfirmModal();
        if (resolvePromise) {
            resolvePromise(false); // Resolver la promesa con false (cancelado)
        }
    });
}

// Opcional: Cerrar el modal si se hace clic fuera de él (en el fondo oscuro)
if (customConfirmModal) {
    customConfirmModal.addEventListener('click', (event) => {
        // Si el clic fue directamente en el contenedor del modal (el fondo), no en su contenido
        if (event.target === customConfirmModal) {
            hideConfirmModal();
            if (resolvePromise) {
                resolvePromise(false); // Considerar como cancelado si se cierra haciendo clic fuera
            }
        }
    });
}

// Asegurarse de que el modal esté oculto al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (customConfirmModal) {
        customConfirmModal.classList.add('hidden');
        customConfirmModal.style.opacity = '0';
        customConfirmModal.querySelector('div').style.transform = 'scale(0.95)';
    }
});
