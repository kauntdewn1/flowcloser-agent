# 🧪 Guia de Testes - FlowCloser API

Guia completo para testar todos os endpoints e funcionalidades do FlowCloser Agent.

## 🚀 Iniciando o Servidor

### Modo Desenvolvimento (com hot-reload)
```bash
npm run dev
```

### Modo Produção (após build)
```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:8042` (ou na porta definida em `PORT`).

## ✅ Testes Básicos

### 1. Health Check

Verifica se o servidor está rodando:

```bash
curl http://localhost:8042/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T23:19:33.859Z"
}
```

### 2. Listar Agentes

Verifica quais agentes estão disponíveis:

```bash
curl http://localhost:8042/api/agents
```

**Resposta esperada:**
```json
{
  "agents": ["flowcloser"],
  "status": "ok"
}
```

### 3. Enviar Mensagem ao Agente

Testa o agente FlowCloser com uma mensagem:

```bash
curl -X POST http://localhost:8042/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?",
    "sessionId": "test-session-123"
  }'
```

**Resposta esperada:**
```json
{
  "response": "Resposta do agente...",
  "sessionId": "test-session-123"
}
```

**Exemplo completo:**
```bash
# Teste com mensagem simples
curl -X POST http://localhost:8042/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero criar um site"}'

# Teste com sessionId específico
curl -X POST http://localhost:8042/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Preciso de ajuda com vendas",
    "sessionId": "user-123"
  }'
```

## 📱 Testes do Instagram Webhook

### 4. Verificação do Webhook (GET)

O Instagram envia uma requisição GET para verificar o webhook:

```bash
curl "http://localhost:8042/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=flowcloser_webhook_neo&hub.challenge=test_challenge_123"
```

**Resposta esperada:**
```
test_challenge_123
```

**Nota:** O `hub.verify_token` deve corresponder ao valor de `WEBHOOK_VERIFY_TOKEN` no `.env`.

### 5. Receber Eventos do Instagram (POST)

Simula um evento de mensagem do Instagram:

```bash
curl -X POST http://localhost:8042/api/webhooks/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {
          "id": "123456789"
        },
        "message": {
          "text": "Olá, preciso de ajuda"
        }
      }]
    }]
  }'
```

**Resposta esperada:**
```
EVENT_RECEIVED
```

**Exemplo completo de payload do Instagram:**
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "instagram-page-id",
      "messaging": [
        {
          "sender": {
            "id": "user-instagram-id"
          },
          "recipient": {
            "id": "instagram-page-id"
          },
          "timestamp": 1234567890,
          "message": {
            "mid": "message-id",
            "text": "Mensagem do usuário"
          }
        }
      ]
    }
  ]
}
```

## 🔐 Testes de OAuth Instagram

### 6. Callback OAuth Instagram

Após o usuário autorizar no Instagram, o Facebook redireciona para este endpoint:

```bash
# Simulação do callback (normalmente feito pelo Facebook)
curl "http://localhost:8042/api/auth/instagram/callback?code=AUTHORIZATION_CODE_AQUI"
```

**Resposta esperada:**
- HTML de sucesso com mensagem de autenticação
- Ou erro se o código for inválido

**Nota:** Este endpoint normalmente é chamado automaticamente pelo Facebook após a autorização do usuário. Para testar manualmente, você precisa:

1. Obter um código de autorização válido do Facebook Developer Console
2. Ou usar o fluxo completo de OAuth no navegador

## 🧪 Testes com Postman/Insomnia

### Collection JSON para Postman

Você pode importar esta collection no Postman:

```json
{
  "info": {
    "name": "FlowCloser API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:8042/health"
      }
    },
    {
      "name": "List Agents",
      "request": {
        "method": "GET",
        "url": "http://localhost:8042/api/agents"
      }
    },
    {
      "name": "Send Message",
      "request": {
        "method": "POST",
        "url": "http://localhost:8042/api/agents/flowcloser/message",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Olá, como você pode me ajudar?\",\n  \"sessionId\": \"test-123\"\n}"
        }
      }
    },
    {
      "name": "Instagram Webhook Verify",
      "request": {
        "method": "GET",
        "url": "http://localhost:8042/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=flowcloser_webhook_neo&hub.challenge=test123"
      }
    },
    {
      "name": "Instagram Webhook Event",
      "request": {
        "method": "POST",
        "url": "http://localhost:8042/api/webhooks/instagram",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"object\": \"instagram\",\n  \"entry\": [{\n    \"messaging\": [{\n      \"sender\": {\"id\": \"123\"},\n      \"message\": {\"text\": \"Teste\"}\n    }]\n  }]\n}"
        }
      }
    }
  ]
}
```

## 🔍 Verificações de Logs

### Monitorar logs em tempo real

Durante os testes, monitore os logs do servidor para ver:
- Mensagens recebidas
- Respostas geradas
- Erros ou warnings

**Exemplo de logs esperados:**
```
🚀 FlowCloser API running on port 8042
📍 Health check: http://0.0.0.0:8042/health
📍 Agents: http://0.0.0.0:8042/api/agents
📍 Instagram Webhook: http://0.0.0.0:8042/api/webhooks/instagram
📍 Instagram OAuth Callback: http://0.0.0.0:8042/api/auth/instagram/callback

📨 Message from 123456789: Olá, preciso de ajuda
✅ Response: [Resposta do agente]
```

## 🌐 Testes em Produção (Railway)

### URLs de Produção

Substitua `localhost:8042` por `https://flowcloser-agent-production.up.railway.app`:

```bash
# Health check em produção
curl https://flowcloser-agent-production.up.railway.app/health

# Listar agentes em produção
curl https://flowcloser-agent-production.up.railway.app/api/agents

# Enviar mensagem em produção
curl -X POST https://flowcloser-agent-production.up.railway.app/api/agents/flowcloser/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Teste em produção"}'
```

## ⚙️ Configuração do Webhook Instagram

### Passos para configurar o webhook no Facebook Developer Console:

1. **Acesse o Facebook Developer Console**
   - Vá para https://developers.facebook.com
   - Selecione seu app do Instagram

2. **Configure o Webhook**
   - URL do Callback: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
   - Token de Verificação: `flowcloser_webhook_neo` (deve corresponder ao `WEBHOOK_VERIFY_TOKEN`)
   - Campos de Assinatura: `messages`, `messaging_postbacks`

3. **Teste a Verificação**
   - Clique em "Verificar e Salvar"
   - O Facebook enviará uma requisição GET para verificar o webhook
   - Se configurado corretamente, retornará o `hub.challenge`

4. **Assine os Eventos**
   - Selecione a página do Instagram
   - Assine os eventos: `messages`, `messaging_postbacks`

## 🐛 Troubleshooting

### Erro: "Missing authorization code"
- Verifique se o `INSTAGRAM_REDIRECT_URI` está correto no `.env`
- Certifique-se de que a URL está registrada no Facebook Developer Console

### Erro: "Webhook verification failed"
- Verifique se o `WEBHOOK_VERIFY_TOKEN` corresponde ao configurado no Facebook
- Certifique-se de que o endpoint está acessível publicamente (HTTPS em produção)

### Erro: "Failed to process message"
- Verifique se as variáveis de ambiente estão configuradas (`IQAI_API_KEY`, `OPENAI_API_KEY`)
- Verifique os logs do servidor para mais detalhes

### Erro: "EADDRINUSE: address already in use"
- A porta 8042 está em uso
- Encontre o processo: `lsof -i :8042`
- Encerre o processo: `kill <PID>`
- Ou use outra porta: `PORT=3000 npm start`

## 📊 Checklist de Testes

Antes de fazer deploy em produção, certifique-se de testar:

- [ ] Health check responde corretamente
- [ ] Listagem de agentes funciona
- [ ] Envio de mensagem ao agente funciona
- [ ] Webhook do Instagram verifica corretamente (GET)
- [ ] Webhook do Instagram recebe eventos (POST)
- [ ] OAuth callback funciona (se aplicável)
- [ ] Logs estão sendo gerados corretamente
- [ ] Variáveis de ambiente estão configuradas
- [ ] Servidor responde em produção (Railway)

## 🔗 Links Úteis

- [Documentação Instagram Messaging API](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Facebook Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)
- [Railway Logs](https://docs.railway.app/develop/logs)

