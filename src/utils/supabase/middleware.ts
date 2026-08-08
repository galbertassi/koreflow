import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Se as chaves do Supabase não estiverem configuradas, permite acesso livre
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const hostname = request.headers.get("host") || "";

  // Se entrar pelo domínio flow na raiz, reescreve silenciosamente para a página de vendas
  if (hostname.includes("flow.koredigital.com.br") && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/vendas";
    return NextResponse.rewrite(url);
  }

  // Se tentar acessar a raiz pelo app.koredigital.com.br sem estar logado, vai pro login depois
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error("Erro ao verificar sessão no Supabase:", error);
  }

  // Rotas públicas que não precisam de login
  const isPublicRoute = 
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/cadastro") ||
    request.nextUrl.pathname.startsWith("/vendas") ||
    request.nextUrl.pathname.startsWith("/termos-de-uso") ||
    request.nextUrl.pathname.startsWith("/privacidade") ||
    request.nextUrl.pathname.startsWith("/ping") ||
    request.nextUrl.pathname.startsWith("/sitemap.xml") ||
    request.nextUrl.pathname.startsWith("/robots.txt");

  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
