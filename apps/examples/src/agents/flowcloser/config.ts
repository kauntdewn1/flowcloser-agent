import type { ChannelConfig } from "./types";

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
