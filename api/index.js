// Vercel Serverless Function Wrapper
const path = require('path');

// Import the built server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');
let app;

try {
  // Try to import the default export or the app
  const serverModule = require(serverPath);
  app = serverModule.default || serverModule.app || serverModule;
} catch (error) {
  console.error('Error loading server:', error);
  // Fallback: create a simple express app
  const express = require('express');
  app = express();
  app.get('/api/*', (req, res) => {
    res.status(500).json({ error: 'Server not properly configured', details: error.message });
  });
}

module.exports = app;
