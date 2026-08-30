import { redirect } from "next/navigation";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; plan?: string; email?: string }>;
}) {
  const params = await searchParams;
  const intentQuery = params.intent ? `&intent=${encodeURIComponent(params.intent)}` : "";
  const planQuery = params.plan ? `&plan=${encodeURIComponent(params.plan)}` : "";
  const emailQuery = params.email ? `&email=${encodeURIComponent(params.email)}` : "";
  redirect(`/login?mode=signup${intentQuery}${planQuery}${emailQuery}`);
}
