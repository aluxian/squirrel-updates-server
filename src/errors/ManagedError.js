import ExtendableError from 'es6-error';

class ManagedError extends ExtendableError {
  express(res) {
    res.json({
      error: this.message
    });
  }
}

export default ManagedError;
