// --- PASO 1: Configuración de Firebase (Tus claves y URL ya están aquí) ---
const firebaseConfig = {
  apiKey: "AIzaSyB7NH27RunpBlUDSBcpSi6nT_eumLw1TAw",
  authDomain: "ring-ring-97dc2.firebaseapp.com",
  projectId: "ring-ring-97dc2",
  storageBucket: "ring-ring-97dc2.appspot.com",
  messagingSenderId: "906912446745",
  appId: "1:906912446745:web:28db2dfde2916ac89d2d88",
  measurementId: "G-SB0PP2X1EP",
  // ¡URL confirmada y añadida desde tu captura de pantalla!
  databaseURL: "https://ring-ring-97dc2-default-rtdb.firebaseio.com"
};

// --- Inicialización de Firebase ---
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tasksRef = database.ref('tasks');


// --- PASO 2: Referencias a los elementos del DOM (los objetos de la página) ---
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListContainer = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');


// --- PASO 3: Funciones Principales ---

/**
 * Dibuja un nuevo recordatorio en la pantalla.
 * @param {string} taskKey - La clave única de la tarea en Firebase.
 * @param {string} taskText - El texto del recordatorio.
 */
function renderTask(taskKey, taskText) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.key = taskKey;

    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    taskHeader.innerHTML = `
        <span class="task-title">${taskText}</span>
        <div class="task-actions">
            <button class="edit-btn"><i class="fa-solid fa-pencil"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';
    taskDetails.innerHTML = `<p>Aquí puedes añadir más detalles, notas o subtareas.</p>`;

    taskItem.appendChild(taskHeader);
    taskItem.appendChild(taskDetails);
    
    taskListContainer.appendChild(taskItem);
}

/**
 * Guarda una nueva tarea en la base de datos de Firebase.
 */
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    tasksRef.push({
        text: taskText,
        createdAt: Date.now()
    });
    
    taskInput.value = '';
    taskInput.focus();
}

/**
 * Maneja todos los clics que ocurren en la lista de tareas.
 * Decide si expandir, editar o eliminar un recordatorio.
 */
function handleTaskListClick(event) {
    const clickedElement = event.target;
    const taskItem = clickedElement.closest('.task-item');
    if (!taskItem) return;

    const taskKey = taskItem.dataset.key;

    // Acción: ELIMINAR
    if (clickedElement.closest('.delete-btn')) {
        if (confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
            database.ref('tasks/' + taskKey).remove();
        }
    }
    // Acción: EDITAR
    else if (clickedElement.closest('.edit-btn')) {
        const titleElement = taskItem.querySelector('.task-title');
        const currentText = titleElement.textContent;
        const newText = prompt('Edita tu recordatorio:', currentText);

        if (newText && newText.trim() !== '' && newText !== currentText) {
            database.ref('tasks/' + taskKey).update({ text: newText });
        }
    }
    // Acción: EXPANDIR / COLAPSAR
    else {
        taskItem.classList.toggle('expanded');
    }
}

/**
 * Filtra los recordatorios en tiempo real según el texto de búsqueda.
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


// --- PASO 4: Event Listeners (Ponen a "escuchar" los botones y campos) ---
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') addTask();
});
taskListContainer.addEventListener('click', handleTaskListClick);
searchInput.addEventListener('input', filterTasks);


// --- PASO 5: Listeners de Firebase (La magia del tiempo real) ---

// Se ejecuta cuando se añade una nueva tarea a la base de datos.
tasksRef.on('child_added', (snapshot) => {
    const task = snapshot.val();
    renderTask(snapshot.key, task.text);
});

// Se ejecuta cuando se elimina una tarea de la base de datos.
tasksRef.on('child_removed', (snapshot) => {
    const removedTask = document.querySelector(`[data-key="${snapshot.key}"]`);
    if (removedTask) {
        removedTask.remove();
    }
});

// Se ejecuta cuando una tarea cambia (se edita).
tasksRef.on('child_changed', (snapshot) => {
    const changedTaskElement = document.querySelector(`[data-key="${snapshot.key}"]`);
    if (changedTaskElement) {
        const taskData = snapshot.val();
        changedTaskElement.querySelector('.task-title').textContent = taskData.text;
    }
});

