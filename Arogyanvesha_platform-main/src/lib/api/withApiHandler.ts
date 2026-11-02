import { NextRequest, NextResponse } from "next/server";
import { SupabaseConfigurationError } from "@/lib/supabase";

export function withApiHandler<TContext = unknown>(handler: (req: NextRequest, context: TContext) => Promise<Response>, route = "unknown") {
  return async (req: NextRequest, context: TContext) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AuthError") {
        return NextResponse.json({ code: "UNAUTHORIZED", message: error.message }, { status: 401 });
      }
      if (error instanceof SupabaseConfigurationError) {
        console.error("API configuration error", { route, configured: false });
        return NextResponse.json(
          { code: "SERVICE_CONFIGURATION_ERROR", message: "This service is not configured correctly. Please try again later." },
          { status: 503 },
        );
      }
      console.error("API route error", { route, errorName: error instanceof Error ? error.name : "UnknownError" });
      return NextResponse.json(
        { code: "SERVER_ERROR", message: "An unexpected server error occurred." },
        { status: 500 }
      );
    }
  };
}
