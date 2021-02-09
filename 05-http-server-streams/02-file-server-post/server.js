const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST': {
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        res.end('Incorrect filename');
        break;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('File already exists');
        break;
      }

      const limitSizeStream = new LimitSizeStream({limit: 1048576});
      const outStream = fs.createWriteStream(filepath);

      req.pipe(limitSizeStream).pipe(outStream);

      limitSizeStream.on('error', (err) => {
        res.statusCode = 413;
        res.end(err.code);
      });

      const handleInternalServerError = () => {
        fs.unlinkSync(filepath);

        res.statusCode = 500;
        res.end('Internal Server Error');
      };

      outStream.on('error', handleInternalServerError);

      req.on('error', handleInternalServerError);

      req.on('aborted', handleInternalServerError);

      outStream.on('finish', function() {
        res.statusCode = 201;
        res.end('File has uploaded');
      });

      break;
    }
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
