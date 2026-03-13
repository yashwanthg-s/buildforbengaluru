const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class AuthController {
  static async signup(req, res) {
    try {
      const { name, email, phone, username, password } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if username already exists
      const connection = await pool.getConnection();
      try {
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [username, email]
        );

        if (existingUsers.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Username or email already exists'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await connection.execute(
          `INSERT INTO users (name, email, phone, username, password, role) 
           VALUES (?, ?, ?, ?, ?, 'citizen')`,
          [name, email, phone, username, hashedPassword]
        );

        res.status(201).json({
          success: true,
          message: 'Account created successfully',
          user: {
            id: result.insertId,
            name,
            email,
            username,
            role: 'citizen'
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create account',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Find user by username
        const [users] = await connection.execute(
          'SELECT * FROM users WHERE username = ?',
          [username]
        );

        if (users.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        // Return user data (excluding password)
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
