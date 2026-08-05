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

  // Rotas públicas que não precisam de login
  const isPublicRoute = 
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/cadastro") ||
    request.nextUrl.pathname.startsWith("/vendas") ||
    request.nextUrl.pathname.startsWith("/termos-de-uso") ||
    request.nextUrl.pathname.startsWith("/privacidade") ||
    request.nextUrl.pathname === "/";

  // Se for uma rota pública, não precisamos verificar a sessão no banco de dados agora
  // Isso evita o erro de TIMEOUT da Vercel em páginas que deveriam carregar super rápido
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Se não for pública (dashboard, etc), aí sim verifica se tem sessão
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error("Erro ao verificar sessão no Supabase:", error);
  }

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
