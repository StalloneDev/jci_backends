const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoleService {
  async createRole(data) {
    return prisma.role.create({
      data: {
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
      },
      include: {
        users: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getRoleById(id) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id, data) {
    return prisma.role.update({
      where: { id },
      data: {
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions : undefined,
      },
      include: {
        users: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id) {
    return prisma.role.delete({
      where: { id },
    });
  }

  async getAllRoles() {
    return prisma.role.findMany({
      include: {
        users: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async assignPermissionToRole(roleId, permissionId) {
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        role: true,
        permission: true,
      },
    });
  }

  async removePermissionFromRole(roleId, permissionId) {
    return prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async getRolePermissions(roleId) {
    return prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });
  }

  async createPermission(data) {
    return prisma.permission.create({
      data,
    });
  }

  async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updatePermission(id, data) {
    return prisma.permission.update({
      where: { id },
      data,
    });
  }

  async deletePermission(id) {
    return prisma.permission.delete({
      where: { id },
    });
  }

  async getUserRoleAndPermissions(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return null;
    }

    return {
      role: user.role.name,
      permissions: user.role.permissions,
      rolePermissions: user.role.rolePermissions.map(rp => rp.permission.name),
    };
  }
}

module.exports = new RoleService();
