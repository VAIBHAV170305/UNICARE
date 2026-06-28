import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signLocalToken, verifyAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // Check if the client did Firebase Auth and sent a bearer token
    const firebaseAuth = await verifyAuthToken(request);
    let email = "";
    let password = "";
    let name = "";

    if (firebaseAuth) {
      email = firebaseAuth.email;
      name = firebaseAuth.email.split("@")[0]; // Fallback name
    }

    // Parse body parameters if present
    try {
      const body = await request.json();
      if (body.email) email = body.email;
      if (body.password) password = body.password;
      if (body.name) name = body.name;
    } catch (e) {
      // Body may be empty, which is acceptable if authenticated via header token
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name ? name.trim() : trimmedEmail.split("@")[0];

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { profile: true }
    });

    if (user) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Role assignment: first user is ADMIN, rest are USER
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? "ADMIN" : "USER";

    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    } else {
      // Firebase authenticated user might not send a password, generate random uuid hash
      hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    }

    // Save user
    user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        password: hashedPassword,
        role: role
      },
      include: { profile: true }
    });

    // Generate local token if not authenticated via Firebase
    let token = "";
    if (!firebaseAuth) {
      token = signLocalToken({ uid: user.id, email: user.email, role: user.role });
    }

    const sessionUser = {
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile
    };

    // Log the registration activity
    await logActivity(user.id, "USER_REGISTRATION", `Registered new account with role: ${role}`);

    return NextResponse.json({ success: true, user: sessionUser, token });
  } catch (error: unknown) {
    console.error("Error in /api/auth/signup:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errMsg }, { status: 500 });
  }
}
