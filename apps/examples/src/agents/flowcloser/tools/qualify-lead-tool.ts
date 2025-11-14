import { createTool } from "@iqai/adk";
import { z } from "zod";
import type { LeadQualification } from "../types";

export const qualifyLeadTool = createTool({
	name: "qualify_lead",
	description:
		"Qualifies a lead based on their message and updates session state. Use this whenever you detect buying intent, budget mentions, timeline, or pain points.",
	schema: z.object({
		intent: z
			.enum(["high", "medium", "low", "unknown"])
			.describe("Lead intent level based on message analysis"),
		budget: z
			.number()
			.optional()
			.describe("Estimated budget if mentioned by the user"),
		timeline: z
			.string()
			.optional()
			.describe(
				"Timeline for purchase if mentioned (e.g., 'this week', 'next month')",
			),
		painPoints: z
			.array(z.string())
			.optional()
			.describe("Pain points or problems identified in the conversation"),
	}),
	fn: async ({ intent, budget, timeline, painPoints }, context) => {
		const currentLead: LeadQualification = context.state.get("lead", {
			intent: "unknown",
			painPoints: [],
			source: context.state.get("channel", "pwa"),
		});

		const updatedLead: LeadQualification = {
			...currentLead,
			intent,
			budget: budget || currentLead.budget,
			timeline: timeline || currentLead.timeline,
			painPoints: [...(currentLead.painPoints || []), ...(painPoints || [])],
			metadata: {
				...currentLead.metadata,
				lastQualifiedAt: new Date().toISOString(),
				qualificationCount: (currentLead.metadata?.qualificationCount || 0) + 1,
			},
		};

		context.state.set("lead", updatedLead);
		context.state.set("lead_intent", intent);

		return {
			success: true,
			lead: updatedLead,
			message: `Lead qualified as ${intent} intent`,
		};
	},
});
