import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token nahi mila' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.clientId = decoded.id;
    req.clientEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalid ya expire ho gaya' });
  }
};

export default authMiddleware;