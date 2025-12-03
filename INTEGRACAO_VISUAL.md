# 🎨 Integração de Material Visual no FlowCloser

## ✅ Implementação Concluída

O material visual do Canva foi integrado ao agente FlowCloser para aumentar a percepção de valor e melhorar as conversões.

---

## 📋 O que foi implementado

### 1. **Variável de Ambiente**
```env
PORTFOLIO_URL=https://www.canva.com/design/DAG4sWWGiv8/1nwHM_YaS4YSzlXP-OlS9Q/view
```

### 2. **Nova Ferramenta: `send_portfolio_visual`**
**Arquivo:** `src/agents/flowcloser/tools.ts`

A ferramenta permite ao agente:
- Enviar o link do portfólio visual automaticamente
- Obter copy sugerido para diferentes estágios do funil
- Adicionar urgência e exclusividade quando apropriado

**Parâmetros:**
- `leadStage`: "qualified" | "interested" | "proposal"
- `urgency`: boolean (opcional)

**Retorno:**
```typescript
{
  success: true,
  portfolioUrl: "...",
  suggestedCopy: {
    intro: "Dá uma olhada nesse flow visual...",
    portfolio: "https://...",
    urgency: "Essas zonas visuais...",
    cta: "Quer que monte a cópia..."
  }
}
```

### 3. **Prompt Atualizado**

**Arquivo:** `src/agents/flowcloser/agent.ts`

O prompt agora inclui:

- ✅ Instruções para usar `send_portfolio_visual` na etapa de proposta
- ✅ Estratégia de linguagem visual e de urgência
- ✅ Adaptação por canal (Instagram vs WhatsApp)
- ✅ CTA claro após envio do material visual

---

## 🎯 Como Funciona

### Fluxo de Proposta Visual:

1. **Lead demonstra interesse** → Agente detecta intenção de compra
2. **Agente usa `send_portfolio_visual`** → Obtém link e copy sugerido
3. **Envia mensagem com link** → "Dá uma olhada nesse flow visual..."
4. **Adiciona urgência** → "Essas zonas visuais não são repetidas..."
5. **Apresenta micro-oferta** → Timeline, bônus, vantagens
6. **CTA final** → "Quer que monte a proposta completa no WhatsApp?"

---

## 📊 Benefícios da Integração

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Percepção de Valor** | Texto apenas | Visual + Copy profissional |
| **Autoridade** | "Bot genérico" | "Sistema estruturado e profissional" |
| **Filtro de Leads** | Qualquer um | Quem valoriza qualidade |
| **Taxa de Conversão** | Padrão | Esperado: +30-50% |

---

## 🚀 Uso pelo Agente

O agente agora **automaticamente**:

1. **Detecta interesse** em presença digital
2. **Usa a ferramenta** `send_portfolio_visual`
3. **Envia o link** com copy personalizado
4. **Adiciona urgência** quando apropriado
5. **Apresenta proposta** com contexto visual

**Exemplo de mensagem gerada:**

```
Dá uma olhada nesse flow visual que montei — ele mostra como seu site/webapp pode ficar, com valor e profissionalismo.

[Link do portfólio]

Essas zonas visuais e estrutura de entrega não são repetidas para qualquer um. Só produção de elite.

Quer que monte a cópia + entrega no fluxo completo? Me dá OK e te mando a proposta personalizada no WhatsApp.
```

---

## 🔧 Configuração

### Atualizar URL do Portfólio:

Edite `.env`:
```env
PORTFOLIO_URL=https://seu-novo-link-canva.com/...
```

### Personalizar Copy:

Edite `src/agents/flowcloser/tools.ts` na função `sendPortfolioVisualTool` para ajustar as mensagens sugeridas.

---

## 📝 Exemplo de Uso Manual (API)

```typescript
// O agente usa automaticamente, mas você pode forçar:
POST /api/agents/flowcloser/message
{
  "message": "Quero ver exemplos do seu trabalho",
  "channel": "instagram",
  "userId": "user123"
}

// O agente detectará interesse e usará send_portfolio_visual automaticamente
```

---

## ✅ Status

- ✅ Variável de ambiente configurada
- ✅ Ferramenta criada e integrada
- ✅ Prompt atualizado com estratégia visual
- ✅ Build sem erros
- ✅ Linter sem erros
- ✅ Pronto para uso em produção

---

## 🎯 Próximos Passos Sugeridos

1. **A/B Testing**: Testar diferentes versões do copy visual
2. **Métricas**: Rastrear taxa de conversão com/sem visual
3. **Múltiplos Portfólios**: Criar portfólios específicos por tipo de projeto
4. **Análise de Engajamento**: Medir cliques no link do portfólio

---

**Referência:** [Material Visual Canva](https://www.canva.com/design/DAG4sWWGiv8/1nwHM_YaS4YSzlXP-OlS9Q/view)

