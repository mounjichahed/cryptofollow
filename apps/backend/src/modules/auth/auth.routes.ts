import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { loginHandler, registerHandler, loginSchema, registerSchema } from './auth.controller';

const router = Router();

router.post('/register', validate({ body: registerSchema }), registerHandler);
router.post('/login', validate({ body: loginSchema }), loginHandler);

export default router;

