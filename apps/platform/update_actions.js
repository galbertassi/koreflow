const fs = require('fs');

const code = `"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const isValidHellen = email === "hellen.rivello@hotmail.com" && password === "588zije3";
  const isValidAdmin = email === "admin@koreflow.com" && password === "admin";

  if (isValidHellen || isValidAdmin) {
    const cookieStore = await cookies();
    cookieStore.set("koreflow_session", "authenticated", { path: "/" });
    revalidatePath("/", "layout");
    redirect("/");
  } else {
    redirect("/login?error=Credenciais_invalidas");
  }
}

export async function signup(formData) {
  redirect("/login?error=Cadastro_indisponivel");
}
`;

fs.writeFileSync('src/app/login/actions.ts', code, 'utf8');
console.log('Login actions mocked successfully!');
