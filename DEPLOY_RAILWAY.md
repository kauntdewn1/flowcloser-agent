# 🚀 Guia de Deploy no Railway

## ⚠️ Problemas Identificados nos Testes

Os testes em produção mostraram que:

- ❌ WhatsApp webhook não existe (404)
- ❌ Ghostwriter não existe (404)
- ❌ Privacy Policy não existe (404)
- ❌ Terms of Service não existe (404)
- ❌ API direta falhando (falta `better-sqlite3`)

**Causa:** O código em produção está desatualizado. Precisa fazer deploy novamente.

---

## 📋 Passo a Passo para Deploy

### Opção 1: Deploy via Git (Recomendado)

1. **Commit e push do código atual:**

   ```bash
   git add .
   git commit -m "feat: adiciona WhatsApp webhook, Ghostwriter e páginas legais"
   git push origin main
   ```

2. **Railway detecta automaticamente e faz deploy**

3. **Verificar logs:**
   ```bash
   railway logs
   ```

### Opção 2: Deploy Manual via Railway CLI

1. **Fazer login:**
   ```bash
   railway login
   ```

2. **Conectar ao projeto:**
   ```bash
   railway link
   ```

3. **Fazer deploy:**
   ```bash
   railway up
   ```

---

## ⚙️ Configurações Necessárias no Railway

### 1. Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas no Railway:

```env
# IQAI
IQAI_API_KEY=sua_chave_iqai

# LLM Models
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FALLBACK=gemini-2.5-flash

# API Keys
OPENAI_API_KEY=sua_chave_openai
GOOGLE_API_KEY=sua_chave_google

# Server
PORT=8042

# Webhooks
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo

# Instagram OAuth
INSTAGRAM_APP_ID=2706639773011042
INSTAGRAM_APP_SECRET=sua_chave_secreta
INSTAGRAM_REDIRECT_URI=https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback

# Portfolio (opcional)
PORTFOLIO_URL=https://www.canva.com/design/...
AGENT_TOKEN_CONTRACT=0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4
```

### 2. Build Settings

O Railway deve estar configurado para:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Node Version:** 18.x ou superior

### 3. Verificar Instalação de Dependências

O Railway deve executar `npm install` automaticamente, mas verifique se `better-sqlite3` está sendo instalado.

**Se `better-sqlite3` não instalar automaticamente:**

1. Adicione no `package.json` (já está, mas verifique):
   ```json
   "dependencies": {
     "better-sqlite3": "^11.10.0"
   }
   ```

2. Force rebuild no Railway:
   - Vá em Settings → Deploy
   - Clique em "Redeploy"

---

## 🔍 Verificar Deploy

Após o deploy, execute os testes:

```bash
./test-checklist.sh https://flowcloser-agent-production.up.railway.app
```

**Todos os testes devem passar:**
- ✅ Health Check
- ✅ Listar Agentes
- ✅ Instagram Webhook (GET e POST)
- ✅ WhatsApp Webhook (GET e POST)
- ✅ API Direta
- ✅ Ghostwriter
- ✅ Privacy Policy
- ✅ Terms of Service

---

## 🐛 Troubleshooting

### Erro: "Missing required peer dependency: better-sqlite3"

**Solução:**
1. Verifique se `better-sqlite3` está no `package.json` ✅ (já está)
2. Force rebuild no Railway
3. Verifique os logs do build: `railway logs`

### Erro: "Cannot GET /privacy-policy"

**Solução:**
- O código foi atualizado mas não foi feito deploy
- Faça commit e push novamente
- Ou force redeploy no Railway

### Erro: "Cannot GET /api/webhooks/whatsapp"

**Solução:**
- O código foi atualizado mas não foi feito deploy
- Verifique se o arquivo `src/main.ts` tem os endpoints do WhatsApp
- Faça deploy novamente

### Build falha no Railway

**Solução:**
1. Verifique os logs: `railway logs`
2. Teste build localmente: `npm run build`
3. Se funcionar localmente, pode ser problema de Node version no Railway
4. Configure Node 18+ no Railway

---

## ✅ Checklist de Deploy

Antes de considerar o deploy completo:

- [ ] Código commitado e pushado
- [ ] Railway detectou o push (ou deploy manual feito)
- [ ] Build passou sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Testes em produção passando (10/10)
- [ ] Logs mostrando servidor iniciado corretamente
- [ ] Health check respondendo

---

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
railway logs --tail

# Ver variáveis de ambiente
railway variables

# Adicionar variável
railway variables --set "NOME_VARIAVEL=valor"

# Redeploy manual
railway up

# Ver status do serviço
railway status
```

---

## 🎯 Próximos Passos Após Deploy

1. ✅ Verificar todos os testes passando
2. ✅ Configurar webhooks no Meta Developer Console
3. ✅ Testar recebimento de mensagens reais
4. ✅ Monitorar logs e métricas

---

**Status Atual:** Código local completo ✅ | Deploy em produção pendente ⚠️

