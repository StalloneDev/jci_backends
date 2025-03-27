const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

class AuthService {
  async login(email, password) {
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        member: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role?.name,
        memberId: user.memberId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        member: user.member,
      },
    };
  }

  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer le membre d'abord si nécessaire
    let member = null;
    if (userData.member) {
      member = await prisma.member.create({
        data: {
          ...userData.member,
          password: hashedPassword,
        },
      });
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        memberId: member?.id,
      },
      include: {
        role: true,
        member: true,
      },
    });

    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      throw new Error('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Si l'utilisateur est lié à un membre, mettre à jour son mot de passe aussi
    if (user.memberId) {
      await prisma.member.update({
        where: { id: user.memberId },
        data: { password: hashedPassword },
      });
    }

    return true;
  }

  async resetPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // TODO: Envoyer l'email avec le mot de passe temporaire

    return tempPassword;
  }
}

module.exports = new AuthService();
