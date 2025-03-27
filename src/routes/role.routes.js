const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN'])); // Toutes les routes de rôles nécessitent des droits d'administrateur

router.post('/', roleController.createRole);
router.get('/:id', roleController.getRoleById);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.get('/', roleController.getAllRoles);

router.post('/:id/permissions/:permissionId', roleController.assignPermissionToRole);
router.delete('/:id/permissions/:permissionId', roleController.removePermissionFromRole);
router.get('/:id/permissions', roleController.getRolePermissions);

router.post('/permissions', roleController.createPermission);
router.get('/permissions', roleController.getAllPermissions);
router.put('/permissions/:id', roleController.updatePermission);
router.delete('/permissions/:id', roleController.deletePermission);

router.get('/user/permissions', roleController.getUserRoleAndPermissions);

module.exports = router;
