import { prisma } from "@/lib/prisma";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isTransientConnectionError(error: unknown) {
  if (!isObject(error)) {
    return false;
  }

  const code = typeof error.code === "string" ? error.code : undefined;
  if (code === "P1017") {
    return true;
  }

  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return (
    message.includes("server has closed the connection") ||
    message.includes("connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("terminated unexpectedly")
  );
}

export async function withPrismaRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientConnectionError(error)) {
        throw error;
      }

      lastError = error;
      await prisma.$disconnect();

      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
