/**
 * Modo Ghostwriter - Gera pitches prontos para humanos enviarem
 */

export interface GhostwriterOptions {
	channel: "instagram" | "whatsapp" | "api";
	leadType?: "tecnico" | "estetico" | "gestor";
	urgency?: boolean;
	includePortfolio?: boolean;
}

export function generateGhostwriterPitch(
	leadContext: {
		name?: string;
		projectType?: string;
		painPoints?: string[];
	},
	options: GhostwriterOptions = { channel: "api" },
): string {
	const { channel, leadType, urgency = false, includePortfolio = true } = options;
	const portfolioUrl = process.env.PORTFOLIO_URL || "";

	// Personalização por canal
	const channelStyles = {
		instagram: {
			greeting: "E aí! 👋",
			cta: "Deslize para ver mais ➡️",
			tone: "visual, descontraído, com emojis estratégicos",
		},
		whatsapp: {
			greeting: "Oi",
			cta: "Quer que eu monte pra você agora?",
			tone: "direto, pessoal, sem firulas",
		},
		api: {
			greeting: "Olá",
			cta: "Vamos conversar?",
			tone: "profissional mas próximo",
		},
	};

	const style = channelStyles[channel];

	// Micro-segmentação por tipo de lead
	const leadTypeMessages = {
		tecnico: {
			focus: "performance, escalabilidade, arquitetura técnica",
			value: "sistema robusto que escala",
			language: "técnica mas acessível",
		},
		estetico: {
			focus: "design, experiência visual, identidade de marca",
			value: "presença visual que converte",
			language: "visual e emocional",
		},
		gestor: {
			focus: "ROI, resultados mensuráveis, gestão de equipe",
			value: "solução que entrega resultados",
			language: "estratégica e orientada a resultados",
		},
	};

	const leadProfile = leadType ? leadTypeMessages[leadType] : leadTypeMessages.estetico;

	// Construir pitch
	let pitch = `${style.greeting}${leadContext.name ? ` ${leadContext.name}` : ""}!\n\n`;

	// Abertura contextualizada
	if (leadContext.painPoints && leadContext.painPoints.length > 0) {
		pitch += `Vi que você precisa de ${leadContext.painPoints[0]}. `;
	}

	pitch += `O que vou te mostrar não é um site comum. É um sistema vivo. `;

	// Incluir portfólio visual
	if (includePortfolio && portfolioUrl) {
		pitch += `\n\nDá uma olhada nesse flow visual que montei — ele mostra como seu ${leadContext.projectType || "projeto"} pode ficar, com valor e profissionalismo:\n${portfolioUrl}\n\n`;
	}

	// Valor específico por tipo de lead
	pitch += `Foco em ${leadProfile.focus}. `;
	pitch += `O resultado é ${leadProfile.value}.\n\n`;

	// Urgência se necessário
	if (urgency) {
		pitch += `Essas zonas visuais e estrutura de entrega não são repetidas para qualquer um. Só produção de elite.\n\n`;
	}

	// CTA adaptado ao canal
	pitch += `${style.cta}\n\n`;
	pitch += `Quer que monte a cópia + entrega no fluxo completo? Me dá OK e te mando a proposta personalizada no WhatsApp.\n\n`;
	pitch += `Isso aqui não é um site. É sua presença inegociável no digital.`;

	return pitch;
}

