import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

app.listen(ENV.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${ENV.PORT} (env: ${ENV.NODE_ENV})`);
});

