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
        let message = err.message;
        let status = 500;

        if (message.match(/^[\d]{3}:/)) {
          message = message.substring(4).trim();
          const code = parseInt(message.substr(0, 3), 10);
          if (!isNaN(code)) {
            status = code;
          }
        }

        res.status(status).json({
          error: message
        });

        console.error(err.stack);
      });
  };
}
