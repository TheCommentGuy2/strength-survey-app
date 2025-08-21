// server.js - Node built-in HTTP server for Render deployment
// This server handles API requests and serves static frontend files.
// It does not require any external dependencies like express or cors.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'responses.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Determine the Content-Type header based on file extension.
 * @param {string} ext File extension
 * @returns {string} MIME type
 */
function getContentType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

/**
 * Send an HTTP response with the given status, headers and body.
 * Adds CORS headers to allow cross-origin requests (e.g., from Netlify-hosted frontend).
 * @param {http.ServerResponse} res Response object
 * @param {number} status HTTP status code
 * @param {object} headers Additional headers
 * @param {Buffer|string} body Response body
 */
function sendResponse(res, status, headers, body) {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  res.writeHead(status, { ...defaultHeaders, ...headers });
  res.end(body);
}

/**
 * Handle reading and writing responses.json
 */
function readResponses(callback) {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return callback([]);
    try {
      const parsed = JSON.parse(data);
      callback(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      callback([]);
    }
  });
}

function writeResponses(responses, callback) {
  fs.writeFile(DATA_FILE, JSON.stringify(responses, null, 2), 'utf8', callback);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method.toUpperCase();
  const pathname = parsedUrl.pathname;

  // Pre-flight CORS handling for OPTIONS requests
  if (method === 'OPTIONS') {
    return sendResponse(res, 204, {}, '');
  }

  // API endpoints
  if (pathname === '/api/submit' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newResponse = { ...data, timestamp: new Date().toISOString() };
        readResponses((responses) => {
          responses.push(newResponse);
          writeResponses(responses, (err) => {
            if (err) {
              console.error(err);
              return sendResponse(res, 500, { 'Content-Type': 'text/plain' }, 'Error saving data');
            }
            sendResponse(res, 201, { 'Content-Type': 'application/json' }, JSON.stringify({ message: 'Response submitted successfully!' }));
          });
        });
      } catch (e) {
        sendResponse(res, 400, { 'Content-Type': 'text/plain' }, 'Invalid JSON');
      }
    });
    return;
  }
  if (pathname === '/api/results' && method === 'GET') {
    readResponses((responses) => {
      sendResponse(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(responses));
    });
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const ext = path.extname(filePath);
  const fullPath = path.join(PUBLIC_DIR, filePath);

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      // file not found or error -> return 404
      sendResponse(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
    } else {
      const contentType = getContentType(ext);
      sendResponse(res, 200, { 'Content-Type': contentType }, content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
