// app.js
// CodeCraftHub - Simple REST API to manage courses stored in a JSON file (courses.json)
// Requirements satisfied:
// - CRUD endpoints under /api/courses
// - Data persisted in a JSON file named "courses.json" (auto-created if missing) in project root
// - Each course: id (auto-generated starting at 1), name, description, target_date (YYYY-MM-DD),
//   status (Not Started, In Progress, Completed), created_at (timestamp)
// - Validation and error handling for missing fields, not found, invalid status, and file I/O errors
// - Server runs on port 5000
// - Helpful comments for beginners

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// 2. File-based storage: use a JSON file named "courses.json" in project root
const DATA_FILE = path.resolve(__dirname, 'courses.json');

// 4. Allowed statuses
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

/**
 * 7. Ensure the data file exists.
 * If it doesn't exist, create it with an empty array [].
 */
async function ensureDataFile() {
  try {
    // If file exists, this will succeed and we do nothing
    await fs.access(DATA_FILE);
  } catch {
    // File doesn't exist yet; initialize with empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('Created missing data file: courses.json');
  }
}

/**
 * 3. Read all courses from the JSON file.
 * Returns an array (may be empty) or throws on file I/O errors.
 */
async function readCourses() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Propagate error to be handled by route handlers with 500
    throw err;
  }
}

/**
 * 3. Write the full list of courses back to the JSON file.
 */
async function writeCourses(list) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/**
 * 4. Generate a new numeric id that increments from existing items.
 * Starts at 1 if there are no existing items.
 */
function generateId(items) {
  const max = items.reduce((m, c) => Math.max(m, c.id || 0), 0);
  return max + 1;
}

/**
 * 4. Basic validation for target_date string.
 * Must be in format YYYY-MM-DD and correspond to a real calendar date.
 */
function isValidTargetDate(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(value);
  // Ensure the date parts match and represent a real date
  return (
    date instanceof Date &&
    !Number.isNaN(date) &&
    date.getFullYear() === y &&
    date.getMonth() + 1 === m &&
    date.getDate() === d
  );
}

/**
 * 5. Validate payload for create (POST) - requires all fields.
 * Returns an array of error messages. Empty array means valid.
 */
function validateCreatePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('Request body must be a JSON object');
    return errors;
  }
  if (!payload.name) errors.push('name is required');
  if (!payload.description) errors.push('description is required');
  if (!payload.target_date) {
    errors.push('target_date is required');
  } else if (!isValidTargetDate(payload.target_date)) {
    errors.push('target_date must be in YYYY-MM-DD format and be a valid date');
  }
  if (!payload.status) {
    errors.push('status is required');
  } else if (!VALID_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return errors;
}

/**
 * 5. Validate payload for update (PUT) - requires all fields including id.
 * Returns an array of error messages. Empty array means valid.
 */
function validateUpdatePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('Request body must be a JSON object');
    return errors;
  }
  // if (payload.id == null) errors.push('id is required');
  if (!payload.name) errors.push('name is required');
  if (!payload.description) errors.push('description is required');
  if (!payload.target_date) {
    errors.push('target_date is required');
  } else if (!isValidTargetDate(payload.target_date)) {
    errors.push('target_date must be in YYYY-MM-DD format and be a valid date');
  }
  if (!payload.status) {
    errors.push('status is required');
  } else if (!VALID_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return errors;
}

// 1) POST /api/courses - Add a new course
app.post('/api/courses', async (req, res) => {
  try {
    const payload = req.body;

    // 5. Validation: required fields
    const errors = validateCreatePayload(payload);
    if (errors.length) {
      return res.status(400).json({ error: 'Invalid course data', details: errors });
    }

    // 2 & 3: Read existing courses to determine next id
    const courses = await readCourses();
    const id = generateId(courses);
    const created_at = new Date().toISOString();

    const course = {
      id,
      name: payload.name,
      description: payload.description,
      target_date: payload.target_date,
      status: payload.status,
      created_at
    };

    courses.push(course);
    await writeCourses(courses);

    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Internal server error while creating course' });
  }
});

// 3) GET /api/courses - Get all courses
//    Also supports optional query ?id= to fetch a specific course (convenience)
app.get('/api/courses', async (req, res) => {
  try {
    const { id } = req.query;
    const courses = await readCourses();

    if (id != null) {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid id query parameter' });
      }
      const course = courses.find(c => c.id === numericId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      return res.json(course);
    }

    // Return all courses
    res.json(courses);
  } catch (err) {
    console.error('Error reading courses:', err);
    res.status(500).json({ error: 'Internal server error while reading courses' });
  }
});

// 9. GET /api/courses/stats - New endpoint: statistics by status
app.get('/api/courses/stats', async (req, res) => {
  try {
    const courses = await readCourses();
    const stats = {
      total: courses.length,
      'Not Started': 0,
      'In Progress': 0,
      Completed: 0
    };

    for (const c of courses) {
      if (VALID_STATUSES.includes(c.status)) {
        stats[c.status] = (stats[c.status] || 0) + 1;
      }
    }

    res.json(stats);
  } catch (err) {
    console.error('Error computing course statistics:', err);
    res.status(500).json({ error: 'Internal server error while computing course statistics' });
  }
});

// 3) GET /api/courses/:id - Get a specific course
app.get('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const courses = await readCourses();
    const course = courses.find(c => c.id === id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Internal server error while retrieving course' });
  }
});

// 1) PUT /api/courses/:id - Update a course
//    - Update is a full update; id must be provided in body
app.put('/api/courses/:id', async (req, res) => {
  try {
    const payload = req.body;

    // 5. Validation for update
    const errors = validateUpdatePayload(payload);
    if (errors.length) {
      return res.status(400).json({ error: 'Invalid course data', details: errors });
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const data = await readCourses();
    const idx = data.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Preserve created_at from existing record
    const created_at = data[idx].created_at ?? new Date().toISOString();

    // Full update (keep id and created_at)
    data[idx] = {
      id: id,
      name: payload.name,
      description: payload.description,
      target_date: payload.target_date,
      status: payload.status,
      created_at
    };

    await writeCourses(data);
    res.json(data[idx]);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Internal server error while updating course' });
  }
});

// 5) DELETE /api/courses - Delete a course
//    - id must be provided in request body
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const data = await readCourses();
    const idx = data.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const [removed] = data.splice(idx, 1);
    await writeCourses(data);

    res.json(removed);
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Internal server error while deleting course' });
  }
});

// 8. Start the server on port 5000
const PORT = 5004;

// Ensure the data file exists, then start listening
ensureDataFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CodeCraftHub API listening on port ${PORT}`);
      console.log(`CodeCraftHub API available at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize data storage:', err);
    process.exit(1);
  });