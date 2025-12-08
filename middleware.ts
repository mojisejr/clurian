import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				//get the cookie from the request
				cookie: request.headers.get("cookie") || "",
			},
		},
	);

	if (!session) {
		if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname === "/") {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	} else {
        if (request.nextUrl.pathname === "/login") {
            // If user is already logged in and accessing login page,
            // check for redirect parameter
            const redirect = request.nextUrl.searchParams.get("redirect");
            const redirectUrl = redirect || "/dashboard";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        if (request.nextUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/"],
};
