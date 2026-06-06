import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const prisma = basePrisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }: { model: string; operation: string; args: any; query: (args: any) => Promise<any> }) {
      const executeWithRetry = async () => {
        const MAX_RETRIES = 2;
        const DELAY_MS = 1500;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await query(args);
          } catch (error: any) {
            const isConnError = error?.code === 'P1001' 
              || error?.message?.includes("Can't reach database")
              || error?.message?.includes("Connection terminated")
              || error?.message?.includes("connect ECONNREFUSED")
              || error?.message?.includes("timed out");
            if (!isConnError || attempt === MAX_RETRIES) throw error;
            console.warn(`[Prisma retry] Attempt ${attempt + 1}/${MAX_RETRIES + 1} after ${DELAY_MS * (attempt + 1)}ms: ${error.message || error}`);
            await new Promise(r => setTimeout(r, DELAY_MS * (attempt + 1)));
          }
        }
        throw new Error("Unreachable");
      };
      return executeWithRetry();
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;
