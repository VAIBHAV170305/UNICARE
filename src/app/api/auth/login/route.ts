import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { decrypt, encrypt } from "@/lib/encryption";
import { signLocalToken, verifyAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const firebaseAuth = await verifyAuthToken(request);
    
    let email = "";
    let password = "";

    if (firebaseAuth) {
      email = firebaseAuth.email;
    } else {
      try {
        const body = await request.json();
        email = body.email;
        password = body.password;
      } catch (e) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
      }

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Seed default demo/test accounts on the fly if needed
    if (trimmedEmail === "demo@unicare.ai" || trimmedEmail === "test@unicare.ai") {
      const existingDefault = await prisma.user.findUnique({
        where: { email: trimmedEmail }
      });

      if (!existingDefault) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        if (trimmedEmail === "demo@unicare.ai") {
          await prisma.user.create({
            data: {
              email: "demo@unicare.ai",
              name: "Alex",
              password: hashedPassword,
              role: "ADMIN", // First default user is an Admin
              profile: {
                create: {
                  age: 28,
                  gender: "Male",
                  height: 180,
                  weight: 75,
                  medicalHistory: encrypt("Mild seasonal asthma"),
                  allergies: encrypt("None"),
                  healthGoals: "Cardiovascular endurance"
                }
              }
            }
          });
        } else {
          await prisma.user.create({
            data: {
              email: "test@unicare.ai",
              name: "Test User",
              password: hashedPassword,
              role: "USER"
            }
          });
        }
      }
    }

    // Query database for matched user
    let matchedUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { profile: true }
    });

    // Auto-provision if user signed up on Firebase but does not exist in SQLite database yet
    if (!matchedUser && firebaseAuth) {
      const totalUsers = await prisma.user.count();
      const role = totalUsers === 0 ? "ADMIN" : "USER";
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      
      matchedUser = await prisma.user.create({
        data: {
          email: trimmedEmail,
          name: trimmedEmail.split("@")[0],
          password: randomPassword,
          role: role
        },
        include: { profile: true }
      });
      await logActivity(matchedUser.id, "USER_REGISTRATION", `Auto-provisioned account with role: ${role}`);
    }

    if (!matchedUser) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // If not using Firebase Auth, check local credentials
    if (!firebaseAuth) {
      const isPasswordValid = await bcrypt.compare(password.trim(), matchedUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
    }

    // Generate local token if fallback mode
    let token = "";
    if (!firebaseAuth) {
      token = signLocalToken({ uid: matchedUser.id, email: matchedUser.email, role: matchedUser.role });
    }

    // Decrypt sensitive health profile data before returning to frontend
    const sessionUser = {
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      profile: matchedUser.profile ? {
        name: matchedUser.name,
        age: matchedUser.profile.age,
        gender: matchedUser.profile.gender,
        height: matchedUser.profile.height,
        weight: matchedUser.profile.weight,
        medicalHistory: decrypt(matchedUser.profile.medicalHistory),
        allergies: decrypt(matchedUser.profile.allergies),
        healthGoals: matchedUser.profile.healthGoals
      } : undefined
    };

    // Audit log login action (safe description, no PII details)
    await logActivity(matchedUser.id, "USER_LOGIN", `User successfully logged in via ${firebaseAuth ? "Firebase" : "Local Credentials"}`);

    return NextResponse.json({ success: true, user: sessionUser, token });
  } catch (error: unknown) {
    console.error("Error in /api/auth/login:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errMsg }, { status: 500 });
  }
}
