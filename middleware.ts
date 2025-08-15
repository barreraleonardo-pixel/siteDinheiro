import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access to setup page
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your-supabase-url" ||
    supabaseAnonKey === "your-supabase-anon-key"
  ) {
    if (request.nextUrl.pathname.startsWith("/setup")) {
      return NextResponse.next()
    }
    // Redirect to setup if Supabase is not configured
    const url = request.nextUrl.clone()
    url.pathname = "/setup"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow access to login and setup pages without authentication
    if (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/setup")) {
      return supabaseResponse
    }

    // Redirect to login if no user
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error with Supabase, redirect to setup
    const url = request.nextUrl.clone()
    url.pathname = "/setup"
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
