# 📱 Guia Passo a Passo - Configuração no Meta Developer Console

## 🎯 Objetivo

Configurar completamente o FlowCloser v1.2 no Meta Developer Console para receber mensagens do Instagram e WhatsApp.

---

## 📋 PASSO 1: Acessar o Meta Developer Console

1. Acesse: https://developers.facebook.com/apps/
2. Faça login com sua conta Meta
3. Selecione seu App existente:
   - **App ID**: `2706639773011042`
   - **Nome**: (seu app)

---

## 📋 PASSO 2: Configurar Webhook do Instagram

### 2.1 Navegar até Webhooks

1. No menu lateral, clique em **Produtos**
2. Clique em **Instagram** (ou adicione se não tiver)
3. No submenu, clique em **Configurações**
4. Role até a seção **Webhooks**

### 2.2 Adicionar/Editar Webhook

1. Clique em **Adicionar Webhook** ou **Editar** (se já existir)
2. Preencha os campos:

   **URL do Callback:**
   ```
   https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram
   ```

   **Token de Verificação:**
   ```
   flowcloser_webhook_neo
   ```

   **Campos de Assinatura:**
   - ✅ Marque `messages` (obrigatório)
   - ✅ Marque `messaging_postbacks` (opcional, para botões)

3. Clique em **Verificar e Salvar**

### 2.3 Verificar se Funcionou

- Meta vai fazer uma requisição GET para seu webhook
- Se tudo estiver correto, você verá: ✅ **"Webhook verificado com sucesso"**
- Se der erro, verifique:
  - URL está correta e acessível?
  - Token está correto no código?
  - Servidor está rodando?

---

## 📋 PASSO 3: Configurar OAuth Redirect URI

1. Ainda em **Instagram** → **Configurações**
2. Role até **OAuth Redirect URIs**
3. Clique em **Adicionar URI**
4. Cole:
   ```
   https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
   ```
5. Clique em **Salvar Alterações**

---

## 📋 PASSO 4: Configurar Páginas Legais (OBRIGATÓRIO)

### 4.1 Navegar até Páginas Legais

1. No menu lateral, clique em **Configurações**
2. Clique em **Básico**
3. Role até **Páginas Legais**

### 4.2 Adicionar URLs

**URL da Política de Privacidade:**
```
https://flowcloser-agent-production.up.railway.app/privacy-policy
```

**URL dos Termos de Serviço:**
```
https://flowcloser-agent-production.up.railway.app/terms-of-service
```

3. Clique em **Salvar Alterações**

**⚠️ IMPORTANTE:** Essas URLs devem estar acessíveis publicamente e retornar HTML válido.

---

## 📋 PASSO 5: Configurar Permissões do Instagram

### 5.1 Navegar até Permissões

1. Vá em **Produtos** → **Instagram** → **Permissões**
2. Ou vá em **App Review** → **Permissions and Features**

### 5.2 Solicitar Permissões Necessárias

Clique em **Solicitar** ou **Adicionar** para cada uma:

- ✅ `instagram_basic` (geralmente já está ativa)
- ✅ `instagram_manage_messages` (para enviar mensagens)
- ✅ `pages_show_list` (para listar páginas conectadas)
- ✅ `pages_messaging` (para mensagens via Messenger)

### 5.3 Preencher Formulário de Revisão

Para cada permissão, você precisará:

1. **Como você usa essa permissão?**
   ```
   Usamos para responder mensagens diretas do Instagram automaticamente 
   com nosso agente de vendas FlowCloser, que ajuda leads interessados 
   em presença digital (sites, PWAs, micro SaaS).
   ```

2. **Instruções para o revisor:**
   ```
   1. Envie uma mensagem para nossa conta do Instagram
   2. O bot responderá automaticamente com uma proposta visual
   3. O bot qualificará o lead e direcionará para WhatsApp para fechamento
   ```

3. **Screenshots/Vídeos:**
   - Tire screenshot do fluxo funcionando
   - Ou grave um vídeo mostrando o bot respondendo

4. Clique em **Enviar para Revisão**

---

## 📋 PASSO 6: Configurar Webhook do WhatsApp

### 6.1 Adicionar Produto WhatsApp

1. No menu lateral, clique em **Produtos**
2. Clique em **+ Adicionar Produto**
3. Procure por **WhatsApp** e clique em **Configurar**

### 6.2 Configurar Número do WhatsApp Business

1. Vá em **WhatsApp** → **Configuração**
2. Clique em **Adicionar número de telefone**
3. Siga as instruções para verificar seu número
4. Anote o **Phone Number ID** gerado

### 6.3 Configurar Webhook

1. Ainda em **WhatsApp** → **Configuração**
2. Role até **Webhooks**
3. Clique em **Configurar Webhooks**
4. Preencha:

   **URL do Callback:**
   ```
   https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp
   ```

   **Token de Verificação:**
   ```
   flowcloser_webhook_neo
   ```

   **Campos de Assinatura:**
   - ✅ Marque `messages`
   - ✅ Marque `message_status` (opcional, para status de entrega)

5. Clique em **Verificar e Salvar**

### 6.4 Obter Token de Acesso

1. Vá em **WhatsApp** → **Configuração** → **Tokens de acesso**
2. Clique em **Gerar token**
3. Selecione sua página/conta
4. **COPIE O TOKEN** (você só verá uma vez!)
5. Adicione no Railway como variável de ambiente:
   ```
   WHATSAPP_ACCESS_TOKEN=seu_token_aqui
   ```

---

## 📋 PASSO 7: Testar os Webhooks

### 7.1 Testar Instagram

1. No Meta Developer Console, vá em **Webhooks**
2. Encontre o webhook do Instagram
3. Clique em **Testar**
4. Meta vai enviar um evento de teste
5. Verifique os logs do Railway:
   ```bash
   railway logs
   ```
6. Você deve ver: `📨 Message from ...` e `✅ Response: ...`

### 7.2 Testar WhatsApp

1. Envie uma mensagem para seu número do WhatsApp Business
2. Verifique os logs do Railway
3. O bot deve responder automaticamente

---

## 📋 PASSO 8: Configurar Variáveis no Railway

### 8.1 Acessar Railway

1. Acesse: https://railway.com
2. Vá no seu projeto: `flowcloser-agent-production`
3. Clique em **Variables**

### 8.2 Adicionar Variáveis

Adicione/verifique estas variáveis:

```env
# Meta/Instagram (já devem estar configuradas)
INSTAGRAM_APP_ID=2706639773011042
INSTAGRAM_APP_SECRET=f8a59233ba3f6df301b5f08fd8b3067f
INSTAGRAM_REDIRECT_URI=https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo

# WhatsApp (adicionar quando configurar)
WHATSAPP_ACCESS_TOKEN=seu_token_do_passo_6.4
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_do_passo_6.2
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id

# IQAI (já devem estar configuradas)
IQAI_API_KEY=97a16a55-05f0-4a39-826e-fe09cef13a53
AGENT_TOKEN_CONTRACT=0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4

# LLM (já devem estar configuradas)
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FALLBACK=gemini-2.5-flash
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIzaSy...

# Portfolio Visual (já deve estar configurada)
PORTFOLIO_URL=https://www.canva.com/design/DAG4sWWGiv8/...
```

### 8.3 Reiniciar Deploy

Após adicionar variáveis:
1. Vá em **Deployments**
2. Clique nos três pontos do deploy mais recente
3. Clique em **Redeploy**

---

## ✅ Checklist Final

Antes de considerar completo, verifique:

### Instagram
- [ ] Webhook verificado com sucesso
- [ ] OAuth Redirect URI adicionado
- [ ] Privacy Policy URL acessível
- [ ] Terms of Service URL acessível
- [ ] Permissões solicitadas
- [ ] Teste de webhook funcionando

### WhatsApp
- [ ] Número do WhatsApp Business verificado
- [ ] Webhook configurado e verificado
- [ ] Token de acesso obtido e configurado no Railway
- [ ] Phone Number ID configurado no Railway
- [ ] Teste de mensagem funcionando

### Geral
- [ ] Health check respondendo: https://flowcloser-agent-production.up.railway.app/health
- [ ] Todos os endpoints testados
- [ ] Logs aparecendo no Railway
- [ ] Bot respondendo corretamente

---

## 🧪 Testes Manuais

### Teste 1: Health Check
```bash
curl https://flowcloser-agent-production.up.railway.app/health
```
**Esperado:** `{"status":"ok","timestamp":"..."}`

### Teste 2: Webhook Instagram (Verificação)
```bash
curl "https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=flowcloser_webhook_neo&hub.challenge=test123"
```
**Esperado:** `test123`

### Teste 3: Webhook WhatsApp (Verificação)
```bash
curl "https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=flowcloser_webhook_neo&hub.challenge=test123"
```
**Esperado:** `test123`

### Teste 4: API Direta
```bash
curl -X POST https://flowcloser-agent-production.up.railway.app/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero um site", "channel": "instagram"}'
```
**Esperado:** Resposta JSON com `response` do agente

---

## 🚨 Troubleshooting

### Webhook não verifica
- ✅ Verifique se `WEBHOOK_VERIFY_TOKEN` está correto
- ✅ Verifique se o endpoint retorna texto (não JSON) no GET
- ✅ Verifique se o servidor está acessível publicamente
- ✅ Verifique os logs do Railway

### Mensagens não chegam
- ✅ Verifique se o webhook está ativo no Meta Console
- ✅ Verifique se as permissões foram aprovadas
- ✅ Verifique os logs do Railway para erros
- ✅ Teste enviando mensagem manualmente

### Privacy Policy não aparece
- ✅ Teste a URL no navegador
- ✅ Verifique se retorna HTML válido
- ✅ Verifique se não há redirecionamentos
- ✅ Verifique se está acessível sem autenticação

---

## 📞 Links Úteis

- **Meta Developer Console**: https://developers.facebook.com/apps/
- **Documentação Instagram API**: https://developers.facebook.com/docs/instagram-api/
- **Documentação WhatsApp API**: https://developers.facebook.com/docs/whatsapp/
- **Railway Dashboard**: https://railway.com/dashboard
- **Health Check**: https://flowcloser-agent-production.up.railway.app/health

---

**Última atualização:** FlowCloser v1.2 - Todas as funcionalidades implementadas ✅

