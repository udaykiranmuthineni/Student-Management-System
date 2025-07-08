const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, 'students.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load students from file
function loadStudents() {
  if (!fs.existsSync(dataFile)) return [];
  const raw = fs.readFileSync(dataFile);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save students to file
function saveStudents(students) {
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
}

// Generate unique student ID like 7072025
function generateStudentId() {
  const rand = Math.floor(Math.random() * 1000) + 1;
  const now = new Date();
  return `${rand}${now.getMonth() + 1}${now.getFullYear()}`;
}

// GET all students
app.get('/students', (req, res) => {
  const students = loadStudents();
  res.json(students);
});

// POST new student
app.post('/students', (req, res) => {
  const students = loadStudents();
  const { name, dob, sex } = req.body;

  const exists = students.some(s => s.name === name && s.dob === dob && s.sex === sex);
  if (exists) return res.status(409).json({ message: 'Student already exists' });

  req.body.id = generateStudentId();
  students.push(req.body);
  saveStudents(students);

  res.status(201).json({ message: 'Student added', student: req.body });
});

// PUT update student
app.put('/students/:id', (req, res) => {
  let students = loadStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Student not found' });

  students[index] = { ...students[index], ...req.body };
  saveStudents(students);
  res.json({ message: 'Student updated', student: students[index] });
});

// DELETE student
app.delete('/students/:id', (req, res) => {
  const students = loadStudents();
  const filtered = students.filter(s => s.id !== req.params.id);
  if (filtered.length === students.length) return res.status(404).json({ message: 'Student not found' });

  saveStudents(filtered);
  res.json({ message: 'Student deleted' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
