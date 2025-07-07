const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// ✅ Your actual MongoDB URI (replace password if different)
const mongoURI = 'mongodb+srv://admin:admin123@cluster0.ak6mdqf.mongodb.net/studentDB?retryWrites=true&w=majority&appName=Cluster0';


// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schema
const studentSchema = new mongoose.Schema({
  id: String, // Custom ID format (ex: 7072025)
  name: String,
  dob: String,
  sex: String,
  no: String,
  email: String,
  address: String,
  class: String,
  section: String,
  admissionRoll: String,
  admissionDate: String,
  status: String,
  prevSchool: String,
  father: String,
  mother: String,
  guardian: String,
  guardianContact: String,
  attendance: String,
  grades: String,
  subjects: String,
  examResults: String
});

const Student = mongoose.model('Student', studentSchema);

// Generate custom ID like 7072025
function generateStudentId() {
  const rand = Math.floor(Math.random() * 1000) + 1;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return `${rand}${month}${year}`;
}

// GET all students
app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// POST student
app.post('/students', async (req, res) => {
  const { name, dob, sex } = req.body;

  const exists = await Student.findOne({ name, dob, sex });
  if (exists) {
    return res.status(409).json({ message: 'Student already exists' });
  }

  req.body.id = generateStudentId(); // Auto-generate ID
  const newStudent = new Student(req.body);
  await newStudent.save();

  res.status(201).json({ message: 'Student added', student: newStudent });
});

// PUT student
app.put('/students/:id', async (req, res) => {
  const updated = await Student.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });

  if (!updated) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student updated', student: updated });
});

// DELETE student
app.delete('/students/:id', async (req, res) => {
  const deleted = await Student.findOneAndDelete({ id: req.params.id });

  if (!deleted) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

