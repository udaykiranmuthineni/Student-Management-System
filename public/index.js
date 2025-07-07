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
  const error = document.getElementById('loginError');

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    document.getElementById('studentFormContainer').style.display = 'none';
    document.getElementById('secureArea').style.display = 'block';
    document.getElementById('loginBtn').classList.add('d-none');
    document.getElementById('logoutBtn').classList.remove('d-none');
    closeLogin();
    loadStudents();
  } else {
    error.textContent = '❌ Invalid credentials.';
  }
}

// Handle logout
function logout() {
  editingId = null;
  const form = document.getElementById('studentForm');
  form.reset();

  document.getElementById('secureArea').style.display = 'none';
  document.getElementById('studentFormContainer').style.display = 'block';
  document.getElementById('logoutBtn').classList.add('d-none');
  document.getElementById('loginBtn').classList.remove('d-none');

  // Reset button text
  document.querySelector('#studentForm button[type="submit"]').textContent = 'Add Student';
  document.getElementById('cancelEditBtn')?.classList.add('d-none');
}

// Load and display students
async function loadStudents() {
  const list = document.getElementById('studentList');
  if (!list) return;

  const res = await fetch('/students');
  const students = await res.json();

  list.innerHTML = '';

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

// Fill form with student data
function populateForm(student) {
  editingId = student.id;

  const formContainer = document.getElementById('studentFormContainer');
  const listSection = document.getElementById('secureArea');

  formContainer.style.display = 'block';
  listSection.style.display = 'none';

  document.getElementById('id').value = student.id || '';
  document.getElementById('name').value = student.name || '';
  document.getElementById('dob').value = student.dob || '';
  document.getElementById('sex').value = student.sex || '';
  document.getElementById('no').value = student.no || '';
  document.getElementById('email').value = student.email || '';
  document.getElementById('address').value = student.address || '';
  document.getElementById('class').value = student.class || '';
  document.getElementById('section').value = student.section || '';
  document.getElementById('admissionRoll').value = student.admissionRoll || '';
  document.getElementById('admissionDate').value = student.admissionDate || '';
  document.getElementById('status').value = student.status || '';
  document.getElementById('prevSchool').value = student.prevSchool || '';
  document.getElementById('father').value = student.father || '';
  document.getElementById('mother').value = student.mother || '';
  document.getElementById('guardian').value = student.guardian || '';
  document.getElementById('guardianContact').value = student.guardianContact || '';
  document.getElementById('attendance').value = student.attendance || '';
  document.getElementById('grades').value = student.grades || '';
  document.getElementById('subjects').value = student.subjects || '';
  document.getElementById('examResults').value = student.examResults || '';

  document.querySelector('#studentForm button[type="submit"]').textContent = '💾 Save';
  document.getElementById('cancelEditBtn')?.classList.remove('d-none');

  showMessage('✏️ Now editing this student', 'warning');
}

// Delete student
async function deleteStudent(id) {
  const confirmed = confirm("Are you sure you want to delete this student?");
  if (!confirmed) return;

  const res = await fetch(`/students/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-secret': 'admin123' }
  });

  if (res.ok) {
    showMessage('🗑️ Student deleted!', 'danger');
    loadStudents();
  } else {
    showMessage('❌ Error deleting student', 'danger');
  }
}

// Message display
function showMessage(msg, type = 'info') {
  let box = document.getElementById('messageBox');
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => box.innerHTML = '', 3000);
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

// Form submit handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const student = {
      id: document.getElementById('id')?.value.trim(), // include id
      name: document.getElementById('name')?.value.trim(),
      dob: document.getElementById('dob')?.value.trim(),
      sex: document.getElementById('sex')?.value.trim(),
      no: document.getElementById('no')?.value.trim(),
      email: document.getElementById('email')?.value.trim(),
      address: document.getElementById('address')?.value.trim(),
      class: document.getElementById('class')?.value.trim(),
      section: document.getElementById('section')?.value.trim(),
      admissionRoll: document.getElementById('admissionRoll')?.value.trim(),
      admissionDate: document.getElementById('admissionDate')?.value.trim(),
      status: document.getElementById('status')?.value.trim(),
      prevSchool: document.getElementById('prevSchool')?.value.trim(),
      father: document.getElementById('father')?.value.trim(),
      mother: document.getElementById('mother')?.value.trim(),
      guardian: document.getElementById('guardian')?.value.trim(),
      guardianContact: document.getElementById('guardianContact')?.value.trim(),
      attendance: document.getElementById('attendance')?.value.trim(),
      grades: document.getElementById('grades')?.value.trim(),
      subjects: document.getElementById('subjects')?.value.trim(),
      examResults: document.getElementById('examResults')?.value.trim()
    };

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
        return;
      }

      if (res.ok) {
        showMessage('✅ Student added', 'success');
        form.reset();
        loadStudents();
      }
    }
  });
});
