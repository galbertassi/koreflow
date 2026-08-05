# Arquitetura de Billing e Subscriptions (KORE Flow)

Este documento descreve a arquitetura definitiva do módulo comercial (Billing e Subscriptions) do KORE Flow, integrando um modelo de Free Trial (interno) com Stripe (pagamentos).

## 1. Princípios Arquiteturais

- **Fonte de Verdade Isolada**: 
  - O banco de dados (`kore_subscriptions`) é apenas um *espelho* (Read Model) do estado real do Stripe.
  - As atualizações de faturamento e pagamentos vêm estritamente via **Webhooks** do Stripe.
- **Entitlements Centralizados**: O acesso e os privilégios da aplicação são totalmente resolvidos por uma única função (`getUserEntitlements`), garantindo que rotas protegidas não chequem `company.plan` ou tabelas avulsas.
- **Idempotência**: Webhooks e RPCs de provisionamento garantem que múltiplos acionamentos não quebrem ou dupliquem o estado.
- **Feature Flagging**: Toda a infraestrutura está isolada em `src/lib/billing`. É possível ligar/desligar a integração no frontend e validações através do objeto `billingConfig`.

---

## 2. Diagrama de Entidades (ERD)

```mermaid
erDiagram
    auth_users ||--o{ kore_company_users : "possui"
    kore_company_users }o--|| kore_companies : "pertence"
    
    kore_companies {
        UUID id PK
        TEXT workspace_type "personal | organization"
        UUID personal_owner_user_id "Garante 1 personal per user"
        TEXT stripe_customer_id "Mapeamento para Checkout/Portal"
        TIMESTAMP trial_started_at
        TIMESTAMP trial_ends_at
    }

    kore_companies ||--o{ kore_subscriptions : "tem 0..1"
    
    kore_subscriptions {
        UUID id PK
        UUID company_id FK
        TEXT stripe_subscription_id UNIQUE
        TEXT status "active, past_due, trialing, canceled..."
        TIMESTAMP past_due_since "Carência"
        BOOLEAN cancel_at_period_end "Evita downgrades imediatos"
        TEXT last_stripe_event_id "Evita concorrência e falhas de ordem"
    }
```

---

## 3. Fluxo de Signup (Onboarding)

1. **Client-side**: Usuário preenche email/senha e envia via formulário.
2. **Server Action (`signUp`)**: Chama `supabase.auth.signUp()`. O banco cria o usuário em `auth.users`. Nenhum provisionamento de workspace é feito nesta etapa. 
3. **Server Action (`login`)**: Na tela de login, quando o usuário entra com sucesso, chamamos imediatamente a RPC `ensure_my_personal_workspace`.
4. **RPC Segura (DB)**: O Postgres utiliza `auth.uid()` para criar atômicamente um `workspace_type = 'personal'` (iniciando o Trial Interno de 14 dias) se não existir.

---

## 4. Integração Stripe e Webhooks

A arquitetura utiliza o padrão **Async Webhook Mirror**.

### Fluxo de Checkout
1. Usuário clica em "Fazer Upgrade".
2. O Backend chama a API do Stripe (`stripe.checkout.sessions.create`).
3. É fornecido o `company_id` e o `user_id` em `metadata`. Se `kore_companies.stripe_customer_id` estiver vazio, o Stripe cria um novo Customer, e a aplicação o salva no banco.
4. Ao concluir, o Stripe envia um webhook (`checkout.session.completed` / `customer.subscription.created`).

### Recepção de Webhooks
Os eventos chegam na rota `/api/stripe/webhook`:
1. Validação de assinatura criptográfica.
2. O evento é registrado na tabela `kore_stripe_events` (garantia de **Idempotência**).
3. Se processado com sucesso, faz Upsert na tabela `kore_subscriptions`.
4. Em caso de falha transitória (timeout/race-condition), o evento é marcado como `pending` para reconciliação.

---

## 5. Casos Especiais (Edge Cases) Tratados

### Downgrade (Cancelamento no meio do ciclo)
Se o usuário cancela a assinatura, o Stripe envia `customer.subscription.updated` com `cancel_at_period_end = true`.
- A assinatura no banco continuará `status = active`.
- O `getUserEntitlements` lerá o campo e devolverá a reason `"CANCELED_UNTIL_PERIOD_END"`. O usuário mantém acesso total até o último segundo pago. Após a data, o Stripe envia o status `canceled`, o espelho atualiza, e a conta cai para `"FREE_PLAN"`.

### Inadimplência (Past Due)
O sistema foi desenhado para evitar interrupções abruptas por falha de cartão.
- Quando o cartão falha, Stripe envia status `past_due`.
- A aplicação marca a data em `past_due_since`.
- O `getUserEntitlements` aplica a tolerância (`billingConfig.pastDueGraceDays`).
- Se dentro da tolerância: `"PAST_DUE_GRACE_PERIOD"` (Pro Acesso mantido).
- Fora da tolerância: Cai para Free, com avisos de UI.

---

## 6. Segurança (RLS e Isolation)

A camada de Billing depende da segurança de linha do Supabase:
- **`kore_subscriptions`**: Select liberado apenas para administradores/owners cujo `auth.uid()` pertença a `kore_company_users` associado à `company_id`. Operações INSERT/UPDATE/DELETE são bloqueadas para clientes (apenas Service Role pode alterar).
- **`kore_stripe_events`**: Nenhuma política de client, bloqueado inteiramente para acessos front-end.
- **`ensure_my_personal_workspace`**: Função com flag `SECURITY DEFINER` que ignora quaisquer parâmetros de ID no body e forçosamente opera sob o resultado de `auth.uid()`, imune a parameter tampering.
