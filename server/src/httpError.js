// Create an Error carrying an HTTP status; errorHandler turns it into { error }.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
