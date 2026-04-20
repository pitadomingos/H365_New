import 'dotenv/config';

import express from 'express'; 
import { initializeDatabase } from './config/database.config.js';

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
initializeDatabase()
  .then(pool => {
    console.log('Database pool created successfully.');
    app.set('dbPool', pool); // Attach the pool to the app object

    // Basic Route for Testing
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to create database pool:', err);
    process.exit(1); // Exit the process if database connection fails
  });
