const STORAGE_KEY = 'studyPlannerTasks';
let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error('Unable to load tasks from localStorage:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function addTask(event) {
  if (event) {
    event.preventDefault();
  }

  const form = document.getElementById('task-form');
  if (!form) {
    return;
  }

  const taskNameInput = document.getElementById('taskName');
  const subjectInput = document.getElementById('subject');
  const taskDateInput = document.getElementById('taskDate');
  const priorityInput = document.getElementById('priority');

  const name = taskNameInput.value.trim();
  const subject = subjectInput.value.trim();
  const date = taskDateInput.value;
  const priority = priorityInput.value;

  if (!name || !subject || !date || !priority) {
    alert('Please fill in all required fields before adding a task.');
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    name,
    subject,
    date,
    priority,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  form.reset();
  renderTasks();
  updateStats();
  updateProgress();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
  updateStats();
  updateProgress();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
  updateStats();
  updateProgress();
}

function getVisibleTasks() {
  if (currentFilter === 'pending') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  if (!taskList) {
    return;
  }

  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">No study tasks yet. Add your first task!</div>';
    return;
  }

  taskList.innerHTML = visibleTasks
    .map((task) => {
      const priorityClass = `priority-${task.priority.toLowerCase()}`;
      const statusClass = task.completed ? 'status-completed' : 'status-pending';
      const statusText = task.completed ? 'Completed' : 'Pending';
      const completeButtonText = task.completed ? 'Mark Pending' : 'Complete';

      return `
        <article class="task-item ${task.completed ? 'completed' : ''}">
          <div class="task-top">
            <div>
              <h3 class="task-name">${escapeHtml(task.name)}</h3>
              <div class="task-meta">
                <span>${escapeHtml(task.subject)}</span>
                <span>•</span>
                <span>${formatDate(task.date)}</span>
              </div>
            </div>
            <div class="task-badges">
              <span class="priority-badge ${priorityClass}">${task.priority}</span>
            </div>
          </div>

          <div class="task-footer">
            <span class="task-status ${statusClass}">${statusText}</span>
            <div class="task-actions">
              <button class="action-btn complete-btn" type="button" data-action="toggle" data-id="${task.id}">
                ${completeButtonText}
              </button>
              <button class="action-btn delete-btn" type="button" data-action="delete" data-id="${task.id}">
                Delete
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  taskList.querySelectorAll('[data-action="toggle"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const taskId = event.currentTarget.dataset.id;
      toggleTask(taskId);
    });
  });

  taskList.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const taskId = event.currentTarget.dataset.id;
      deleteTask(taskId);
    });
  });
}

function updateStats() {
  const totalTasksElement = document.getElementById('totalTasks');
  const completedTasksElement = document.getElementById('completedTasks');
  const pendingTasksElement = document.getElementById('pendingTasks');

  if (!totalTasksElement || !completedTasksElement || !pendingTasksElement) {
    return;
  }

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksElement.textContent = total;
  completedTasksElement.textContent = completed;
  pendingTasksElement.textContent = pending;
}

function updateProgress() {
  const progressValueElement = document.getElementById('progressValue');
  const progressTextElement = document.getElementById('progressText');
  const progressBarElement = document.getElementById('progressBar');

  if (!progressValueElement || !progressTextElement || !progressBarElement) {
    return;
  }

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressValueElement.textContent = `${percentage}%`;
  progressTextElement.textContent = `${percentage}%`;
  progressBarElement.style.width = `${percentage}%`;
}

function filterTasks(filter) {
  currentFilter = filter;

  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
  });

  renderTasks();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initializeDashboard() {
  const form = document.getElementById('task-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', addTask);

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      filterTasks(event.currentTarget.dataset.filter);
    });
  });

  renderTasks();
  updateStats();
  updateProgress();
}

initializeDashboard();
