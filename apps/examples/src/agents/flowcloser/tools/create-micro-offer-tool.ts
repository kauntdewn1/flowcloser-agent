import { createTool } from "@iqai/adk";
import { z } from "zod";
import type { MicroOffer } from "../types";

export const createMicroOfferTool = createTool({
	name: "create_micro_offer",
	description:
		"Creates a personalized micro-offer to overcome hesitation. Use this when user shows interest but hesitation. Never create offers with discounts unless explicitly instructed.",
	schema: z.object({
		title: z.string().describe("Offer title (e.g., 'Oferta Especial de Hoje')"),
		description: z
			.string()
			.describe("Detailed offer description highlighting value proposition"),
		discount: z
			.number()
			.optional()
			.describe(
				"Discount percentage (0-100). Only use if explicitly instructed.",
			),
		validUntil: z
			.string()
			.optional()
			.describe(
				"Offer expiration date in ISO format (e.g., '2025-11-20T23:59:59Z')",
			),
		conditions: z
			.array(z.string())
			.optional()
			.describe("Offer conditions (e.g., 'Valid for first 10 customers')"),
	}),
	fn: async (
		{ title, description, discount, validUntil, conditions },
		context,
	) => {
		const offer: MicroOffer = {
			id: `offer_${Date.now()}`,
			title,
			description,
			discount,
			validUntil: validUntil ? new Date(validUntil) : undefined,
			conditions: conditions || [],
		};

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
