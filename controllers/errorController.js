const SentErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const SentErrProd = (err, res) => {
  if (err.isOperational) {
    // Operational errors (trusted errors): Send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown errors: Don't leak details to client
    console.error('Error 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    SentErrDev(err, res);
    return; // Prevent further execution after sending response
  } else if (process.env.NODE_ENV === 'production') {
    SentErrProd(err, res);
    return; // Prevent further execution after sending response
  }

  // Ensure no further actions are taken after the response is sent
};
