const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Replace these environment variable assignments with your actual environment variable names
const process = {
  env: {
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 3001
  }
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Set to true in production if your DB requires SSL
  }
});

app.use(cors());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.use(express.static(path.join(__dirname, 'public')));

async function findUserByUsername(username) {
  // Replace the following with a query to your database
  const query = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  return rows[0]; // Assuming username is unique and only one record will be returned
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Username or password incorrect' });
    }

    // Compare the hashed password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Username or password incorrect' });
    }

    // User authenticated, create a token
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.json({ userId: newUser.rows[0].id, username: newUser.rows[0].username });
  } catch (err) {
    console.error('Error creating new user', err);
    res.status(500).send('Server error');
  }
});

app.post('/mark-applied', authenticateToken, async (req, res) => {
  const {
    jobId,
    jobLink,
    companyName,
    companyLocation,
    salary,
    jobType,
    jobDescription
  } = req.body;

  try {
    const queryText = `
      INSERT INTO applied_jobs (
        job_id, 
        job_link, 
        company_name, 
        company_location, 
        salary, 
        job_type, 
        job_description,
        applied_timestamp
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      jobId,
      jobLink,
      companyName,
      companyLocation,
      salary,
      jobType,
      jobDescription
    ]);

    res.json({ success: true, message: 'Job marked as applied.', job: result.rows[0] });
  } catch (err) {
    console.error('Database operation failed:', err.stack);
    res.status(500).json({ success: false, message: 'Database operation failed.' });
  }
});

app.get('/job-listings', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM processed_job'; // Ensure this is the correct table name
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching job listings', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/job-listings/:job_fccid', authenticateToken, async (req, res) => {
  console.log("Fetching job details for FCC ID:", req.params.job_fccid);
  try {
    const { job_fccid } = req.params;
    const query = 'SELECT * FROM processed_job WHERE job_fccid = $1';
    const { rows } = await pool.query(query, [job_fccid]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Job not found.' });
    }
  } catch (err) {
    console.error('Error fetching job details', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Export the app object for AWS Lambda
module.exports = app;
