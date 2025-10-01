// --- PASO 1: Configuración de Firebase ---
// PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE. ¡ESTO ES MUY IMPORTANTE!
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
    databaseURL: "LA_URL_DE_TU_REALTIME_DATABASE"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tasksRef = database.ref('tasks');


// --- PASO 2: Referencias a los elementos del DOM ---
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListContainer = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');


// --- PASO 3: Funciones ---

/**
 * Crea el HTML para un nuevo recordatorio y lo añade a la lista.
 * @param {string} taskKey - La clave única de la tarea en Firebase.
 * @param {string} taskText - El texto del recordatorio.
 */
function renderTask(taskKey, taskText) {
    // Crear el contenedor principal del recordatorio
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.key = taskKey; // Guardamos la clave de Firebase

    // Crear el encabezado visible (título y botones)
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    taskHeader.innerHTML = `
        <span class="task-title">${taskText}</span>
        <div class="task-actions">
            <button class="edit-btn"><i class="fa-solid fa-pencil"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;

    // Crear los detalles que se expanden
    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';
    taskDetails.innerHTML = `<p>Detalles adicionales del recordatorio.</p>`;

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
    if (taskText === '') return; // No hacer nada si está vacío

    // Guardar la nueva tarea en Firebase
    tasksRef.push({
        text: taskText,
        createdAt: Date.now()
    });
    
    taskInput.value = '';
    taskInput.focus();
}

/**
 * Maneja los clics en la lista de tareas: expandir, editar o eliminar.
 * @param {Event} event - El objeto del evento de clic.
 */
function handleTaskListClick(event) {
    const clickedElement = event.target;
    const taskItem = clickedElement.closest('.task-item');
    if (!taskItem) return;

    const taskKey = taskItem.dataset.key;

    // --- ACCIÓN: Eliminar Tarea ---
    if (clickedElement.closest('.delete-btn')) {
        if (confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
            database.ref('tasks/' + taskKey).remove();
        }
    }
    // --- ACCIÓN: Editar Tarea ---
    else if (clickedElement.closest('.edit-btn')) {
        const titleElement = taskItem.querySelector('.task-title');
        const currentText = titleElement.textContent;
        const newText = prompt('Edita tu recordatorio:', currentText);

        if (newText && newText.trim() !== '' && newText !== currentText) {
            // Actualizar la tarea en Firebase
            database.ref('tasks/' + taskKey).update({ text: newText });
        }
    }
    // --- ACCIÓN: Expandir / Colapsar Tarea ---
    else {
        taskItem.classList.toggle('expanded');
    }
}

/**
 * Filtra los recordatorios visibles según el texto en la barra de búsqueda.
 */
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const allTasks = document.querySelectorAll('.task-item');

    allTasks.forEach(task => {
        const title = task.querySelector('.task-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            task.classList.remove('hide');
        } else {
            task.classList.add('hide');
        }
    });
}

// --- PASO 4: Event Listeners ---
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') addTask();
});
taskListContainer.addEventListener('click', handleTaskListClick);
searchInput.addEventListener('input', filterTasks);


// --- PASO 5: Listeners de Firebase (LA CLAVE PARA QUE TODO FUNCIONE ONLINE) ---

// 1. Cuando se añade una tarea nueva en la base de datos
tasksRef.on('child_added', (snapshot) => {
    const task = snapshot.val();
    renderTask(snapshot.key, task.text);
});

// 2. Cuando se elimina una tarea de la base de datos
tasksRef.on('child_removed', (snapshot) => {
    const removedTask = document.querySelector(`[data-key="${snapshot.key}"]`);
    if (removedTask) {
        removedTask.remove();
    }
});

// 3. Cuando una tarea cambia (se edita)
tasksRef.on('child_changed', (snapshot) => {
    const changedTaskElement = document.querySelector(`[data-key="${snapshot.key}"]`);
    if (changedTaskElement) {
        const taskData = snapshot.val();
        changedTaskElement.querySelector('.task-title').textContent = taskData.text;
    }
});
