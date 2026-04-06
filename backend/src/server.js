import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { ensureBootstrapAdmin } from "./bootstrap/ensureAdmin.js";

async function main() {
  if (!env.mongoUri) throw new Error("MONGODB_URI is missing in .env");
  if (!env.jwtSecret) throw new Error("JWT_SECRET is missing in .env");

  await connectDb(env.mongoUri);
  await ensureBootstrapAdmin(env.bootstrapAdmin);

  const app = createApp({ jwtSecret: env.jwtSecret, clientOrigin: env.clientOrigin });
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

