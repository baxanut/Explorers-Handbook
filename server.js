const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// ── Config ──
const CREW_PASSPHRASE = process.env.CREW_PASSPHRASE || 'explorers14';
const ADMIN_PASSWORD  = process.env.ADMIN_PASSWORD  || 'abhinav123';
const ADMIN_USERNAME  = 'Abhinav';

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ──
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { pins: [], logs: [], missions: [], members: [], paths: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Auth ──
app.post('/api/auth/crew', (req, res) => {
  const { passphrase, name } = req.body;
  if (passphrase !== CREW_PASSPHRASE) return res.status(401).json({ error: 'Wrong passphrase' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });

  const data = readData();
  let member = data.members.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  if (!member) {
    member = { name: name.trim(), joinedAt: new Date().toISOString(), discoveries: 0 };
    data.members.push(member);
    writeData(data);
  }
  res.json({ ok: true, name: member.name, role: 'crew' });
});

app.post('/api/auth/admin', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  res.json({ ok: true, name: ADMIN_USERNAME, role: 'admin' });
});

// ── Pins ──
app.get('/api/pins', (req, res) => res.json(readData().pins));

app.post('/api/pins', (req, res) => {
  const { name, type, notes, x, y, addedBy } = req.body;
  if (!name || !type || x == null || y == null) return res.status(400).json({ error: 'Missing fields' });
  const data = readData();
  const pin = { id: Date.now().toString(), name, type, notes: notes || '', x, y, addedBy: addedBy || 'Unknown', createdAt: new Date().toISOString() };
  data.pins.push(pin);

  // Update member discovery count
  const member = data.members.find(m => m.name === addedBy);
  if (member) member.discoveries = (member.discoveries || 0) + 1;

  writeData(data);
  res.json(pin);
});

app.delete('/api/pins/:id', (req, res) => {
  const data = readData();
  data.pins = data.pins.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// ── Paths ──
app.get('/api/paths', (req, res) => res.json(readData().paths));

app.post('/api/paths', (req, res) => {
  const { name, points, color, addedBy } = req.body;
  if (!points || !points.length) return res.status(400).json({ error: 'Missing points' });
  const data = readData();
  const pathObj = { id: Date.now().toString(), name: name || 'Unnamed Path', points, color: color || '#8B2215', addedBy: addedBy || 'Unknown', createdAt: new Date().toISOString() };
  data.paths.push(pathObj);
  writeData(data);
  res.json(pathObj);
});

app.delete('/api/paths/:id', (req, res) => {
  const data = readData();
  data.paths = data.paths.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// ── Logs ──
app.get('/api/logs', (req, res) => res.json(readData().logs));

app.post('/api/logs', (req, res) => {
  const { title, body, crew, tags, date } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' });
  const data = readData();
  const log = { id: Date.now().toString(), title, body, crew: crew || '', tags: tags || [], date: date || new Date().toISOString(), createdAt: new Date().toISOString() };
  data.logs.unshift(log);
  writeData(data);
  res.json(log);
});

app.delete('/api/logs/:id', (req, res) => {
  const data = readData();
  data.logs = data.logs.filter(l => l.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// ── Missions ──
app.get('/api/missions', (req, res) => res.json(readData().missions));

app.post('/api/missions', (req, res) => {
  const { title, date, crew, destination, gear } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });
  const data = readData();
  const mission = { id: Date.now().toString(), title, date: date || '', crew: crew || '', destination: destination || '', gear: gear || [], status: 'planned', createdAt: new Date().toISOString() };
  data.missions.unshift(mission);
  writeData(data);
  res.json(mission);
});

app.patch('/api/missions/:id', (req, res) => {
  const data = readData();
  const mission = data.missions.find(m => m.id === req.params.id);
  if (!mission) return res.status(404).json({ error: 'Not found' });
  Object.assign(mission, req.body);
  writeData(data);
  res.json(mission);
});

app.delete('/api/missions/:id', (req, res) => {
  const data = readData();
  data.missions = data.missions.filter(m => m.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// ── Members (admin only) ──
app.get('/api/members', (req, res) => res.json(readData().members));

app.delete('/api/members/:name', (req, res) => {
  const data = readData();
  data.members = data.members.filter(m => m.name !== req.params.name);
  writeData(data);
  res.json({ ok: true });
});

// ── Catch-all ──
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`The Explorers Handbook running on port ${PORT}`));
