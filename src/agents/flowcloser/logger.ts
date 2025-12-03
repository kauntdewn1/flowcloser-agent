/**
 * Logger para interações do agente FlowCloser
 * Integra com a API IQAI para logs estruturados
 */

// Tentar diferentes endpoints possíveis da IQAI API
const IQAI_API_BASE_URL = process.env.IQAI_API_BASE_URL || "https://api.iqai.com";
const AGENT_TOKEN_CONTRACT = process.env.AGENT_TOKEN_CONTRACT || "0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4";

// Endpoints possíveis para logs (tentar em ordem)
const LOG_ENDPOINTS = [
	`${IQAI_API_BASE_URL}/api/logs`,
	`${IQAI_API_BASE_URL}/api/log`,
	`${IQAI_API_BASE_URL}/v1/logs`,
	`${IQAI_API_BASE_URL}/v1/log`,
];

export interface LogContext {
	stage?: string;
	channel?: string;
	userId?: string;
	model?: string;
	error?: boolean;
	fallbackUsed?: boolean;
}

/**
 * Loga interação do agente na API IQAI
 */
export async function logAgentInteraction(
	message: string,
	context: LogContext = {},
): Promise<void> {
	const apiKey = process.env.IQAI_API_KEY;
	
	if (!apiKey) {
		console.warn("⚠️ IQAI_API_KEY não configurada, pulando log");
		return;
	}

	const {
		stage = "Agent",
		channel = "unknown",
		userId = "unknown",
		model,
		error = false,
		fallbackUsed = false,
	} = context;

	try {
		const logContent = `[${stage}] ${message}${model ? ` (Model: ${model})` : ""}${fallbackUsed ? " [FALLBACK]" : ""}`;

		const logPayload = {
			agentTokenContract: AGENT_TOKEN_CONTRACT,
			content: logContent,
			type: error ? "Error" : "Agent",
			metadata: {
				channel,
				userId,
				model,
				fallbackUsed,
				timestamp: new Date().toISOString(),
			},
		};

		// Tentar diferentes endpoints até encontrar um que funcione
		let lastError: Error | null = null;
		for (const endpoint of LOG_ENDPOINTS) {
			try {
				const response = await fetch(endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${apiKey}`,
					},
					body: JSON.stringify(logPayload),
				});

				if (response.ok) {
					console.log(`📝 Log enviado para IQAI: [${stage}] via ${endpoint}`);
					return; // Sucesso, sair
				} else if (response.status !== 404) {
					// Se não for 404, pode ser outro erro válido (401, 403, etc)
					const errorText = await response.text();
					console.warn(`⚠️ Falha ao logar na IQAI (${endpoint}): ${response.status} - ${errorText}`);
					lastError = new Error(`${response.status}: ${errorText}`);
					break; // Não tentar outros endpoints se for erro de autenticação
				}
			} catch (err) {
				lastError = err instanceof Error ? err : new Error(String(err));
				continue; // Tentar próximo endpoint
			}
		}

		// Se chegou aqui, nenhum endpoint funcionou
		if (lastError) {
			console.warn(`⚠️ Nenhum endpoint de log funcionou. Último erro: ${lastError.message}`);
		}
	} catch (error) {
		// Não quebrar o fluxo se o log falhar
		console.warn(`⚠️ Erro ao logar na IQAI:`, error instanceof Error ? error.message : String(error));
	}
}

/**
 * Loga quando modelo primário falha e fallback é usado
 */
export async function logModelFallback(
	primaryModel: string,
	fallbackModel: string,
	error: Error,
): Promise<void> {
	await logAgentInteraction(
		`Model fallback: ${primaryModel} → ${fallbackModel}. Error: ${error.message}`,
		{
			stage: "ModelFallback",
			model: fallbackModel,
			error: true,
			fallbackUsed: true,
		},
	);
}

/**
 * Loga resposta final do agente
 */
export async function logAgentResponse(
	response: string,
	context: LogContext = {},
): Promise<void> {
	const hasPortfolio = response.includes("canva.com") || response.includes(process.env.PORTFOLIO_URL || "");
	const stage = hasPortfolio ? "ResponseWithPortfolio" : "Response";
	
	await logAgentInteraction(
		`Response: ${response.substring(0, 200)}...${hasPortfolio ? " [PORTFOLIO_SENT]" : ""}`,
		{
			...context,
			stage,
		},
	);
}

/**
 * Loga estágio do lead no funil
 */
export async function logLeadStage(
	stage: "opening" | "diagnosis" | "proposal" | "conversion" | "closed",
	context: LogContext = {},
): Promise<void> {
	await logAgentInteraction(`Lead stage: ${stage}`, {
		...context,
		stage: `LeadStage_${stage}`,
	});
}

