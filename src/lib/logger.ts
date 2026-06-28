import { prisma } from "./prisma";

/**
 * Logs user and system activities for audit trails and security monitoring.
 * Ensures that no raw PII or clinical medical details are exposed in the parameters.
 */
export async function logActivity(
  userId: string | null,
  action: string,
  details: string,
  ipAddress?: string | null
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to persist audit log to DB:", error);
  }
}
