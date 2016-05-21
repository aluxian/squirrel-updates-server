import ManagedError from './ManagedError';

class NotFoundError extends ManagedError {
  express(res) {
    res.status(404).json({
      error: this.message
    });
  }
}

export default NotFoundError;
