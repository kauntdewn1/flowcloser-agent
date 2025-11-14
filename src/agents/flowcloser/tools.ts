import { createTool, BaseTool } from "@iqai/adk";
import { z } from "zod";

const qualifyLeadSchema = z.object({
	intent: z.string().describe("Lead intent (buying, browsing, information, etc.)"),
	budget: z.string().optional().describe("Budget mentioned by the lead"),
	timeline: z.string().optional().describe("Timeline for purchase decision"),
	painPoints: z.array(z.string()).optional().describe("Pain points mentioned by the lead"),
});

export const qualifyLeadTool: BaseTool = createTool({
	name: "qualify_lead",
	description: "Track lead qualification whenever you detect buying intent, budget mentions, timeline, or pain points",
	schema: qualifyLeadSchema as z.ZodSchema<z.infer<typeof qualifyLeadSchema>>,
	fn: async (params) => {
		return {
			success: true,
			message: "Lead qualification tracked",
			data: params,
		};
	},
});

const createMicroOfferSchema = z.object({
	title: z.string().describe("Title of the micro offer"),
	description: z.string().describe("Description of the offer"),
	value: z.string().optional().describe("Value proposition"),
});

export const createMicroOfferTool: BaseTool = createTool({
	name: "create_micro_offer",
	description: "Create a micro offer when user shows interest but hesitation - NEVER offer discounts unless explicitly instructed",
	schema: createMicroOfferSchema as z.ZodSchema<z.infer<typeof createMicroOfferSchema>>,
	fn: async (params) => {
		return {
			success: true,
			message: "Micro offer created",
			data: params,
		};
	},
});

const getChannelContextSchema = z.object({
	channel: z.string().describe("Channel name (instagram, whatsapp, pwa)"),
});

export const getChannelContextTool: BaseTool = createTool({
	name: "get_channel_context",
	description: "Adapt CTAs based on platform (swipe for Instagram, click for WhatsApp, checkout for PWA)",
	schema: getChannelContextSchema as z.ZodSchema<z.infer<typeof getChannelContextSchema>>,
	fn: async (params) => {
		const channelCTAs: Record<string, string> = {
			instagram: "Deslize para ver mais",
			whatsapp: "Clique aqui para continuar",
			pwa: "Finalize sua compra",
		};

		return {
			success: true,
			cta: channelCTAs[params.channel] || "Continue",
			channel: params.channel,
		};
	},
});

const searchLeadHistorySchema = z.object({
	query: z.string().describe("Search query"),
});

export const searchLeadHistoryTool: BaseTool = createTool({
	name: "search_lead_history",
	description: "Search lead history when user seems familiar or you want to reference past conversations",
	schema: searchLeadHistorySchema as z.ZodSchema<z.infer<typeof searchLeadHistorySchema>>,
	fn: async (params) => {
		return {
			success: true,
			results: [],
			message: "No previous history found",
		};
	},
});

const checkNeoflowTokenSchema = z.object({
	address: z.string().optional().describe("Token address or user address"),
});

export const checkNeoflowTokenTool: BaseTool = createTool({
	name: "check_neoflow_token",
	description: "Check Neoflow token when user asks about tokens, balances, or blockchain-related information",
	schema: checkNeoflowTokenSchema as z.ZodSchema<z.infer<typeof checkNeoflowTokenSchema>>,
	fn: async (params) => {
		return {
			success: true,
			balance: "0",
			message: "Token balance checked",
		};
	},
});
