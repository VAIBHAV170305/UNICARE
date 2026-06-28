import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // Authenticate the user calling the API
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access: Valid authentication token required" }, { status: 401 });
    }

    const { email, age, gender, height, weight, medicalHistory, allergies, healthGoals } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required to sync profile" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify token identity matches the email being onboarded
    if (authUser.email.toLowerCase() !== trimmedEmail) {
      return NextResponse.json({ error: "Forbidden: You cannot modify another user's profile" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // Encrypt sensitive health fields before storing in SQLite database
    const encryptedMedicalHistory = encrypt(medicalHistory);
    const encryptedAllergies = encrypt(allergies);

    // Upsert the profile details for this userId
    const userProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        medicalHistory: encryptedMedicalHistory,
        allergies: encryptedAllergies,
        healthGoals
      },
      create: {
        userId: user.id,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        medicalHistory: encryptedMedicalHistory,
        allergies: encryptedAllergies,
        healthGoals
      }
    });

    // Decrypt fields to return plain text to the client application state
    const sessionUser = {
      email: user.email,
      name: user.name,
      role: user.role,
      profile: {
        name: user.name,
        age: userProfile.age,
        gender: userProfile.gender,
        height: userProfile.height,
        weight: userProfile.weight,
        medicalHistory: decrypt(userProfile.medicalHistory),
        allergies: decrypt(userProfile.allergies),
        healthGoals: userProfile.healthGoals
      }
    };

    // Audit log the profile update (PII details are redacted/omitted)
    await logActivity(user.id, "PROFILE_UPDATE", "Successfully updated user health profile details");

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: unknown) {
    console.error("Error in /api/auth/onboarding:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errMsg }, { status: 500 });
  }
}
