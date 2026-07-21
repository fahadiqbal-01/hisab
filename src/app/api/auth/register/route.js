import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

t
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;
    const normalizedEmail = email?.toString().trim().toLowerCase();


    if (!normalizedEmail || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }


    const { data: existingAppUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (existingAppUser) {
      return NextResponse.json(
        { message: "Account already exists. Please sign in." },
        { status: 409 },
      );
    }

  
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: `${firstName} ${lastName}` },
      });

    if (authError) {
      const authMessage = authError.message?.toLowerCase() || "";
      if (
        authMessage.includes("already") ||
        authMessage.includes("exists") ||
        authMessage.includes("duplicate")
      ) {
        return NextResponse.json(
          { message: "Account already exists. Please sign in." },
          { status: 409 },
        );
      }
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`;

    const { error: insertError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        email: normalizedEmail,
        full_name: fullName,
      },
    ]);

    if (insertError) {
      console.error("Database Insert Error:", insertError.message);

      if (authData?.user?.id) {
        const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(
          authData.user.id,
        );
        if (rollbackError) {
          console.error("Rollback Error (delete auth user):", rollbackError.message);
        }
      }

      const dbMessage = insertError.message?.toLowerCase() || "";
      if (
        dbMessage.includes("users_email_key") ||
        dbMessage.includes("duplicate key value") ||
        dbMessage.includes("already exists")
      ) {
        return NextResponse.json(
          { message: "Account already exists. Please sign in." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { message: `Database Error: ${insertError.message}` },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
