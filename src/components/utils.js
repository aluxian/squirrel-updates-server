import request from 'request';
import config from '../config';

export function asyncHandler(handler) {
  return function(req, res, next) {
    if (!handler) {
      throw new Error(`Invalid handler ${handler}, it must be a function.`);
    }

    handler(req, res, next)
      .then(function(response) {
        if (response) {
          res.send(response);
        }
      })
      .catch(function(err) {
        try {
          let message = err.message;
          let status = 500;

          if (message.match(/^[\d]{3}:/)) {
            status = parseInt(message.substr(0, 3), 10);
            message = message.substring(4).trim();
          }

          res.status(status).json({
            error: message
          });

          if (status >= 500) {
            console.error(err.stack);
          }
        } catch(ex) {
          res.status(500).end();
          console.error(ex);
        }
      });
  };
}

export function getRedirect(url) {
  return new Promise(function(resolve, reject) {
    let options = {
      url: url,
      followRedirect: false,
      headers: {
        'Authorization': `token ${config.github.token}`,
        'Accept': 'application/octet-stream',
        'User-Agent': config.github.api.headers['user-agent']
      }
    };
    request(options, function(err, res, body) {
      if (err) {
        reject(err);
      } else {
        resolve(res.headers.location);
      }
    });
  });
}
