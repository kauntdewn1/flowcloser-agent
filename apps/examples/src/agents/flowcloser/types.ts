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

export interface ChannelConfig {
	name: "instagram" | "whatsapp" | "pwa";
	ctaStyle: "swipe" | "click" | "checkout";
	tone: "casual" | "professional" | "playful";
}
