import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../middleware/authMiddleware';
import { sendSuccess } from '../../utils/response';
import { rolesService } from './roles.service';

const router = Router();

router.use(authenticateJwt);

// Get all roles with assigned user counts
router.get('/', (_req, res, next) => {
  try {
    const roles = rolesService.getAll();
    return sendSuccess(res, 'Enterprise Roles & Granular Permissions fetched', roles);
  } catch (err) {
    next(err);
  }
});

// Get role by ID
router.get('/:id', (req, res, next) => {
  try {
    const role = rolesService.getById(req.params.id as string);
    return sendSuccess(res, 'Role details fetched successfully', role);
  } catch (err) {
    next(err);
  }
});

// Get all users assigned to this role
router.get('/:id/users', (req, res, next) => {
  try {
    const users = rolesService.getUsersForRole(req.params.id as string);
    return sendSuccess(res, 'Assigned users fetched successfully', users);
  } catch (err) {
    next(err);
  }
});

// Create a new dynamic custom role
router.post('/', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
  try {
    const created = rolesService.create(req.body);
    return sendSuccess(res, `Custom role "${created.name}" created successfully`, created, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// Update role permissions, dataScope, or description
router.put('/:id', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
  try {
    const updated = rolesService.update(req.params.id as string, req.body);
    return sendSuccess(res, `Role "${updated.name}" updated successfully`, updated);
  } catch (err) {
    next(err);
  }
});

// Delete a custom role
router.delete('/:id', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
  try {
    const result = rolesService.delete(req.params.id as string);
    return sendSuccess(res, result.message, null);
  } catch (err) {
    next(err);
  }
});

// Dynamically assign any user to this role
router.post('/:id/assign-user', requireRole(['Super Administrator', 'Company Administrator', 'SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const result = rolesService.assignUserToRole(req.params.id as string, userId);
    return sendSuccess(res, 'User assigned to role successfully', result);
  } catch (err) {
    next(err);
  }
});

export const rolesRoutes = router;
