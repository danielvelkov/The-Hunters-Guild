class CustomUnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'UnauthorizedError';
  }
}

export default CustomUnauthorizedError;
