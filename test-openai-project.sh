#!/bin/bash

# 🔍 Teste de Modelos Disponíveis no Projeto OpenAI

source .env 2>/dev/null || true

API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2)
ORG_ID="org-icjyrmJtDNf7AD6YdWTAh9Nu"
PROJECT_ID="proj_MTlevvRFUIPEO3n5ZPCWPQ3r"

echo "🔍 Testando modelos disponíveis no projeto..."
echo "═══════════════════════════════════════════════════════════"
echo ""

response=$(curl -s "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "OpenAI-Organization: ${ORG_ID}" \
  -H "OpenAI-Project: ${PROJECT_ID}")

if echo "$response" | grep -q '"error"'; then
    echo "❌ Erro na requisição:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    exit 1
fi

echo "✅ Modelos disponíveis no projeto:"
echo ""

# Listar modelos disponíveis
echo "$response" | jq -r '.data[] | select(.id | contains("gpt-4")) | .id' 2>/dev/null | sort | uniq

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Use um desses modelos no LLM_MODEL do .env"

