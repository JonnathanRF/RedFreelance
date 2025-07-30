// RedFreelance/frontend/js/notification.js

const customNotification = document.getElementById('customNotification');
const notificationIcon = document.getElementById('notificationIcon');
const notificationMessage = document.getElementById('notificationMessage');
const closeNotificationButton = document.getElementById('closeNotification');

let notificationTimeout; // Variable para almacenar el timeout de auto-ocultado

/**
 * Muestra una notificación personalizada en la esquina inferior derecha.
 * @param {string} message - El mensaje a mostrar en la notificación.
 * @param {'success' | 'error' | 'warning' | 'info'} type - El tipo de notificación para el icono y el estilo.
 * @param {number} [duration=3000] - Cuánto tiempo debe ser visible la notificación en milisegundos (predeterminado: 3000ms).
 */
export function showNotification(message, type = 'info', duration = 3000) { // <-- ¡Añadido 'export'!
    // Asegurarse de que el elemento de notificación existe
    if (!customNotification) {
        console.error('Elemento de notificación (#customNotification) no encontrado en el DOM.');
        // Fallback a alert nativo si el elemento no está presente (aunque no debería pasar si el HTML está bien)
        alert(message); // Usar alert() solo como último recurso para depuración, no en producción
        return;
    }

    // Limpiar cualquier timeout existente para evitar solapamientos
    clearTimeout(notificationTimeout);

    // 1. Resetear clases de animación y asegurar el estado inicial para la animación de entrada
    customNotification.classList.remove('notification-show', 'notification-hide');
    customNotification.style.display = 'flex'; // Asegurarse de que sea visible para la animación
    customNotification.style.transform = 'translateY(100%)'; // Estado inicial: fuera de la vista
    customNotification.style.opacity = '0'; // Estado inicial: invisible

    // Configurar el icono y el color de fondo según el tipo
    let icon = '';
    let bgColorClass = 'bg-gray-900'; // Default Tailwind class
    switch (type) {
        case 'success':
            icon = '✅';
            bgColorClass = 'bg-green-700';
            break;
        case 'error':
            icon = '❌';
            bgColorClass = 'bg-red-700';
            break;
        case 'warning':
            icon = '⚠️';
            bgColorClass = 'bg-yellow-700';
            break;
        case 'info':
        default:
            icon = 'ℹ️';
            bgColorClass = 'bg-blue-700';
            break;
    }

    notificationIcon.textContent = icon;
    notificationMessage.textContent = message;

    // Remover clases de color anteriores y añadir la nueva
    customNotification.classList.remove('bg-gray-900', 'bg-green-700', 'bg-red-700', 'bg-yellow-700', 'bg-blue-700');
    customNotification.classList.add(bgColorClass);

    // 2. Forzar un "repaint" y luego aplicar la clase que activa la animación de entrada.
    // Esto es crucial para que el navegador reconozca el estado inicial antes de la transición.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { // Doble requestAnimationFrame para mayor fiabilidad
            customNotification.classList.add('notification-show');
        });
    });

    // 3. Establecer un timeout para ocultar la notificación automáticamente
    notificationTimeout = setTimeout(() => {
        hideNotification();
    }, duration);
}

/**
 * Oculta la notificación con animación.
 */
function hideNotification() {
    if (!customNotification) return; // Salir si el elemento no existe

    customNotification.classList.remove('notification-show');
    customNotification.classList.add('notification-hide');

    // Ocultar completamente el elemento (display: none) después de que la animación de salida termine
    // La duración de la transición es de 500ms (0.5s) en el CSS (definido en base.css)
    setTimeout(() => {
        customNotification.style.display = 'none'; // Finalmente ocultar el elemento
        // Resetear la posición y opacidad para la próxima vez que se muestre
        customNotification.style.transform = 'translateY(100%)';
        customNotification.style.opacity = '0';
    }, 500); // Coincide con la duración de la transición CSS
}

// Event listener para el botón de cerrar
if (closeNotificationButton) {
    closeNotificationButton.addEventListener('click', () => {
        hideNotification();
        // Limpiar el timeout si el usuario cierra la notificación manualmente
        clearTimeout(notificationTimeout);
    });
}

// Lógica para verificar y mostrar notificaciones persistentes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que la notificación esté oculta al cargar la página inicialmente
    // Esto es importante para que la animación de entrada funcione correctamente la primera vez.
    if (customNotification) {
        customNotification.style.display = 'none';
        customNotification.style.transform = 'translateY(100%)';
        customNotification.style.opacity = '0';
        customNotification.classList.remove('notification-show', 'notification-hide');
    }

    // Verificar si hay una notificación pendiente en localStorage
    const pendingNotification = localStorage.getItem('pendingNotification');
    if (pendingNotification) {
        try {
            const { message, type, duration } = JSON.parse(pendingNotification);
            // Mostrar la notificación con los datos recuperados
            showNotification(message, type, duration);
        } catch (e) {
            console.error("Error al parsear la notificación pendiente de localStorage:", e);
        } finally {
            // Siempre limpiar el localStorage después de intentar mostrarla
            localStorage.removeItem('pendingNotification');
        }
    }
});
