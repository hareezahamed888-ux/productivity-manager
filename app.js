const state = {
  tasks: [],
  notes: [],
  events: {},
  selectedDate: new Date(),
  currentMonth: new Date()
};

const taskForm = document.getElementById('taskForm');
const taskText = document.getElementById('taskText');
const taskDate = document.getElementById('taskDate');
const taskList = document.getElementById('taskList');
const todayTasksCount = document.getElementById('todayTasksCount');

const noteForm = document.getElementById('noteForm');
const noteText = document.getElementById('noteText');
const noteList = document.getElementById('noteList');
const todayNotesCount = document.getElementById('todayNotesCount');

const eventForm = document.getElementById('eventForm');
const eventTitle = document.getElementById('eventTitle');
const eventTime = document.getElementById('eventTime');
const eventDescription = document.getElementById('eventDescription');
const eventDate = document.getElementById('eventDate');
const eventList = document.getElementById('eventList');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const todayEventsCount = document.getElementById('todayEventsCount');

const calendarGrid = document.getElementById('calendarGrid');
const calendarMonth = document.getElementById('calendarMonth');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const installBtn = document.getElementById('installBtn');
const toast = document.getElementById('toast');

let deferredPrompt = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function getStorage() {
  return {
    tasks: JSON.parse(localStorage.getItem('pm-tasks') || '[]'),
    notes: JSON.parse(localStorage.getItem('pm-notes') || '[]'),
    events: JSON.parse(localStorage.getItem('pm-events') || '{}')
  };
}

function saveStorage() {
  localStorage.setItem('pm-tasks', JSON.stringify(state.tasks));
  localStorage.setItem('pm-notes', JSON.stringify(state.notes));
  localStorage.setItem('pm-events', JSON.stringify(state.events));
}

function dateKey(date) {
  return new Date(date).toISOString().split('T')[0];
}

function parseDate(value) {
  return value ? new Date(value) : new Date();
}

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function updateOverview() {
  const today = dateKey(new Date());
  todayTasksCount.textContent = state.tasks.filter(task => task.date === today && !task.completed).length;
  todayNotesCount.textContent = state.notes.filter(note => note.date === today).length;
  todayEventsCount.textContent = (state.events[today] || []).length;
}

function renderTasks() {
  taskList.innerHTML = '';
  if (!state.tasks.length) {
    taskList.innerHTML = '<li class="empty">No tasks yet. Add one for today!</li>';
  }

  state.tasks.sort((a, b) => a.date.localeCompare(b.date) || a.text.localeCompare(b.text));
  state.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    const content = document.createElement('div');
    content.className = 'item-content';
    content.innerHTML = `<strong>${task.text}</strong><p>${task.date}</p>`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Done';
    toggleBtn.onclick = () => toggleTask(task.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => removeTask(task.id);

    actions.append(toggleBtn, deleteBtn);
    li.append(content, actions);
    taskList.appendChild(li);
  });
}

function renderNotes() {
  noteList.innerHTML = '';
  if (!state.notes.length) {
    noteList.innerHTML = '<li class="empty">No notes yet. Write something down!</li>';
  }

  state.notes.sort((a, b) => b.created - a.created).forEach(note => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    content.className = 'item-content';
    content.innerHTML = `<strong>${note.date}</strong><p>${note.text}</p>`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => removeNote(note.id);
    actions.appendChild(deleteBtn);

    li.append(content, actions);
    noteList.appendChild(li);
  });
}

function renderEvents() {
  eventList.innerHTML = '';
  const key = dateKey(state.selectedDate);
  const list = state.events[key] || [];

  selectedDateLabel.textContent = formatDate(key);
  eventDate.value = key;

  if (!list.length) {
    eventList.innerHTML = '<li class="empty">No events for this date. Add one to remember it.</li>';
    return;
  }

  list.sort((a, b) => (a.time || '').localeCompare(b.time || '')).forEach(event => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    content.className = 'item-content';
    content.innerHTML = `<strong>${event.title}</strong><p>${event.time ? `Time: ${event.time}` : 'No time set'}${event.description ? `<br>${event.description}` : ''}</p>`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => removeEvent(key, event.id);
    actions.appendChild(deleteBtn);

    li.append(content, actions);
    eventList.appendChild(li);
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = '';
  const month = state.currentMonth.getMonth();
  const year = state.currentMonth.getFullYear();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarMonth.textContent = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  labels.forEach(label => {
    const cell = document.createElement('div');
    cell.className = 'day-label';
    cell.textContent = label;
    calendarGrid.appendChild(cell);
  });

  for (let i = 0; i < firstWeekday; i += 1) {
    calendarGrid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'day-cell';
    cell.innerHTML = `<span class="day-number">${day}</span>`;

    if (key === dateKey(new Date())) {
      cell.classList.add('today');
    }

    if (key === dateKey(state.selectedDate)) {
      cell.classList.add('active');
    }

    if ((state.events[key] || []).length) {
      const dot = document.createElement('span');
      dot.className = 'event-dot';
      cell.appendChild(dot);
    }

    cell.onclick = () => {
      state.selectedDate = date;
      setSelectedDate(key);
      renderCalendar();
      renderEvents();
    };

    calendarGrid.appendChild(cell);
  }
}

function setSelectedDate(key) {
  state.selectedDate = new Date(key);
  eventDate.value = key;
  selectedDateLabel.textContent = formatDate(key);
}

function addTask(text, date) {
  state.tasks.push({ id: Date.now() + Math.random(), text, date, completed: false });
  saveStorage();
  renderTasks();
  updateOverview();
  showToast('Task added successfully');
}

function toggleTask(id) {
  const task = state.tasks.find(item => item.id === id);
  if (task) {
    task.completed = !task.completed;
    saveStorage();
    renderTasks();
    updateOverview();
  }
}

function removeTask(id) {
  state.tasks = state.tasks.filter(task => task.id !== id);
  saveStorage();
  renderTasks();
  updateOverview();
  showToast('Task removed');
}

function addNote(text) {
  const key = dateKey(new Date());
  state.notes.push({ id: Date.now() + Math.random(), text, date: key, created: Date.now() });
  saveStorage();
  renderNotes();
  updateOverview();
  showToast('Note saved');
}

function removeNote(id) {
  state.notes = state.notes.filter(note => note.id !== id);
  saveStorage();
  renderNotes();
  updateOverview();
  showToast('Note removed');
}

function addEvent(key, title, time, description) {
  state.events[key] = state.events[key] || [];
  state.events[key].push({ id: Date.now() + Math.random(), title, time, description });
  saveStorage();
  renderEvents();
  renderCalendar();
  updateOverview();
  showToast('Event saved');
}

function removeEvent(key, id) {
  state.events[key] = (state.events[key] || []).filter(item => item.id !== id);
  if (!state.events[key].length) {
    delete state.events[key];
  }
  saveStorage();
  renderEvents();
  renderCalendar();
  updateOverview();
  showToast('Event deleted');
}

function initialize() {
  const storage = getStorage();
  state.tasks = storage.tasks;
  state.notes = storage.notes;
  state.events = storage.events;

  const todayKey = dateKey(new Date());
  state.selectedDate = new Date(todayKey);
  state.currentMonth = new Date(todayKey);

  taskDate.value = todayKey;
  eventDate.value = todayKey;
  selectedDateLabel.textContent = formatDate(todayKey);

  renderTasks();
  renderNotes();
  renderCalendar();
  renderEvents();
  updateOverview();
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskText.value.trim();
  const date = taskDate.value;
  if (!text || !date) return;
  addTask(text, date);
  taskText.value = '';
});

noteForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = noteText.value.trim();
  if (!text) return;
  addNote(text);
  noteText.value = '';
});

eventForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = eventTitle.value.trim();
  const time = eventTime.value;
  const description = eventDescription.value.trim();
  const key = eventDate.value;
  if (!title || !key) return;
  addEvent(key, title, time, description);
  eventTitle.value = '';
  eventTime.value = '';
  eventDescription.value = '';
});

eventDate.addEventListener('change', () => {
  const key = eventDate.value;
  state.selectedDate = new Date(key);
  renderCalendar();
  renderEvents();
});

prevMonth.addEventListener('click', () => {
  state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
  renderCalendar();
});

nextMonth.addEventListener('click', () => {
  state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
  renderCalendar();
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.style.display = 'inline-flex';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showToast('App install accepted');
  }
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    console.warn('Service worker registration failed');
  });
}

initialize();
