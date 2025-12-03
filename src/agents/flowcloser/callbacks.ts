import { CallbackContext, LlmRequest, LlmResponse } from "@iqai/adk";
import { logAgentInteraction } from "./logger.js";

export async function channelDetectionCallback(
	context: CallbackContext,
): Promise<void> {
	// Detecção dinâmica do canal - pode vir do payload ou estado
	const ctx = context as any;
	const channel = ctx.state?.channel || 
	                ctx.input?.channel || 
	                "instagram"; // default
	
	if (context.state) {
		(context.state as any).channel = channel;
	}
}

export async function guardrailsCallback(args: {
	callbackContext: CallbackContext;
	llmRequest: LlmRequest;
}): Promise<LlmResponse | null | undefined> {
	const content = (args.llmRequest as any).messages?.[(args.llmRequest as any).messages.length - 1]?.content || "";
	const message = Array.isArray(content) ? content.join(" ") : String(content);
	
	if (message.toLowerCase().includes("desconto") && 
	    !message.toLowerCase().includes("não") && 
	    !message.toLowerCase().includes("sem")) {
		console.warn("⚠️ Guardrail: Discount request detected");
		
		// Log do guardrail
		await logAgentInteraction(
			`Guardrail triggered: Discount request detected`,
			{
				stage: "Guardrail",
				channel: (args.callbackContext.state as any)?.channel || "unknown",
			},
		);
	}
	
	return undefined;
}

/**
 * Callback pós-resposta para logging e automações
 */
export async function afterModelCallback(args: {
	callbackContext: CallbackContext;
	llmRequest: LlmRequest;
	llmResponse: LlmResponse;
}): Promise<void> {
	const response = args.llmResponse;
	const channel = (args.callbackContext.state as any)?.channel || "unknown";
	const userId = (args.callbackContext.state as any)?.userId || "unknown";
	
	// Extrair texto da resposta
	let responseText = "";
	const resp = response as any;
	if (typeof response === "string") {
		responseText = response;
	} else if (resp?.choices?.[0]?.message?.content) {
		responseText = resp.choices[0].message.content;
	} else if (resp?.text) {
		responseText = resp.text;
	} else if (resp?.content) {
		responseText = resp.content;
	}
	
	// Log da resposta
	await logAgentInteraction(
		`Agent response generated`,
		{
			stage: "AfterModel",
			channel,
			userId,
			model: (args.llmRequest as any)?.model,
		},
	);
	
	// Aqui você pode adicionar outras automações:
	// - Enviar para webhook externo
	// - Atualizar CRM
	// - Disparar notificações
	// - Análise de sentimento
}
