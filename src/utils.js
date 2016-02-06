export function asyncHandler(handler) {
  return function(req, res, next) {
    handler(req, res, next)
      .then(function(response) {
        if (response) {
          res.send(response);
        }
      })
      .catch(function(err) {
        let message = err.message;
        let status = 500;

        if (message.match(/[\d]{3}:/)) {
          message = message.substring(4);
          status = parseInt(message.substr(0, 3), 10);
        }

        res.status(status);
        res.json({
          error: message
        });

        console.error(err.stack);
      });
  };
}
