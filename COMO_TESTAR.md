# 🧪 Como Testar o FlowCloser

## 🚀 Opção 1: Script Automatizado (Recomendado)

Execute o script de testes que cobre todos os endpoints:

```bash
# Testar localmente (servidor deve estar rodando em localhost:8042)
./test-checklist.sh

# Ou testar em produção
./test-checklist.sh https://flowcloser-agent-production.up.railway.app
```

O script testa:

- ✅ Health check
- ✅ Listar agentes
- ✅ Instagram webhook (verificação e processamento)
- ✅ WhatsApp webhook (verificação e processamento)
- ✅ API direta de mensagens
- ✅ Ghostwriter
- ✅ Privacy Policy
- ✅ Terms of Service

---

## 🚀 Opção 2: Testes Manuais

### 1. Verificar se o servidor está rodando

```bash
# Iniciar servidor em desenvolvimento
npm run dev

# Ou em produção (após build)
npm run build
npm start
```

### 2. Testar Health Check

```bash
curl http://localhost:8042/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### 3. Testar Instagram Webhook

**Verificação (GET):**
```bash
curl "http://localhost:8042/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=flowcloser_webhook_neo&hub.challenge=test123"
```

**Processamento (POST):**
```bash
curl -X POST http://localhost:8042/api/webhooks/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123"},
        "message": {"text": "Quero um site"}
      }]
    }]
  }'
```

### 4. Testar API Direta

```bash
curl -X POST http://localhost:8042/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quero ver exemplos do seu trabalho",
    "channel": "instagram",
    "userId": "test_user_123"
  }'
```

### 5. Testar Ghostwriter

```bash
curl -X POST http://localhost:8042/api/agents/flowcloser/ghostwriter \
  -H "Content-Type: application/json" \
  -d '{
    "leadContext": {
      "name": "João",
      "projectType": "e-commerce",
      "painPoints": ["vendas online"]
    },
    "options": {
      "channel": "whatsapp",
      "leadType": "gestor",
      "urgency": true
    }
  }'
```

---

## 🌐 Testar em Produção (Railway)

Substitua `localhost:8042` por sua URL do Railway:

```bash
# Exemplo
curl https://flowcloser-agent-production.up.railway.app/health
```

Ou use o script:

```bash
./test-checklist.sh https://flowcloser-agent-production.up.railway.app
```

---

## 📋 Checklist de Testes

Antes de considerar tudo funcionando, verifique:

- [ ] Servidor inicia sem erros
- [ ] Health check responde
- [ ] Instagram webhook verifica corretamente
- [ ] Instagram webhook processa mensagens
- [ ] WhatsApp webhook verifica corretamente
- [ ] WhatsApp webhook processa mensagens
- [ ] API direta retorna respostas do agente
- [ ] Ghostwriter gera pitches
- [ ] Privacy Policy é acessível
- [ ] Terms of Service é acessível

---

## 🐛 Troubleshooting

### Erro: "Connection refused"
**Solução:** Certifique-se de que o servidor está rodando (`npm run dev`)

### Erro: "Cannot find module"
**Solução:** Execute `npm install` e depois `npm run build`

### Webhook não verifica
**Solução:** Verifique se o `WEBHOOK_VERIFY_TOKEN` está correto no `.env`

### Resposta vazia ou erro 500
**Solução:** Verifique os logs do servidor e se as variáveis de ambiente estão configuradas

---

## 📊 Verificar Logs

Os logs aparecem no console quando você roda `npm run dev`. Procure por:

- ✅ `✅ Webhook verified` - Webhook funcionando
- ✅ `📨 Message from...` - Mensagem recebida
- ✅ `✅ Response:` - Resposta gerada
- ⚠️ `⚠️ Primary model failed` - Fallback sendo usado
- ❌ `❌ Error:` - Erros que precisam atenção

---

## 🎯 Próximos Passos Após Testes

1. Se todos os testes passarem localmente:
   - Faça deploy no Railway
   - Teste novamente em produção
   - Configure webhooks no Meta Developer Console

2. Se algum teste falhar:
   - Verifique os logs
   - Confirme variáveis de ambiente
   - Consulte a documentação específica do endpoint

