import ManagedError from './ManagedError';

class BadRequestError extends ManagedError {
  express(res) {
    res.status(400).json({
      error: this.message
    });
  }
}

export default BadRequestError;
