#!/usr/bin/env node

/**
 * Servidor simple para editar print-data.json
 * Uso: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'print-data.json');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: Guardar JSON
  if (req.url === '/api/save' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Guardar el archivo
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        console.log('✅ Datos guardados en data/print-data.json');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Datos guardados correctamente' }));

      } catch (error) {
        console.error('❌ Error guardando datos:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });

    return;
  }

  // API: Git push automático
  if (req.url === '/api/git-push' && req.method === 'POST') {
    exec('git add data/print-data.json && git commit -m "Actualizar datos desde editor" && git push', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error en git push:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: stderr || error.message }));
        return;
      }

      console.log('✅ Git push exitoso');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Cambios subidos a GitHub' }));
    });

    return;
  }

  // Servir archivos estáticos
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './editor-local.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Archivo no encontrado');
      } else {
        res.writeHead(500);
        res.end('Error del servidor: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Editor Dashboard - Pensión Valdés                     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  🚀 Servidor corriendo en:                            ║
║     http://localhost:${PORT}                              ║
║                                                        ║
║  📝 Abre el editor en tu navegador                    ║
║  ✏️  Haz tus cambios                                  ║
║  💾 Click en "Guardar y Subir a GitHub"               ║
║  ✅ ¡Listo! Los cambios estarán en producción        ║
║                                                        ║
║  Presiona Ctrl+C para detener el servidor             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

  // Abrir navegador automáticamente
  const url = `http://localhost:${PORT}`;
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`);
});
