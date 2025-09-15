import dotenv from 'dotenv';

dotenv.config();

const required = (name: string, value: string | undefined): string => {
  if (!value || value.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const toNumber = (name: string, value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid number for env var ${name}: ${value}`);
  }
  return n;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: toNumber('PORT', process.env.PORT, 3000),
  DATABASE_URL: required('DATABASE_URL', process.env.DATABASE_URL),
  JWT_SECRET: required('JWT_SECRET', process.env.JWT_SECRET),
  BASE_CURRENCY: process.env.BASE_CURRENCY ?? 'EUR',
  CORS_ORIGIN: process.env.CORS_ORIGIN, // comma-separated origins or single origin
} as const;
