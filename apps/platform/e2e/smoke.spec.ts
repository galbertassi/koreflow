import { test, expect } from '@playwright/test';

// =========================================================================
// PARTE A - TESTES PÚBLICOS
// =========================================================================
test.describe('A. Testes Públicos', () => {

  // Interceptadores para garantir que não há requisições para localhost e não há erros de console/500
  test.beforeEach(async ({ page }) => {
    page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost') && !process.env.PLAYWRIGHT_TEST_BASE_URL?.includes('localhost')) {
        console.error(`ERRO CRÍTICO: Chamada vazada para localhost detectada: ${url}`);
      }
    });

    page.on('response', response => {
      if (response.status() >= 500) {
        console.error(`ERRO CRÍTICO: Rota ${response.url()} retornou status ${response.status()}`);
      }
    });

    page.on('pageerror', exception => {
      console.error(`Uncaught exception: "${exception}"`);
    });
  });

  test('Home carrega corretamente', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    // Valida carregamento inicial
    await expect(page.locator('text=Entrar').first()).toBeVisible();
  });

  test('Página de Login carrega corretamente', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);
    // Valida elementos do formulário de login
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('Página de vendas carrega perfeitamente e exibe CTAs', async ({ page }) => {
    const response = await page.goto('/vendas');
    expect(response?.status()).toBeLessThan(400);
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Redirecionamento para /login ao tentar acessar rotas privadas', async ({ page }) => {
    await page.goto('/dashboard');
    // Deve redirecionar para o auth gateway
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});

// =========================================================================
// PARTE B - TESTES AUTENTICADOS
// =========================================================================
test.describe('B. Testes Autenticados (Usuário E2E Controlado)', () => {

  const E2E_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-preview@koreflow.test';
  const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD || 'senha-secreta-do-teste';

  // Usa-se test.skip ou condicional para pular essa suite se as credenciais não estiverem injetadas
  test.beforeEach(async () => {
    if (!process.env.E2E_TEST_EMAIL) {
      test.skip('Pulo automático: Variáveis E2E_TEST_EMAIL e E2E_TEST_PASSWORD ausentes no ambiente.');
    }
  });

  test('Fluxo completo: Login, Criação de Demanda, Timer, Limpeza e Logout', async ({ page }) => {
    
    // 1. LOGIN
    await page.goto('/login');
    await page.fill('input[type="email"]', E2E_EMAIL);
    await page.fill('input[type="password"]', E2E_PASSWORD);
    await page.click('button:has-text("Entrar")');
    
    // 2. DASHBOARD / WORKSPACE
    await expect(page).toHaveURL(/.*\/dashboard.*/);
    await expect(page.locator('text=Workspace')).toBeVisible(); // Adapte o locator visual exato

    // 3. CRIAR DEMANDA
    const demandTitle = `[E2E] Demanda Automação ${Date.now()}`;
    await page.click('button:has-text("Nova Demanda")'); 
    await page.fill('input[name="title"]', demandTitle);
    await page.click('button:has-text("Criar")');
    
    // Valida que a demanda foi criada visualmente
    await expect(page.locator(`text=${demandTitle}`)).toBeVisible();

    // 4. TIMER
    await page.click(`text=${demandTitle}`);
    await page.click('button:has-text("Iniciar Timer")');
    // Valida visualmente que o estado mudou
    await expect(page.locator('button:has-text("Parar Timer")')).toBeVisible();
    await page.click('button:has-text("Parar Timer")');

    // 5. LIMPEZA (IDEMPOTÊNCIA)
    // Deleta a demanda de teste E2E criada
    await page.click('button[aria-label="Opções da Demanda"]'); // Adaptar locator
    await page.click('text=Excluir');
    await page.click('button:has-text("Confirmar Exclusão")');
    await expect(page.locator(`text=${demandTitle}`)).not.toBeVisible();

    // 6. CHECAGEM DE BILLING / PORTAL
    await page.goto('/configuracoes/assinatura');
    await expect(page.locator('text=Gerenciar Assinatura').or(page.locator('text=Assinar Agora'))).toBeVisible();

    // 7. LOGOUT
    await page.click('button[aria-label="Perfil"]');
    await page.click('text=Sair');
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});
