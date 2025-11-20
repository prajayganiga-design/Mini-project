<<<<<<< HEAD
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || "1d";
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/;
=======
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
<<<<<<< HEAD
app.use(express.static("public"));

// Database initialization
const db = new sqlite3.Database("./events.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
=======
app.use(express.static('public'));

// Database initialization
const db = new sqlite3.Database('./events.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Events table
<<<<<<< HEAD
  db.run(
    `CREATE TABLE IF NOT EXISTS events (
=======
  db.run(`CREATE TABLE IF NOT EXISTS events (
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
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
<<<<<<< HEAD
  )`,
    (err) => {
      if (err) {
        console.error("Error creating events table:", err.message);
      }
    }
  );

  // Registrations table
  db.run(
    `CREATE TABLE IF NOT EXISTS registrations (
=======
  )`, (err) => {
    if (err) {
      console.error('Error creating events table:', err.message);
    }
  });

  // Registrations table
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
<<<<<<< HEAD
  )`,
    (err) => {
      if (err) {
        console.error("Error creating registrations table:", err.message);
      }
    }
  );

  // Users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      }
    }
  );
}

// Auth helpers
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
}

function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH &&
    PASSWORD_SPECIAL_REGEX.test(password)
  );
}

// Helper function to check time overlap
function checkTimeOverlap(
  newStartDate,
  newEndDate,
  newStartTime,
  newEndTime,
  excludeEventId = null
) {
=======
  )`, (err) => {
    if (err) {
      console.error('Error creating registrations table:', err.message);
    }
  });
}

// Helper function to check time overlap
function checkTimeOverlap(newStartDate, newEndDate, newStartTime, newEndTime, excludeEventId = null) {
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
  return new Promise((resolve, reject) => {
    // Get all events (except the one being updated if applicable)
    let query = `SELECT * FROM events`;
    const params = [];
<<<<<<< HEAD

=======
    
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
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
<<<<<<< HEAD
      const newStart = new Date(newStartDate + "T" + newStartTime);
      const newEnd = new Date(newEndDate + "T" + newEndTime);

      // Check overlap with each existing event
      for (const event of existingEvents) {
        const existingStart = new Date(
          event.start_date + "T" + event.start_time
        );
        const existingEnd = new Date(event.end_date + "T" + event.end_time);
=======
      const newStart = new Date(newStartDate + 'T' + newStartTime);
      const newEnd = new Date(newEndDate + 'T' + newEndTime);

      // Check overlap with each existing event
      for (const event of existingEvents) {
        const existingStart = new Date(event.start_date + 'T' + event.start_time);
        const existingEnd = new Date(event.end_date + 'T' + event.end_time);
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb

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

<<<<<<< HEAD
// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required" });
    }

    const normalizedRole = role === "participant" ? "user" : role;
    if (!["user", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ error: "Role must be user or admin" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      [email.toLowerCase(), hashedPassword, normalizedRole],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Email already registered" });
          }
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Registration successful" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email.toLowerCase()],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Get all events
app.get("/api/events", (req, res) => {
  db.all(
    "SELECT * FROM events ORDER BY start_date, start_time",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get single event
app.get("/api/events/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  db.get("SELECT * FROM events WHERE event_id = ?", [eventId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: "Event not found" });
=======
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
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    } else {
      res.json(row);
    }
  });
});

// Create new event
<<<<<<< HEAD
app.post("/api/events", authenticateToken, requireAdmin, async (req, res) => {
  const {
    event_id,
    event_name,
    description,
    start_date,
    end_date,
    start_time,
    end_time,
    venue,
    max_participants,
  } = req.body;

  // Validation
  if (
    !event_id ||
    !event_name ||
    !start_date ||
    !end_date ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date and time ordering
  const startDateTime = new Date(start_date + "T" + start_time);
  const endDateTime = new Date(end_date + "T" + end_time);

  if (startDateTime >= endDateTime) {
    return res
      .status(400)
      .json({ error: "Start date/time must be before end date/time" });
=======
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
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
  }

  // Check for time overlap
  try {
<<<<<<< HEAD
    const hasOverlap = await checkTimeOverlap(
      start_date,
      end_date,
      start_time,
      end_time
    );
    if (hasOverlap) {
      return res
        .status(400)
        .json({ error: "Event time overlaps with existing event" });
=======
    const hasOverlap = await checkTimeOverlap(start_date, end_date, start_time, end_time);
    if (hasOverlap) {
      return res.status(400).json({ error: 'Event time overlaps with existing event' });
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    }

    db.run(
      `INSERT INTO events (event_id, event_name, description, start_date, end_date, start_time, end_time, venue, max_participants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
<<<<<<< HEAD
      [
        event_id,
        event_name,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        venue,
        max_participants,
      ],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            res.status(400).json({ error: "Event ID already exists" });
=======
      [event_id, event_name, description, start_date, end_date, start_time, end_time, venue, max_participants],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Event ID already exists' });
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
          } else {
            res.status(500).json({ error: err.message });
          }
        } else {
<<<<<<< HEAD
          res.json({ id: this.lastID, message: "Event created successfully" });
=======
          res.json({ id: this.lastID, message: 'Event created successfully' });
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
<<<<<<< HEAD
app.put(
  "/api/events/:eventId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const eventId = req.params.eventId;
    const {
      event_name,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      venue,
      max_participants,
    } = req.body;

    // Validate date and time ordering
    const startDateTime = new Date(start_date + "T" + start_time);
    const endDateTime = new Date(end_date + "T" + end_time);

    if (startDateTime >= endDateTime) {
      return res
        .status(400)
        .json({ error: "Start date/time must be before end date/time" });
    }

    try {
      const hasOverlap = await checkTimeOverlap(
        start_date,
        end_date,
        start_time,
        end_time,
        eventId
      );
      if (hasOverlap) {
        return res
          .status(400)
          .json({ error: "Event time overlaps with existing event" });
      }

      db.run(
        `UPDATE events SET event_name = ?, description = ?, start_date = ?, end_date = ?, 
       start_time = ?, end_time = ?, venue = ?, max_participants = ? WHERE event_id = ?`,
        [
          event_name,
          description,
          start_date,
          end_date,
          start_time,
          end_time,
          venue,
          max_participants,
          eventId,
        ],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else if (this.changes === 0) {
            res.status(404).json({ error: "Event not found" });
          } else {
            res.json({ message: "Event updated successfully" });
          }
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete event
app.delete(
  "/api/events/:eventId",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const eventId = req.params.eventId;
    db.run("DELETE FROM events WHERE event_id = ?", [eventId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Event not found" });
      } else {
        res.json({ message: "Event deleted successfully" });
      }
    });
  }
);

// Register for event
app.post("/api/events/:eventId/register", authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const { user_name, user_phone } = req.body;

  if (!user_name) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (req.user.role !== "user") {
    return res
      .status(403)
      .json({ error: "Only users can register for events" });
  }

  // Check if event exists and get max participants
  db.get("SELECT * FROM events WHERE event_id = ?", [eventId], (err, event) => {
=======
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
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
<<<<<<< HEAD
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user already registered
    db.get(
      "SELECT * FROM registrations WHERE event_id = ? AND user_email = ?",
      [eventId, req.user.email],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (existing) {
          return res
            .status(400)
            .json({ error: "You are already registered for this event" });
        }

        // Check max participants
        if (event.max_participants) {
          db.get(
            "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
            [eventId],
            (err, result) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              if (result.count >= event.max_participants) {
                return res.status(400).json({ error: "Event is full" });
              }

              // Register user
              db.run(
                "INSERT INTO registrations (event_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?)",
                [eventId, user_name, req.user.email, user_phone],
                function (err) {
                  if (err) {
                    res.status(500).json({ error: err.message });
                  } else {
                    res.json({
                      id: this.lastID,
                      message: "Registration successful",
                    });
                  }
                }
              );
            }
          );
        } else {
          // No limit, register directly
          db.run(
            "INSERT INTO registrations (event_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?)",
            [eventId, user_name, req.user.email, user_phone],
            function (err) {
              if (err) {
                res.status(500).json({ error: err.message });
              } else {
                res.json({
                  id: this.lastID,
                  message: "Registration successful",
                });
              }
            }
          );
        }
      }
    );
=======
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
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
  });
});

// Get registrations for an event
<<<<<<< HEAD
app.get(
  "/api/events/:eventId/registrations",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const eventId = req.params.eventId;
    db.all(
      "SELECT * FROM registrations WHERE event_id = ? ORDER BY registration_date DESC",
      [eventId],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(rows);
        }
      }
    );
  }
);

// Get registration count for an event
app.get("/api/events/:eventId/registrations/count", (req, res) => {
  const eventId = req.params.eventId;
  db.get(
    "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
    [eventId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ count: row.count });
      }
    }
  );
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
=======
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
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
<<<<<<< HEAD
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed");
=======
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
    }
    process.exit(0);
  });
});
<<<<<<< HEAD
=======

>>>>>>> 86f164e88dde14076ef5e91d06b15d99a8b2eceb
