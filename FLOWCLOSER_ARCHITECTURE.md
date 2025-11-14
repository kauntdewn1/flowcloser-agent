# 🚀 FlowCloser Architecture Plan - NEOFlow Ecosystem

## 📋 Executive Summary

Este documento apresenta um plano completo de arquitetura para o **FlowCloser**, um agente autônomo de vendas construído sobre o **ADK-TS** (Agent Development Kit for TypeScript). O agente será capaz de operar em múltiplos canais (Instagram DM, PWA, WhatsApp) com comportamento adaptativo, qualificação inteligente de leads e capacidade de fechar vendas autonomamente.

---

## 🏗️ Análise da Arquitetura ADK-TS

### Componentes Principais Identificados

#### 1. **Agents Layer** (`packages/adk/src/agents/`)
- **BaseAgent**: Classe abstrata base para todos os agentes
- **LlmAgent**: Implementação principal com suporte a LLM, tools, memory e sessions
- **AgentBuilder**: Builder pattern para construção fluente de agentes
- **SequentialAgent/ParallelAgent/LoopAgent**: Para composição multi-agente

#### 2. **Tools System** (`packages/adk/src/tools/`)
- **BaseTool**: Interface base para todas as ferramentas
- **FunctionTool**: Wrapper para funções JavaScript/TypeScript
- **createTool()**: Helper para criar tools com schemas Zod
- **ToolContext**: Contexto rico com acesso a state, memory, artifacts

#### 3. **Session & State Management** (`packages/adk/src/sessions/`)
- **Session**: Representa uma série de interações
- **State**: Sistema delta-aware para mudanças de estado
- **DatabaseSessionService**: Persistência em banco de dados
- **InMemorySessionService**: Para desenvolvimento/testes

#### 4. **Memory System** (`packages/adk/src/memory/`)
- **BaseMemoryService**: Interface para serviços de memória
- **InMemoryMemoryService**: Memória baseada em keywords
- **VertexAiRagMemoryService**: RAG com Vertex AI para busca semântica
- **LoadMemoryTool**: Tool para buscar memórias relevantes

#### 5. **Flows & Processors** (`packages/adk/src/flows/`)
- **BaseLlmFlow**: Pipeline de processamento de requests/responses
- **Request Processors**: instructions, contents, identity, nl-planning
- **Response Processors**: functions, agent-transfer, code-execution

#### 6. **Callbacks System** (`packages/adk/src/agents/`)
- **beforeAgentCallback**: Intercepta antes do agent run
- **afterAgentCallback**: Intercepta após o agent run
- **beforeModelCallback**: Intercepta antes da chamada LLM
- **afterModelCallback**: Intercepta após resposta LLM
- **beforeToolCallback**: Intercepta antes de executar tool
- **afterToolCallback**: Intercepta após executar tool

---

## 🎯 Recursos Recomendados para FlowCloser

### ✅ Core Features (Essenciais)

1. **AgentBuilder com LlmAgent**
   - Uso: `AgentBuilder.create("flowcloser").withModel().withInstruction()`
   - Benefício: API fluente e configuração declarativa

2. **Session Service com Database**
   - Uso: `createDatabaseSessionService()` para persistência
   - Benefício: Histórico de conversas e estado persistente

3. **State Management**
   - Uso: `context.state.set()` / `context.state.get()` em tools
   - Benefício: Rastreamento de qualificação, preferências, micro-ofertas

4. **Custom Tools com createTool()**
   - Uso: Tools para ações específicas (criar oferta, qualificar lead, etc.)
   - Benefício: Ações dinâmicas controladas pelo LLM

5. **Memory Service**
   - Uso: `VertexAiRagMemoryService` ou `InMemoryMemoryService`
   - Benefício: Busca de leads anteriores, padrões de comportamento

### ⚡ Advanced Features (Recomendados)

6. **Callbacks para Guardrails**
   - Uso: `beforeModelCallback` para validação de entrada
   - Benefício: Prevenção de erros, controle de comportamento

7. **ToolContext Metadata**
   - Uso: Passar `source` (channel) via metadata em ToolContext
   - Benefício: Comportamento adaptativo por canal

8. **HttpRequestTool**
   - Uso: Integração com APIs externas (webhooks, on-chain)
   - Benefício: Integração com sistemas externos

9. **Artifact Service**
   - Uso: Armazenar documentos de leads, contratos, propostas
   - Benefício: Persistência de arquivos relacionados

10. **Planner (BuiltInPlanner)**
    - Uso: Planejamento de estratégias de fechamento
    - Benefício: Raciocínio multi-step para vendas complexas

---

## 📐 Plano de Estruturação em 6 Etapas

### **Etapa 1: Setup Base e Configuração** ⚙️

**Objetivo**: Estabelecer estrutura básica com persistência e configuração de canal.

**Arquivos a criar**:
```
apps/examples/src/agents/flowcloser/
├── agent.ts                    # Agente principal
├── config.ts                    # Configurações (channels, behavior)
├── types.ts                     # TypeScript types para lead, offer, etc.
└── constants.ts                 # Constantes (CTAs, mensagens padrão)
```

**Implementação**:

```typescript
// apps/examples/src/agents/flowcloser/config.ts
export interface ChannelConfig {
  name: "instagram" | "whatsapp" | "pwa";
  ctaStyle: "swipe" | "click" | "checkout";
  tone: "casual" | "professional" | "playful";
}

export const CHANNEL_CONFIGS: Record<string, ChannelConfig> = {
  instagram: {
    name: "instagram",
    ctaStyle: "swipe",
    tone: "playful",
  },
  whatsapp: {
    name: "whatsapp",
    ctaStyle: "click",
    tone: "casual",
  },
  pwa: {
    name: "pwa",
    ctaStyle: "checkout",
    tone: "professional",
  },
};
```

```typescript
// apps/examples/src/agents/flowcloser/types.ts
export interface LeadQualification {
  intent: "high" | "medium" | "low" | "unknown";
  budget?: number;
  timeline?: string;
  painPoints: string[];
  source: "instagram" | "whatsapp" | "pwa";
  metadata?: Record<string, any>;
}

export interface MicroOffer {
  id: string;
  title: string;
  description: string;
  discount?: number;
  validUntil?: Date;
  conditions: string[];
}
```

**Checklist**:
- [ ] Criar estrutura de diretórios
- [ ] Configurar DatabaseSessionService
- [ ] Definir tipos TypeScript
- [ ] Configurar variáveis de ambiente

---

### **Etapa 2: Tools Essenciais de Qualificação e Ofertas** 🛠️

**Objetivo**: Criar tools para qualificar leads e gerenciar micro-ofertas.

**Tools a implementar**:

1. **QualifyLeadTool**: Analisa mensagem do usuário e atualiza qualificação
2. **CreateMicroOfferTool**: Cria ofertas personalizadas baseadas em hesitação
3. **TrackBehaviorTool**: Registra comportamento do usuário (cliques, hesitações)
4. **GetChannelContextTool**: Retorna configuração do canal atual

**Implementação**:

```typescript
// apps/examples/src/agents/flowcloser/tools/qualify-lead-tool.ts
import { createTool } from "@iqai/adk";
import { z } from "zod";
import type { LeadQualification } from "../types";

export const qualifyLeadTool = createTool({
  name: "qualify_lead",
  description: "Qualifies a lead based on their message and updates session state",
  schema: z.object({
    intent: z.enum(["high", "medium", "low", "unknown"]).describe("Lead intent level"),
    budget: z.number().optional().describe("Estimated budget if mentioned"),
    timeline: z.string().optional().describe("Timeline for purchase if mentioned"),
    painPoints: z.array(z.string()).optional().describe("Pain points identified"),
  }),
  fn: async ({ intent, budget, timeline, painPoints }, context) => {
    // Get current lead data from state
    const currentLead: LeadQualification = context.state.get("lead", {
      intent: "unknown",
      painPoints: [],
      source: context.state.get("channel", "pwa"),
    });

    // Update lead qualification
    const updatedLead: LeadQualification = {
      ...currentLead,
      intent,
      budget: budget || currentLead.budget,
      timeline: timeline || currentLead.timeline,
      painPoints: [...(currentLead.painPoints || []), ...(painPoints || [])],
      metadata: {
        ...currentLead.metadata,
        lastQualifiedAt: new Date().toISOString(),
        qualificationCount: (currentLead.metadata?.qualificationCount || 0) + 1,
      },
    };

    context.state.set("lead", updatedLead);
    context.state.set("lead_intent", intent);

    return {
      success: true,
      lead: updatedLead,
      message: `Lead qualified as ${intent} intent`,
    };
  },
});
```

```typescript
// apps/examples/src/agents/flowcloser/tools/create-micro-offer-tool.ts
import { createTool } from "@iqai/adk";
import { z } from "zod";
import type { MicroOffer } from "../types";

export const createMicroOfferTool = createTool({
  name: "create_micro_offer",
  description: "Creates a personalized micro-offer to overcome hesitation",
  schema: z.object({
    title: z.string().describe("Offer title"),
    description: z.string().describe("Offer description"),
    discount: z.number().optional().describe("Discount percentage (0-100)"),
    validUntil: z.string().optional().describe("Offer expiration (ISO date)"),
    conditions: z.array(z.string()).optional().describe("Offer conditions"),
  }),
  fn: async ({ title, description, discount, validUntil, conditions }, context) => {
    const offer: MicroOffer = {
      id: `offer_${Date.now()}`,
      title,
      description,
      discount,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      conditions: conditions || [],
    };

    // Store offer in state
    const offers = context.state.get("micro_offers", []);
    offers.push(offer);
    context.state.set("micro_offers", offers);
    context.state.set("last_offer", offer);

    return {
      success: true,
      offer,
      message: `Micro-offer created: ${title}`,
    };
  },
});
```

```typescript
// apps/examples/src/agents/flowcloser/tools/get-channel-context-tool.ts
import { createTool } from "@iqai/adk";
import { z } from "zod";
import { CHANNEL_CONFIGS } from "../config";

export const getChannelContextTool = createTool({
  name: "get_channel_context",
  description: "Gets the current channel configuration and context",
  schema: z.object({}),
  fn: async (_, context) => {
    // Try to get channel from ToolContext metadata or state
    const channel = 
      (context as any).metadata?.source || 
      context.state.get("channel", "pwa");
    
    const config = CHANNEL_CONFIGS[channel] || CHANNEL_CONFIGS.pwa;

    return {
      channel,
      config,
      ctaStyle: config.ctaStyle,
      tone: config.tone,
      message: `Current channel: ${channel}`,
    };
  },
});
```

**Checklist**:
- [ ] Implementar QualifyLeadTool
- [ ] Implementar CreateMicroOfferTool
- [ ] Implementar TrackBehaviorTool
- [ ] Implementar GetChannelContextTool
- [ ] Testar tools individualmente

---

### **Etapa 3: Integração com Memory e Persistência** 💾

**Objetivo**: Implementar busca de leads anteriores e persistência de dados.

**Implementação**:

```typescript
// apps/examples/src/agents/flowcloser/tools/search-lead-history-tool.ts
import { createTool } from "@iqai/adk";
import { z } from "zod";

export const searchLeadHistoryTool = createTool({
  name: "search_lead_history",
  description: "Searches memory for previous interactions with this user or similar leads",
  schema: z.object({
    query: z.string().describe("Search query (e.g., 'user interested in X product')"),
  }),
  fn: async ({ query }, context) => {
    try {
      const memoryResult = await context.searchMemory(query);
      
      return {
        success: true,
        memories: memoryResult.memories || [],
        count: memoryResult.memories?.length || 0,
        message: `Found ${memoryResult.memories?.length || 0} relevant memories`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Memory search failed",
      };
    }
  },
});
```

**Configuração do Agent com Memory**:

```typescript
// apps/examples/src/agents/flowcloser/agent.ts (atualizado)
import { AgentBuilder, InMemoryMemoryService } from "@iqai/adk";
import { createDatabaseSessionService } from "@iqai/adk";
import { qualifyLeadTool, createMicroOfferTool, getChannelContextTool, searchLeadHistoryTool } from "./tools";

export async function agent() {
  const sessionService = createDatabaseSessionService("sqlite:./data/flowcloser.db");
  const memoryService = new InMemoryMemoryService();

  return await AgentBuilder.create("flowcloser")
    .withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
    .withDescription(
      "FlowCloser - Autonomous closer designed to engage and convert leads across platforms (Instagram DM, PWA, WhatsApp)",
    )
    .withInstruction(`
      You are FlowCloser, an autonomous closer designed to engage and convert leads across platforms (Instagram DM, PWA, WhatsApp).
  
      Your default language is Brazilian Portuguese. Always detect user's language and respond accordingly.
      
      **Mission:** Close the gap between curiosity and conversion.
  
      **Behavior:**
      - Qualify intent with sharp, informal, human-like Portuguese (or detected language)
      - Use qualify_lead tool to track lead qualification in session state
      - Offer micro-offers if hesitation is detected using create_micro_offer tool
      - Use get_channel_context to adapt CTAs based on platform (swipe for IG, click for WhatsApp, checkout for PWA)
      - Search lead history with search_lead_history when user seems familiar
      - Escalate to human if user expresses confusion, frustration or urgent issue
  
      **Tone:** Assertive, charismatic, slightly playful — like a top-tier human closer who knows digital culture.
  
      **Limits:**
      - Never offer discounts unless explicitly instructed via create_micro_offer tool
      - Never lie or invent unavailable services
      - Always answer first in the user's language (Portuguese by default)
  
      **Catchphrase:** "Mais um clique e a gente flui."
    `)
    .withTools(
      qualifyLeadTool,
      createMicroOfferTool,
      getChannelContextTool,
      searchLeadHistoryTool,
    )
    .withSessionService(sessionService, {
      appName: "neoflow",
      userId: "user", // Will be set dynamically
      state: {
        channel: "pwa", // Default, will be updated from metadata
        lead: {
          intent: "unknown",
          painPoints: [],
          source: "pwa",
        },
        micro_offers: [],
      },
    })
    .withMemoryService(memoryService)
    .build();
}
```

**Checklist**:
- [ ] Configurar MemoryService
- [ ] Implementar SearchLeadHistoryTool
- [ ] Atualizar agent.ts com memory e session
- [ ] Testar persistência entre sessões

---

### **Etapa 4: Callbacks e Guardrails** 🛡️

**Objetivo**: Implementar callbacks para controle de comportamento e validação.

**Implementação**:

```typescript
// apps/examples/src/agents/flowcloser/callbacks/channel-detection-callback.ts
import type { CallbackContext } from "@iqai/adk";
import type { Content } from "@google/genai";

export function channelDetectionCallback(
  context: CallbackContext,
): Content | undefined {
  // Detect channel from metadata or state
  const channel = 
    (context as any).metadata?.source || 
    context.state.get("channel", "pwa");

  // Update state with detected channel
  if (!context.state.get("channel")) {
    context.state.set("channel", channel);
    context.state.set("lead.source", channel);
  }

  return undefined; // Continue normal flow
}
```

```typescript
// apps/examples/src/agents/flowcloser/callbacks/guardrails-callback.ts
import type { BeforeModelCallback } from "@iqai/adk";
import { LlmResponse } from "@iqai/adk";

export const guardrailsCallback: BeforeModelCallback = ({
  callbackContext,
  llmRequest,
}) => {
  // Get last user message
  const lastUser = [...(llmRequest.contents || [])]
    .reverse()
    .find((c) => c.role === "user");
  const lastText: string = lastUser?.parts?.[0]?.text || "";

  // Block if user is frustrated (multiple negative words)
  const frustrationKeywords = ["não funciona", "péssimo", "horrível", "odeio"];
  const frustrationCount = frustrationKeywords.filter((kw) =>
    lastText.toLowerCase().includes(kw),
  ).length;

  if (frustrationCount >= 2) {
    callbackContext.state.set("escalation_needed", true);
    callbackContext.state.set("escalation_reason", "user_frustration");

    return new LlmResponse({
      content: {
        role: "model",
        parts: [
          {
            text: "Entendo sua frustração. Vou conectar você com um especialista humano agora mesmo. Por favor, aguarde um momento.",
          },
        ],
      },
      finishReason: "STOP",
    });
  }

  return null; // Allow normal flow
};
```

**Atualização do Agent**:

```typescript
// Adicionar callbacks ao agent.ts
.withBeforeAgentCallback(channelDetectionCallback)
.withBeforeModelCallback(guardrailsCallback)
```

**Checklist**:
- [ ] Implementar channelDetectionCallback
- [ ] Implementar guardrailsCallback
- [ ] Testar escalação automática
- [ ] Validar detecção de canal

---

### **Etapa 5: Integração com APIs Externas** 🌐

**Objetivo**: Conectar com webhooks e APIs on-chain (NEOFLW token, ENS).

**Tools a implementar**:

```typescript
// apps/examples/src/agents/flowcloser/tools/webhook-tool.ts
import { HttpRequestTool } from "@iqai/adk";
import { createTool } from "@iqai/adk";
import { z } from "zod";

export const sendWebhookTool = createTool({
  name: "send_webhook",
  description: "Sends a webhook notification to external systems (CRM, analytics, etc.)",
  schema: z.object({
    event: z.string().describe("Event name (e.g., 'lead_qualified', 'offer_created', 'sale_closed')"),
    data: z.record(z.any()).describe("Event data payload"),
    url: z.string().optional().describe("Webhook URL (defaults to configured webhook endpoint)"),
  }),
  fn: async ({ event, data, url }, context) => {
    const webhookUrl = url || process.env.WEBHOOK_URL || "https://api.neoflow.com/webhooks";
    
    const httpTool = new HttpRequestTool();
    const result = await httpTool.runAsync(
      {
        url: webhookUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Event-Type": event,
        },
        body: JSON.stringify({
          event,
          data: {
            ...data,
            sessionId: context.session.id,
            userId: context.userId,
            timestamp: new Date().toISOString(),
          },
        }),
      },
      context,
    );

    return {
      success: result.statusCode === 200,
      event,
      response: result,
    };
  },
});
```

```typescript
// apps/examples/src/agents/flowcloser/tools/neoflow-token-tool.ts
import { createTool } from "@iqai/adk";
import { z } from "zod";
import { HttpRequestTool } from "@iqai/adk";

export const checkNeoflowTokenTool = createTool({
  name: "check_neoflow_token",
  description: "Checks NEOFLW token balance or transaction status for a wallet address",
  schema: z.object({
    address: z.string().describe("Wallet address to check"),
    action: z.enum(["balance", "transaction"]).describe("Action to perform"),
    txHash: z.string().optional().describe("Transaction hash (required for transaction check)"),
  }),
  fn: async ({ address, action, txHash }, context) => {
    const httpTool = new HttpRequestTool();
    
    // Example: Call blockchain API (adjust endpoint as needed)
    const apiUrl = process.env.NEOFLOW_API_URL || "https://api.neoflow.com/blockchain";
    
    if (action === "balance") {
      const result = await httpTool.runAsync(
        {
          url: `${apiUrl}/balance/${address}`,
          method: "GET",
        },
        context,
      );
      
      return {
        success: result.statusCode === 200,
        address,
        balance: JSON.parse(result.body),
      };
    } else {
      if (!txHash) {
        return {
          success: false,
          error: "Transaction hash required for transaction check",
        };
      }
      
      const result = await httpTool.runAsync(
        {
          url: `${apiUrl}/transaction/${txHash}`,
          method: "GET",
        },
        context,
      );
      
      return {
        success: result.statusCode === 200,
        txHash,
        transaction: JSON.parse(result.body),
      };
    }
  },
});
```

**Checklist**:
- [ ] Implementar SendWebhookTool
- [ ] Implementar CheckNeoflowTokenTool
- [ ] Configurar variáveis de ambiente para APIs
- [ ] Testar integrações

---

### **Etapa 6: Comportamento Avançado e Otimização** 🚀

**Objetivo**: Implementar estratégias avançadas de fechamento e otimização.

**Features avançadas**:

1. **Planner para estratégias multi-step**
2. **Sub-agents para casos específicos**
3. **Output schema para respostas estruturadas**
4. **Event compaction para otimização**

**Implementação**:

```typescript
// apps/examples/src/agents/flowcloser/agent.ts (versão final)
import { AgentBuilder, BuiltInPlanner, createDatabaseSessionService, InMemoryMemoryService } from "@iqai/adk";
import { z } from "zod";
// ... imports de tools e callbacks

export async function agent() {
  const sessionService = createDatabaseSessionService("sqlite:./data/flowcloser.db");
  const memoryService = new InMemoryMemoryService();

  // Output schema para respostas estruturadas
  const responseSchema = z.object({
    message: z.string().describe("Response message to user"),
    cta: z.string().optional().describe("Call-to-action text"),
    offerId: z.string().optional().describe("ID of micro-offer if created"),
    escalation: z.boolean().optional().describe("Whether escalation to human is needed"),
  });

  return await AgentBuilder.create("flowcloser")
    .withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
    .withDescription(
      "FlowCloser - Autonomous closer designed to engage and convert leads across platforms",
    )
    .withInstruction(`
      You are FlowCloser, an autonomous closer designed to engage and convert leads across platforms (Instagram DM, PWA, WhatsApp).
  
      Your default language is Brazilian Portuguese. Always detect user's language and respond accordingly.
      
      **Mission:** Close the gap between curiosity and conversion.
  
      **Behavior:**
      - Qualify intent with sharp, informal, human-like Portuguese (or detected language)
      - Use qualify_lead tool to track lead qualification in session state
      - Offer micro-offers if hesitation is detected using create_micro_offer tool
      - Use get_channel_context to adapt CTAs based on platform
      - Search lead history with search_lead_history when user seems familiar
      - Escalate to human if user expresses confusion, frustration or urgent issue
  
      **Tone:** Assertive, charismatic, slightly playful — like a top-tier human closer who knows digital culture.
  
      **Limits:**
      - Never offer discounts unless explicitly instructed via create_micro_offer tool
      - Never lie or invent unavailable services
      - Always answer first in the user's language (Portuguese by default)
  
      **Catchphrase:** "Mais um clique e a gente flui."
    `)
    .withTools(
      qualifyLeadTool,
      createMicroOfferTool,
      getChannelContextTool,
      searchLeadHistoryTool,
      sendWebhookTool,
      checkNeoflowTokenTool,
    )
    .withPlanner(new BuiltInPlanner()) // Enable planning for complex sales strategies
    .withOutputSchema(responseSchema) // Structured responses
    .withSessionService(sessionService, {
      appName: "neoflow",
      userId: "user",
      state: {
        channel: "pwa",
        lead: {
          intent: "unknown",
          painPoints: [],
          source: "pwa",
        },
        micro_offers: [],
      },
    })
    .withMemoryService(memoryService)
    .withBeforeAgentCallback(channelDetectionCallback)
    .withBeforeModelCallback(guardrailsCallback)
    .build();
}
```

**Checklist**:
- [ ] Adicionar BuiltInPlanner
- [ ] Implementar output schema
- [ ] Otimizar instruções com state injection
- [ ] Testar comportamento completo

---

## 🔌 Pontos de Integração Identificados

### 1. **ToolContext.metadata.source**
```typescript
// Como passar metadata de canal
const toolContext = new ToolContext(invocationContext, {
  metadata: { source: "instagram" }, // ou "whatsapp", "pwa"
});
```

### 2. **Session State para Lead Data**
```typescript
// Estrutura recomendada de state
{
  channel: "instagram" | "whatsapp" | "pwa",
  lead: {
    intent: "high" | "medium" | "low",
    budget: number,
    timeline: string,
    painPoints: string[],
    source: string,
  },
  micro_offers: MicroOffer[],
  behavior: {
    clicks: number,
    hesitations: number,
    lastInteraction: Date,
  },
}
```

### 3. **Memory Service para Lead History**
- Usar `addSessionToMemory()` após qualificação
- Usar `searchMemory()` para buscar leads similares
- Implementar RAG com Vertex AI para busca semântica avançada

### 4. **HttpRequestTool para APIs**
- Webhooks para CRM (HubSpot, Salesforce)
- APIs on-chain (Ethereum, Polygon)
- Analytics (Mixpanel, Amplitude)

---

## ⚠️ O Que Evitar

1. **Não usar InMemorySessionService em produção**
   - Use `createDatabaseSessionService()` para persistência real

2. **Não hardcodar configurações**
   - Use variáveis de ambiente e state management

3. **Não ignorar error handling em tools**
   - Sempre retorne objetos com `success` e `error`

4. **Não criar tools muito genéricos**
   - Tools devem ser específicos e com propósito claro

5. **Não esquecer de validar inputs**
   - Use schemas Zod rigorosos em todos os tools

6. **Não misturar lógica de negócio com instruções**
   - Lógica complexa deve estar em tools, não em prompts

---

## 📊 Estrutura Final Recomendada

```
apps/examples/src/agents/flowcloser/
├── agent.ts                          # Agente principal
├── config.ts                         # Configurações de canal
├── types.ts                          # TypeScript types
├── constants.ts                      # Constantes
├── callbacks/
│   ├── channel-detection-callback.ts
│   └── guardrails-callback.ts
├── tools/
│   ├── qualify-lead-tool.ts
│   ├── create-micro-offer-tool.ts
│   ├── get-channel-context-tool.ts
│   ├── search-lead-history-tool.ts
│   ├── webhook-tool.ts
│   └── neoflow-token-tool.ts
└── utils/
    └── lead-scoring.ts               # Lógica de scoring (opcional)
```

---

## 🎯 Próximos Passos Imediatos

1. **Implementar Etapa 1** (Setup Base)
2. **Testar estrutura básica** com `adk web`
3. **Implementar Etapa 2** (Tools Essenciais)
4. **Iterar e refinar** baseado em testes reais

---

## 📚 Referências Úteis

- **Exemplos**: `apps/examples/src/02-tools-and-state/`
- **Sessions**: `apps/examples/src/05-persistence-and-sessions/`
- **Callbacks**: `apps/examples/src/14-callbacks/`
- **Documentação**: `ARCHITECHTURE.md`

---

**Última atualização**: 2025-11-14
**Versão**: 1.0.0

