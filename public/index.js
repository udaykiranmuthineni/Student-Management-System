const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let editingId = null;

// Show login modal
function showLogin() {
  document.getElementById('loginModal').classList.remove('d-none');
}

// Hide login modal
function closeLogin() {
  document.getElementById('loginModal').classList.add('d-none');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  document.getElementById('loginError').textContent = '';
}

// Handle login
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

// Handle logout
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

// Load students from server
async function loadStudents() {
  const list = document.getElementById('studentList');
  list.innerHTML = '';

  const res = await fetch('/students');
  const students = await res.json();

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

// Fill form for editing
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

// Cancel editing
function cancelEdit() {
  editingId = null;
  const form = document.getElementById('studentForm');
  form.reset();
  document.getElementById('studentFormContainer').style.display = 'none';
  document.getElementById('secureArea').style.display = 'block';
  document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
  document.getElementById('cancelEditBtn')?.classList.add('d-none');
}

// Show alerts
function showMessage(msg, type = 'info') {
  const box = document.getElementById('messageBox');
  box.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => (box.innerHTML = ''), 3000);
}

// Delete student
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  const res = await fetch(`/students/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    showMessage('🗑️ Student deleted!', 'danger');
    loadStudents();
  } else {
    showMessage('❌ Error deleting student', 'danger');
  }
}

// Handle form submit
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const student = {};
    form.querySelectorAll('input, select').forEach(input => {
      if (input.id) {
        student[input.id] = input.value.trim();
      }
    });

    if (editingId) {
      const res = await fetch(`/students/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });

      if (res.ok) {
        showMessage('✅ Student updated', 'success');
        form.reset();
        editingId = null;
        document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
        document.getElementById('cancelEditBtn')?.classList.add('d-none');
        document.getElementById('studentFormContainer').style.display = 'none';
        document.getElementById('secureArea').style.display = 'block';
        loadStudents();
      } else {
        showMessage('❌ Failed to update student', 'danger');
      }
    } else {
      const res = await fetch('/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });

      const result = await res.json();

      if (res.status === 409) {
        showMessage('⚠️ Student already exists!', 'warning');
      } else if (res.ok) {
        showMessage('✅ Student added', 'success');
        form.reset();
        loadStudents();
      } else {
        showMessage('❌ Failed to add student', 'danger');
      }
    }
  });
});

