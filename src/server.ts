import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.warn("Database connection failed:", error);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => {
      prisma
        .$disconnect()
        .catch(() => undefined)
        .finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();
