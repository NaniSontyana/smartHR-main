
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`[AuthMiddleware] Method: ${req.method}, Path: ${req.path}`);
  console.log(`[AuthMiddleware] Header: ${authHeader}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("[AuthMiddleware] No valid token found.");
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Verification Failed:", error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;