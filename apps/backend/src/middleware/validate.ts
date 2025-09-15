import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodTypeAny } from 'zod';

type Schemas = {
  body?: ZodSchema<any> | ZodTypeAny;
  query?: ZodSchema<any> | ZodTypeAny;
  params?: ZodSchema<any> | ZodTypeAny;
};

export function validate(schemas: Schemas) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = await schemas.body.parseAsync(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.body = result as any;
      }
      if (schemas.query) {
        const result = await schemas.query.parseAsync(req.query);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.query = result as any;
      }
      if (schemas.params) {
        const result = await schemas.params.parseAsync(req.params);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.params = result as any;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

