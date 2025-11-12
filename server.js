const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database initialization
const db = new sqlite3.Database('./events.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE NOT NULL,
    event_name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    venue TEXT,
    max_participants INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating events table:', err.message);
    }
  });

  // Registrations table
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating registrations table:', err.message);
    }
  });
}

// Helper function to check time overlap
function checkTimeOverlap(newStartDate, newEndDate, newStartTime, newEndTime, excludeEventId = null) {
  return new Promise((resolve, reject) => {
    // Get all events (except the one being updated if applicable)
    let query = `SELECT * FROM events`;
    const params = [];
    
    if (excludeEventId) {
      query += ` WHERE event_id != ?`;
      params.push(excludeEventId);
    }

    db.all(query, params, (err, existingEvents) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert new event dates and times to comparable format
      const newStart = new Date(newStartDate + 'T' + newStartTime);
      const newEnd = new Date(newEndDate + 'T' + newEndTime);

      // Check overlap with each existing event
      for (const event of existingEvents) {
        const existingStart = new Date(event.start_date + 'T' + event.start_time);
        const existingEnd = new Date(event.end_date + 'T' + event.end_time);

        // Two events overlap if: newStart < existingEnd AND newEnd > existingStart
        if (newStart < existingEnd && newEnd > existingStart) {
          resolve(true);
          return;
        }
      }

      resolve(false);
    });
  });
}

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY start_date, start_time', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single event
app.get('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  db.get('SELECT * FROM events WHERE event_id = ?', [eventId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.json(row);
    }
  });
});

// Create new event
app.post('/api/events', async (req, res) => {
  const { event_id, event_name, description, start_date, end_date, start_time, end_time, venue, max_participants } = req.body;

  // Validation
  if (!event_id || !event_name || !start_date || !end_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate date and time ordering
  const startDateTime = new Date(start_date + 'T' + start_time);
  const endDateTime = new Date(end_date + 'T' + end_time);
  
  if (startDateTime >= endDateTime) {
    return res.status(400).json({ error: 'Start date/time must be before end date/time' });
  }

  // Check for time overlap
  try {
    const hasOverlap = await checkTimeOverlap(start_date, end_date, start_time, end_time);
    if (hasOverlap) {
      return res.status(400).json({ error: 'Event time overlaps with existing event' });
    }

    db.run(
      `INSERT INTO events (event_id, event_name, description, start_date, end_date, start_time, end_time, venue, max_participants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_id, event_name, description, start_date, end_date, start_time, end_time, venue, max_participants],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Event ID already exists' });
          } else {
            res.status(500).json({ error: err.message });
          }
        } else {
          res.json({ id: this.lastID, message: 'Event created successfully' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
app.put('/api/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  const { event_name, description, start_date, end_date, start_time, end_time, venue, max_participants } = req.body;

  // Validate date and time ordering
  const startDateTime = new Date(start_date + 'T' + start_time);
  const endDateTime = new Date(end_date + 'T' + end_time);
  
  if (startDateTime >= endDateTime) {
    return res.status(400).json({ error: 'Start date/time must be before end date/time' });
  }

  try {
    const hasOverlap = await checkTimeOverlap(start_date, end_date, start_time, end_time, eventId);
    if (hasOverlap) {
      return res.status(400).json({ error: 'Event time overlaps with existing event' });
    }

    db.run(
      `UPDATE events SET event_name = ?, description = ?, start_date = ?, end_date = ?, 
       start_time = ?, end_time = ?, venue = ?, max_participants = ? WHERE event_id = ?`,
      [event_name, description, start_date, end_date, start_time, end_time, venue, max_participants, eventId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Event not found' });
        } else {
          res.json({ message: 'Event updated successfully' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
app.delete('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  db.run('DELETE FROM events WHERE event_id = ?', [eventId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.json({ message: 'Event deleted successfully' });
    }
  });
});

// Register for event
app.post('/api/events/:eventId/register', (req, res) => {
  const eventId = req.params.eventId;
  const { user_name, user_email, user_phone } = req.body;

  if (!user_name || !user_email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if event exists and get max participants
  db.get('SELECT * FROM events WHERE event_id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already registered
    db.get('SELECT * FROM registrations WHERE event_id = ? AND user_email = ?', [eventId, user_email], (err, existing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (existing) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Check max participants
      if (event.max_participants) {
        db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (result.count >= event.max_participants) {
            return res.status(400).json({ error: 'Event is full' });
          }

          // Register user
          db.run(
            'INSERT INTO registrations (event_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?)',
            [eventId, user_name, user_email, user_phone],
            function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
              } else {
                res.json({ id: this.lastID, message: 'Registration successful' });
              }
            }
          );
        });
      } else {
        // No limit, register directly
        db.run(
          'INSERT INTO registrations (event_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?)',
          [eventId, user_name, user_email, user_phone],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.json({ id: this.lastID, message: 'Registration successful' });
            }
          }
        );
      }
    });
  });
});

// Get registrations for an event
app.get('/api/events/:eventId/registrations', (req, res) => {
  const eventId = req.params.eventId;
  db.all('SELECT * FROM registrations WHERE event_id = ? ORDER BY registration_date DESC', [eventId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get registration count for an event
app.get('/api/events/:eventId/registrations/count', (req, res) => {
  const eventId = req.params.eventId;
  db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ count: row.count });
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

