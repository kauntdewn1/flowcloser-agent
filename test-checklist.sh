#!/bin/bash

# 🧪 Script de Testes - FlowCloser v1.2
# Testa todos os endpoints mencionados no CHECKLIST_PRODUCAO.md

BASE_URL="${1:-http://localhost:8042}"
VERIFY_TOKEN="${WEBHOOK_VERIFY_TOKEN:-flowcloser_webhook_neo}"

echo "🧪 Testando FlowCloser API em: $BASE_URL"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "🔍 Testando: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ OK (HTTP $http_code)${NC}"
        if [ -n "$body" ] && [ ${#body} -lt 200 ]; then
            echo "   Resposta: $body"
        fi
        return 0
    else
        echo -e "${RED}❌ FALHOU (HTTP $http_code)${NC}"
        if [ -n "$body" ]; then
            echo "   Erro: $body"
        fi
        return 1
    fi
}

# Teste 1: Health Check
echo "📋 TESTE 1: Health Check"
test_endpoint "GET /health" "GET" "$BASE_URL/health"
echo ""

# Teste 2: Listar Agentes
echo "📋 TESTE 2: Listar Agentes"
test_endpoint "GET /api/agents" "GET" "$BASE_URL/api/agents"
echo ""

# Teste 3: Instagram Webhook - Verificação
echo "📋 TESTE 3: Instagram Webhook - Verificação"
test_endpoint "GET /api/webhooks/instagram (verificação)" "GET" \
    "$BASE_URL/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=test123"
echo ""

# Teste 4: Instagram Webhook - Processamento
echo "📋 TESTE 4: Instagram Webhook - Processamento"
test_endpoint "POST /api/webhooks/instagram" "POST" \
    "$BASE_URL/api/webhooks/instagram" \
    '{
        "object": "instagram",
        "entry": [{
            "messaging": [{
                "sender": {"id": "123"},
                "message": {"text": "Quero um site"}
            }]
        }]
    }'
echo ""

# Teste 5: WhatsApp Webhook - Verificação
echo "📋 TESTE 5: WhatsApp Webhook - Verificação"
test_endpoint "GET /api/webhooks/whatsapp (verificação)" "GET" \
    "$BASE_URL/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=test123"
echo ""

# Teste 6: WhatsApp Webhook - Processamento
echo "📋 TESTE 6: WhatsApp Webhook - Processamento"
test_endpoint "POST /api/webhooks/whatsapp" "POST" \
    "$BASE_URL/api/webhooks/whatsapp" \
    '{
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "from": "5511999999999",
                        "text": {"body": "Quero um site"}
                    }]
                }
            }]
        }]
    }'
echo ""

# Teste 7: API Direta - Mensagem
echo "📋 TESTE 7: API Direta - Enviar Mensagem"
test_endpoint "POST /api/agents/flowcloser/message" "POST" \
    "$BASE_URL/api/agents/flowcloser/message" \
    '{
        "message": "Quero ver exemplos do seu trabalho",
        "channel": "instagram",
        "userId": "test_user_123"
    }'
echo ""

# Teste 8: Ghostwriter
echo "📋 TESTE 8: Ghostwriter"
test_endpoint "POST /api/agents/flowcloser/ghostwriter" "POST" \
    "$BASE_URL/api/agents/flowcloser/ghostwriter" \
    '{
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
echo ""

# Teste 9: Privacy Policy
echo "📋 TESTE 9: Privacy Policy"
test_endpoint "GET /privacy-policy" "GET" "$BASE_URL/privacy-policy"
echo ""

# Teste 10: Terms of Service
echo "📋 TESTE 10: Terms of Service"
test_endpoint "GET /terms-of-service" "GET" "$BASE_URL/terms-of-service"
echo ""

# Resumo
echo "═══════════════════════════════════════════════════════════"
echo "✅ Testes concluídos!"
echo ""
echo "💡 Dica: Para testar em produção, execute:"
echo "   ./test-checklist.sh https://flowcloser-agent-production.up.railway.app"
echo ""

