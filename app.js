// --- PASO 1: Configuración de Firebase (lo llenarás después) ---
// const firebaseConfig = {
//     apiKey: "TU_API_KEY",
//     authDomain: "TU_AUTH_DOMAIN",
//     projectId: "TU_PROJECT_ID",
//     storageBucket: "TU_STORAGE_BUCKET",
//     messagingSenderId: "TU_MESSAGING_SENDER_ID",
//     appId: "TU_APP_ID",
//     databaseURL: "TU_DATABASE_URL" // ¡Importante!
// };

// // Inicializar Firebase
// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();
// const tasksRef = database.ref('tasks');


// --- PASO 2: Referencias a los elementos del DOM ---
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListContainer = document.getElementById('task-list');


// --- PASO 3: Funciones ---

/**
 * Crea el HTML para un nuevo recordatorio y lo añade a la lista.
 * @param {string} taskText - El texto del recordatorio.
 */
function renderTask(taskKey, taskText) {
    // Crear el contenedor principal del recordatorio
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.key = taskKey; // Guardamos la clave de Firebase

    // Crear el encabezado visible
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    taskHeader.textContent = taskText;

    // Crear los detalles que se expanden
    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';
    taskDetails.innerHTML = `
        <p>Aquí puedes añadir más detalles, notas o subtareas.</p>
        <button class="delete-btn">Eliminar</button>
    `;

    // Unir las partes
    taskItem.appendChild(taskHeader);
    taskItem.appendChild(taskDetails);
    
    // Añadir el recordatorio completo al contenedor en la página
    taskListContainer.appendChild(taskItem);
}


/**
 * Función para añadir una nueva tarea a la base de datos de Firebase.
 */
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        alert('Por favor, escribe un recordatorio.');
        return;
    }

    // Código SIN Firebase (para probar ahora)
    // Descomenta esto si quieres probar sin la base de datos
    renderTask('local-key-' + Date.now(), taskText);


    // Código CON Firebase (lo activarás después)
    // tasksRef.push({
    //     text: taskText,
    //     createdAt: Date.now()
    // });
    
    taskInput.value = ''; // Limpiar el campo de texto
    taskInput.focus();
}


/**
 * Maneja los clics en la lista de tareas.
 * Se encarga de expandir/colapsar o eliminar.
 * @param {Event} event - El objeto del evento de clic.
 */
function handleTaskListClick(event) {
    const clickedElement = event.target;
    
    // Si se hizo clic en el botón de eliminar
    if (clickedElement.classList.contains('delete-btn')) {
        const taskItem = clickedElement.closest('.task-item');
        const taskKey = taskItem.dataset.key;
        
        // Código CON Firebase para eliminar (lo activarás después)
        // database.ref('tasks/' + taskKey).remove();
        
        // Código SIN Firebase (para probar ahora)
        taskItem.remove();

    } else {
        // Si se hizo clic en cualquier otra parte del rectángulo, se expande/colapsa
        const taskItem = clickedElement.closest('.task-item');
        if (taskItem) {
            taskItem.classList.toggle('expanded');
        }
    }
}


// --- PASO 4: Event Listeners ---
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
taskListContainer.addEventListener('click', handleTaskListClick);


// --- PASO 5: Listener de Firebase para mostrar tareas ---
// tasksRef.on('child_added', (snapshot) => {
//     const task = snapshot.val();
//     renderTask(snapshot.key, task.text);
// });

// tasksRef.on('child_removed', (snapshot) => {
//     const removedTask = document.querySelector(`[data-key="${snapshot.key}"]`);
//     if (removedTask) {
//         removedTask.remove();
//     }
// });