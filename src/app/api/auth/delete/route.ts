import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

/**
 * Handles account deletion. Verifies authentication, writes audit logs,
 * and securely purges the user's details and profile records from the database.
 */
export async function DELETE(request: Request) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access: Valid authentication token required" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email.toLowerCase() }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User account not found in database" }, { status: 404 });
    }

    // Write audit log entry before deleting records
    await logActivity(dbUser.id, "ACCOUNT_DELETE", "User initiated and completed secure account deletion and data purge");

    // Delete user (Prisma cascade onDelete will purge Profile record automatically)
    await prisma.user.delete({
      where: { id: dbUser.id }
    });

    return NextResponse.json({ success: true, message: "Account and profile successfully purged from database" });
  } catch (error: unknown) {
    console.error("Error in account deletion endpoint:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errMsg }, { status: 500 });
  }
}
