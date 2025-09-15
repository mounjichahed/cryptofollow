import { Router } from 'express';
import { listAssetsHandler } from './assets.controller';

const router = Router();

router.get('/', listAssetsHandler);

export default router;

