const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const customCategoryInput = document.getElementById('customCategoryInput');
const dueDateInput = document.getElementById('dueDateInput');
const dueTimeInput = document.getElementById('dueTimeInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const sortSelect = document.getElementById('sortSelect');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editTaskId = null; // To keep track of which task is being edited

init();

taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const task = {
        id: editTaskId || Date.now(), // Use existing ID if editing
        text: taskInput.value,
        category: customCategoryInput.value,
        dueDate: dueDateInput.value,
        dueTime: dueTimeInput.value,
        priority: prioritySelect.value,
        completed: false
    };

    if (editTaskId) {
        // Update existing task
        tasks = tasks.map(t => t.id === editTaskId ? task : t);
        editTaskId = null; // Reset after editing
    } else {
        // Add new task
        tasks.push(task);
    }

    addTaskToDOM(task);
    updateLocalStorage();

    taskInput.value = '';
    customCategoryInput.value = '';
    dueDateInput.value = '';
    dueTimeInput.value = '';
    prioritySelect.value = 'High'; // Reset to default
});

// Add task to the DOM
function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.classList.add(`priority-${task.priority.toLowerCase()}`);
    if (task.completed) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        ${task.text} <span>[${task.category}] - ${task.priority} | Due: ${new Date(task.dueDate + ' ' + task.dueTime).toLocaleString()}</span>
        <button class="edit" onclick="editTask(${task.id})">Edit</button>
        <button class="delete" onclick="removeTask(${task.id})">x</button>
        <button class="complete" onclick="toggleComplete(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
    `;

    taskList.appendChild(li);

    // Add category to filter options if not already present
    if (!Array.from(categoryFilter.options).some(option => option.value === task.category)) {
        const option = document.createElement('option');
        option.value = task.category;
        option.textContent = task.category;
        categoryFilter.appendChild(option);
    }
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        taskInput.value = task.text;
        customCategoryInput.value = task.category;
        dueDateInput.value = task.dueDate;
        dueTimeInput.value = task.dueTime;
        prioritySelect.value = task.priority;
        
        editTaskId = id; // Set the ID of the task being edited
    }
}

// Remove task
function removeTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    updateLocalStorage();
    init();
}

// Toggle task completion
function toggleComplete(id) {
    const task = tasks.find(task => task.id === id);
    task.completed = !task.completed;
    updateLocalStorage();
    init();
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize app
function init() {
    taskList.innerHTML = '';
    tasks.forEach(addTaskToDOM);
}

// Filter tasks
categoryFilter.addEventListener('change', filterTasks);
priorityFilter.addEventListener('change', filterTasks);
sortSelect.addEventListener('change', sortTasks);

function filterTasks() {
    const category = categoryFilter.value;
    const priority = priorityFilter.value;

    taskList.innerHTML = '';
    tasks.forEach(task => {
        if ((category === 'All' || task.category === category) &&
            (priority === 'All' || task.priority === priority)) {
            addTaskToDOM(task);
        }
    });
}

// Add sorting functionality
function sortTasks() {
    const sortBy = sortSelect.value;

    if (sortBy === "Date") {
        tasks.sort((a, b) => new Date(a.dueDate + ' ' + a.dueTime) - new Date(b.dueDate + ' ' + b.dueTime));
    } else if (sortBy === "Priority") {
        const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
        tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    
    updateLocalStorage();
    init(); // Re-initialize to reflect sorted tasks
}
