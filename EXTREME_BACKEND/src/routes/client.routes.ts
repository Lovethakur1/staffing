import { Router } from 'express';
import {
  listClients, getClient, updateClient,
  listFavoriteStaff, addFavoriteStaff, removeFavoriteStaff,
} from '../controllers/client.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Client profiles
router.get('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listClients);
router.get('/favorites', authorize('CLIENT'), listFavoriteStaff);
router.post('/favorites', authorize('CLIENT'), addFavoriteStaff);
router.delete('/favorites/:staffId', authorize('CLIENT'), removeFavoriteStaff);
router.get('/:id', getClient);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'CLIENT'), updateClient);

export default router;
