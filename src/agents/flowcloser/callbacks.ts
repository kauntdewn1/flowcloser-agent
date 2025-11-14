import { CallbackContext, LlmRequest, LlmResponse } from "@iqai/adk";

export async function channelDetectionCallback(
	context: CallbackContext,
): Promise<void> {
	const channel = (context.state as any)?.channel || "pwa";
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
	}
	
	return undefined;
}
