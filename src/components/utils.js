import ManagedError from '../errors/ManagedError';

export function asyncHandler(handler) {
  return function(req, res, next) {
    if (!handler) {
      next(new Error(`Invalid handler ${handler}, it must be a function.`));
    } else {
      handler(req, res, next).catch(next);
    }
  };
}

// Handled errors
export function errorHandler1(err, req, res, next) {
  if (err instanceof ManagedError) {
    err.express(res);
  } else {
    next(err);
  }
}

// Unexpected errors
export function errorHandler2(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: err.message,
    sid: res.sentry
  });
}
