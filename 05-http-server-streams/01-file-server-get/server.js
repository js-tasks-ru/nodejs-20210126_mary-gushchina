const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET': {
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        res.end('Incorrect filename');
        break;
      }

      const inStream = fs.createReadStream(filepath);

      inStream.on('open', () => {
        res.statusCode = 200;
        inStream.pipe(res);
      });

      inStream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File is not found');
        }
      });

      req.on('aborted', () => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });

      break;
    }
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
