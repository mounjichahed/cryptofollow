import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { listHandler, createHandler, updateHandler, deleteHandler } from './transactions.controller';
import { createBodySchema, listQuerySchema, updateBodySchema, idParamSchema } from './transactions.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: listQuerySchema }), listHandler);
router.post('/', validate({ body: createBodySchema }), createHandler);
router.put('/:id', validate({ params: idParamSchema, body: updateBodySchema }), updateHandler);
router.delete('/:id', validate({ params: idParamSchema }), deleteHandler);

export default router;
