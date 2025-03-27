const jwt = require('jsonwebtoken');
const { roleService } = require('../services');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      const { id } = req.user;
      const userRoleAndPermissions = await roleService.getUserRoleAndPermissions(id);

      if (!userRoleAndPermissions) {
        return res.status(403).json({ error: 'User has no role assigned' });
      }

      const { role, permissions } = userRoleAndPermissions;

      // Super admin peut tout faire
      if (role === 'ADMIN' || permissions.includes('*')) {
        return next();
      }

      // Vérifier si l'utilisateur a un des rôles requis
      if (roles.length && !roles.includes(role)) {
        return res.status(403).json({ error: 'Insufficient role permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expiré' });
    }
    return res.status(401).json({ message: 'Refresh token invalide' });
  }
};

module.exports = {
  authenticate,
  authorize,
  refreshToken
};
