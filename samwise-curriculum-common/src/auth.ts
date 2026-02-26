import { jwtVerify } from "jose";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export async function validateToken(authHeader: string | undefined): Promise<boolean> {
  if (!JWT_SECRET) {
    return true;
  }
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

