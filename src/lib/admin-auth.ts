import { NextResponse } from "next/server";
import { isPinHashAuthorized } from "@/lib/pin";

export function enforceAdmin(request: Request) {
  const header = request.headers.get("x-admin-pin-hash") ?? "";
  if (!isPinHashAuthorized(header)) {
    return NextResponse.json(
      { message: "Admin PIN required" },
      { status: 401 }
    );
  }
  return null;
}
