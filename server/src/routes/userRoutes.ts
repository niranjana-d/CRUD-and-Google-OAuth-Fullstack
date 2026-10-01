import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateRoleSchema } from '../validators';

const router = Router();

// All user management routes require ADMIN role
router.use(authenticateUser, requireRole('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', validate(updateRoleSchema), updateUserRole);
router.delete('/:id', deleteUser);

export default router;
