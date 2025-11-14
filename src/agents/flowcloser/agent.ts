import {
	AgentBuilder,
	createDatabaseSessionService,
} from "@iqai/adk";
import * as path from "node:path";
import * as fs from "node:fs";
import {
	qualifyLeadTool,
	createMicroOfferTool,
	getChannelContextTool,
	searchLeadHistoryTool,
	checkNeoflowTokenTool,
} from "./tools.js";
import { channelDetectionCallback, guardrailsCallback } from "./callbacks.js";

function getSqliteConnectionString(dbName: string): string {
	const dbPath = path.join(process.cwd(), "data", `${dbName}.db`);
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}
	return `sqlite:${dbPath}`;
}

async function createAgentWithModel(model: string) {
	const sessionService = createDatabaseSessionService(
		getSqliteConnectionString("flowcloser"),
	);

	return await AgentBuilder.create("flowcloser")
		.withModel(model)
		.withDescription(
			"Closer digital especializado em vendas de presença digital",
		)
		.withInstruction(`
IDENTIDADE:

Você é o FlowCloser, um closer digital de alta conversão. Você é estratégico, emocional e direto.

MISSÃO:

Converter leads que buscam presença digital (sites, PWAs, micro SaaS, webapps).

ESTILO:

- Frases curtas. Diretas.
- Tom emocional mas profissional
- Zero formalismo corporativo

FLUXO:

1. ABERTURA:
   - DM direto: "E aí! O que te trouxe aqui?"

2. DIAGNÓSTICO (3 perguntas):
   a) "O que você precisa resolver com esse projeto digital?"
   b) "Já tem identidade visual ou vai do zero?"
   c) "Em quanto tempo precisa disso rodando?"

3. PROPOSTA:
   "O que vou te mostrar não é um site comum. É um sistema vivo. Me dá 60 segundos no flowoff.xyz e você entende a diferença."

4. CONVERSÃO:
   - Lead quente: "Vamos fechar no WhatsApp. Te mostro proposta personalizada e entrego prévia hoje."
   - Link: flowoff.xyz

LIMITES:

- NÃO discute tech details
- NÃO faz orçamento automatizado
- SEMPRE direciona fechamento para WhatsApp

ASSINATURA:

"Isso aqui não é um site. É sua presença inegociável no digital."

CANAL:

Quando detectar que é Instagram DM, adapte o tom para ser mais visual e usar expressões do Instagram. Use "Deslize para ver mais" como CTA quando apropriado.
    `)
		.withTools(
			qualifyLeadTool,
			createMicroOfferTool,
			getChannelContextTool,
			searchLeadHistoryTool,
			checkNeoflowTokenTool,
		)
		.withSessionService(sessionService, {
			appName: "neoflow",
			userId: "user",
			state: {
				channel: "instagram",
				lead_intent: "unknown",
				lead: {
					intent: "unknown",
					painPoints: [],
					source: "instagram",
				},
				micro_offers: [],
			},
		})
		.withBeforeModelCallback(guardrailsCallback)
		.build();
}

export async function agent() {
	const model = process.env.LLM_MODEL || "gpt-4o-mini";
	return await createAgentWithModel(model);
}

export async function askWithFallback(userMessage: string): Promise<string> {
	const model = process.env.LLM_MODEL || "gpt-4o-mini";
	const fallbackModel = process.env.LLM_MODEL_FALLBACK || "gemini-2.5-flash";

	let agentResponse: string;

	try {
		console.log(`🤖 Using primary model: ${model}`);
		const { runner } = await createAgentWithModel(model);
		agentResponse = await runner.ask(userMessage);
	} catch (error) {
		console.warn(`⚠️ Primary model (${model}) failed. Falling back to: ${fallbackModel}`);
		console.error("Error:", error instanceof Error ? error.message : String(error));
		
		try {
			const { runner } = await createAgentWithModel(fallbackModel);
			agentResponse = await runner.ask(userMessage);
			console.log(`✅ Fallback model (${fallbackModel}) succeeded`);
		} catch (fallbackError) {
			console.error("❌ Fallback model also failed:", fallbackError);
			throw new Error(
				`Both models failed. Primary: ${error instanceof Error ? error.message : String(error)}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
			);
		}
	}

	return typeof agentResponse === "string" ? agentResponse : JSON.stringify(agentResponse);
}
