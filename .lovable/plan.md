

# Direcionar formulário de contato para ninamturin@gmail.com

Atualmente o formulário em `/contato` apenas simula o envio (timeout + toast), sem entregar a mensagem em lugar nenhum. Vamos fazer com que cada submissão chegue de fato no e-mail **ninamturin@gmail.com**.

## Abordagem

Usar **Resend** (via Lovable Cloud / Lovable AI Gateway-friendly, compatível com o runtime Worker) através de uma **server function** do TanStack Start. É a forma mais robusta — não depende do cliente de e-mail do usuário e registra o envio no servidor.

### Fluxo

```text
Formulário (cliente)
   └─► server function `enviarContato`
          └─► Resend API  ──►  ninamturin@gmail.com
```

## Mudanças

1. **Nova server function** `src/lib/contato/enviar-contato.ts`
   - `createServerFn({ method: "POST" })` com validação Zod (nome, e-mail, assunto, mensagem)
   - Chama a API da Resend via `fetch` usando `RESEND_API_KEY` (secret)
   - Destinatário fixo: `ninamturin@gmail.com`
   - Assunto do e-mail: `[Dashboard Emendas] {assunto}`
   - Corpo em HTML com nome, e-mail de resposta (`reply_to`) e mensagem formatada
   - Retorna `{ ok: true }` ou lança erro tratável

2. **Atualizar `src/routes/contato.tsx`**
   - Trocar o `setTimeout` simulado pela chamada real à server function
   - Tratar erro com `toast.error` e sucesso com `toast.success`
   - Manter UX atual (botão "Enviando…", reset do form)
   - Atualizar o e-mail exibido no card "Informações" para **ninamturin@gmail.com**

3. **Configurar secret `RESEND_API_KEY`**
   - Solicitar a chave via Lovable Cloud (uma única vez); o usuário cola a key gerada em https://resend.com/api-keys
   - O remetente padrão será `Dashboard Emendas <onboarding@resend.dev>` (domínio de teste da Resend, funciona sem verificação) — depois pode ser trocado por um domínio próprio

## Arquivos

**Criar:** `src/lib/contato/enviar-contato.ts`
**Editar:** `src/routes/contato.tsx`
**Secret novo:** `RESEND_API_KEY`

