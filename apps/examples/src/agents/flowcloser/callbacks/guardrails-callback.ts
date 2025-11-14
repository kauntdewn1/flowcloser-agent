import type { BeforeModelCallback } from "@iqai/adk";
import { LlmResponse } from "@iqai/adk";

export const guardrailsCallback: BeforeModelCallback = ({
	callbackContext,
	llmRequest,
}) => {
	const lastUser = [...(llmRequest.contents || [])]
		.reverse()
		.find((c) => c.role === "user");
	const lastText: string = lastUser?.parts?.[0]?.text || "";

	const frustrationKeywords = [
		"não funciona",
		"péssimo",
		"horrível",
		"odeio",
		"terrível",
		"ruim",
	];
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

	return null;
};
