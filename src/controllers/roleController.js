const { roleService } = require('../services');

class RoleController {
  async createRole(req, res) {
    try {
      const roleData = req.body;
      const role = await roleService.createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const roleData = req.body;
      const role = await roleService.updateRole(id, roleData);
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      await roleService.deleteRole(id);
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async assignPermissionToRole(req, res) {
    try {
      const { id, permissionId } = req.params;
      const result = await roleService.assignPermissionToRole(id, permissionId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removePermissionFromRole(req, res) {
    try {
      const { id, permissionId } = req.params;
      await roleService.removePermissionFromRole(id, permissionId);
      res.json({ message: 'Permission removed from role successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const permissions = await roleService.getRolePermissions(id);
      res.json(permissions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createPermission(req, res) {
    try {
      const permissionData = req.body;
      const permission = await roleService.createPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllPermissions(req, res) {
    try {
      const permissions = await roleService.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const permissionData = req.body;
      const permission = await roleService.updatePermission(id, permissionData);
      res.json(permission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePermission(req, res) {
    try {
      const { id } = req.params;
      await roleService.deletePermission(id);
      res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserRoleAndPermissions(req, res) {
    try {
      const { id } = req.user; // From JWT middleware
      const roleAndPermissions = await roleService.getUserRoleAndPermissions(id);
      if (!roleAndPermissions) {
        return res.status(404).json({ error: 'User role not found' });
      }
      res.json(roleAndPermissions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RoleController();
