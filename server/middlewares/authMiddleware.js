const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: 'Authorization header missing',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send({
        success: false,
        message: 'Token missing',
      });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // { userId: ... }

    // ✅ Attach userId safely
    req.user = { userId: decodedToken.userId };

    next();
  } catch (error) {
    res.status(401).send({
      message: 'Authentication failed: ' + error.message,
      success: false,
    });
  }
};
