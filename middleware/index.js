import jwt from 'jsonwebtoken';

const loginMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      res.status(500).json({
        code: 403,
        message: 'Access denied.',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};

export { loginMiddleware };
