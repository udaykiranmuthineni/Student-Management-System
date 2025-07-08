const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let editingId = null;

function showLogin() {
  document.getElementById('loginModal').classList.remove('d-none');
}

function closeLogin() {
  document.getElementById('loginModal').classList.add('d-none');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  document.getElementById('loginError').textContent = '';
}

function login() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    document.getElementById('studentFormContainer').style.display = 'none';
    document.getElementById('secureArea').style.display = 'block';
    document.getElementById('loginBtn').classList.add('d-none');
    document.getElementById('logoutBtn').classList.remove('d-none');
    closeLogin();
    loadStudents();
  } else {
    document.getElementById('loginError').textContent = '❌ Invalid credentials.';
  }
}

function logout() {
  editingId = null;
  document.getElementById('studentForm').reset();
  document.getElementById('secureArea').style.display = 'none';
  document.getElementById('studentFormContainer').style.display = 'block';
  document.getElementById('logoutBtn').classList.add('d-none');
  document.getElementById('loginBtn').classList.remove('d-none');
  document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
  document.getElementById('cancelEditBtn')?.classList.add('d-none');
}

async function loadStudents() {
  const list = document.getElementById('studentList');
  list.innerHTML = '';

  let students = [];

  const stored = localStorage.getItem('students');
  if (stored && stored !== '[]') {
    students = JSON.parse(stored);
  } else {
    try {
      const res = await fetch('students.json');
      if (!res.ok) throw new Error("students.json not found");
      students = await res.json();
      localStorage.setItem('students', JSON.stringify(students));
    } catch (err) {
      console.error("Error loading students.json:", err);
      list.innerHTML = '<li class="text-danger">❌ Failed to load students.json</li>';
      return;
    }
  }

  students.forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${s.name}</strong> (ID: ${s.id}, Gender: ${s.sex})`;

    const btnGroup = document.createElement('div');

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'btn btn-sm btn-outline-primary me-2';
    editBtn.onclick = () => populateForm(s);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.onclick = () => deleteStudent(s.id);

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    li.appendChild(info);
    li.appendChild(btnGroup);
    list.appendChild(li);
  });
}

function populateForm(student) {
  editingId = student.id;
  document.getElementById('studentFormContainer').style.display = 'block';
  document.getElementById('secureArea').style.display = 'none';

  for (const key in student) {
    if (document.getElementById(key)) {
      document.getElementById(key).value = student[key] || '';
    }
  }

  document.querySelector('#studentForm button[type="submit"]').textContent = '💾 Save';
  document.getElementById('cancelEditBtn')?.classList.remove('d-none');
  showMessage('✏️ Now editing this student', 'warning');
}

function cancelEdit() {
  editingId = null;
  const form = document.getElementById('studentForm');
  form.reset();
  document.getElementById('studentFormContainer').style.display = 'none';
  document.getElementById('secureArea').style.display = 'block';
  document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
  document.getElementById('cancelEditBtn')?.classList.add('d-none');
}

function showMessage(msg, type = 'info') {
  const box = document.getElementById('messageBox');
  box.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => (box.innerHTML = ''), 3000);
}

function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  let students = JSON.parse(localStorage.getItem('students') || '[]');
  students = students.filter(s => s.id !== id);
  localStorage.setItem('students', JSON.stringify(students));

  showMessage('🗑️ Student deleted!', 'danger');
  loadStudents();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');

  form?.addEventListener('submit', e => {
    e.preventDefault();

    const student = {};
    form.querySelectorAll('input, select').forEach(input => {
      if (input.id) student[input.id] = input.value.trim();
    });

    let students = JSON.parse(localStorage.getItem('students') || '[]');

    if (editingId) {
      const index = students.findIndex(s => s.id === editingId);
      if (index !== -1) students[index] = student;
      showMessage('✅ Student updated', 'success');
    } else {
      if (students.find(s => s.id === student.id)) {
        showMessage('⚠️ Student already exists!', 'warning');
        return;
      }
      students.push(student);
      showMessage('✅ Student added', 'success');
    }

    localStorage.setItem('students', JSON.stringify(students));
    form.reset();
    editingId = null;
    document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
    document.getElementById('cancelEditBtn')?.classList.add('d-none');
    document.getElementById('studentFormContainer').style.display = 'none';
    document.getElementById('secureArea').style.display = 'block';
    loadStudents();
  });
});
