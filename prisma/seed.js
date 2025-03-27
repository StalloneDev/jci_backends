const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données
  await prisma.attachment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.training.deleteMany();
  await prisma.commissionHistory.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.roleMandate.deleteMany();
  await prisma.export.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.member.deleteMany();

  // Créer les permissions
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'CREATE_MEMBER',
        description: 'Créer un nouveau membre',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'EDIT_MEMBER',
        description: 'Modifier les informations d\'un membre',
      },
    }),
    // ... autres permissions
  ]);

  // Créer les rôles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrateur avec tous les droits',
      permissions: ['*'],
    },
  });

  const presidentRole = await prisma.role.create({
    data: {
      name: 'PRESIDENT',
      description: 'Président de la JCI',
      permissions: ['CREATE_COMMISSION', 'EDIT_COMMISSION', 'CREATE_MEETING'],
    },
  });

  // Créer les membres
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const johnDoe = await prisma.member.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@jci.org',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      birthDate: new Date('1990-01-15'),
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      status: 'ACTIVE',
    },
  });

  const janeSmith = await prisma.member.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@jci.org',
      password: hashedPassword,
      phoneNumber: '+1234567891',
      birthDate: new Date('1992-03-20'),
      address: '456 Oak Ave',
      city: 'Los Angeles',
      country: 'USA',
      status: 'ACTIVE',
    },
  });

  // Créer les utilisateurs
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@jci.org',
      password: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@jci.org',
      password: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      username: 'tech_admin',
      email: 'tech@jci.org',
      password: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      username: 'john.doe',
      email: 'john.doe@jci.org',
      password: hashedPassword,
      roleId: presidentRole.id,
      memberId: johnDoe.id,
      status: 'ACTIVE',
    },
  });

  // Créer les commissions
  const commission = await prisma.commission.create({
    data: {
      name: 'Formation et Développement',
      description: 'Commission chargée des formations',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'ACTIVE',
    },
  });

  // Créer l'historique des commissions
  await prisma.commissionHistory.create({
    data: {
      commissionId: commission.id,
      memberId: johnDoe.id,
      role: 'DIRECTOR',
      startDate: new Date('2025-01-01'),
    },
  });

  // Créer les mandats
  await prisma.roleMandate.create({
    data: {
      memberId: johnDoe.id,
      role: 'PRESIDENT',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
    },
  });

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
