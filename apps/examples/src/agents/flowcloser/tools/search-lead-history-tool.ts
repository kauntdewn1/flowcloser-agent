import { createTool } from "@iqai/adk";
import { z } from "zod";

export const searchLeadHistoryTool = createTool({
	name: "search_lead_history",
	description:
		"Searches memory for previous interactions with this user or similar leads. Use this when user seems familiar or you want to reference past conversations.",
	schema: z.object({
		query: z
			.string()
			.describe(
				"Search query (e.g., 'user interested in X product', 'previous purchase', 'user preferences')",
			),
	}),
	fn: async ({ query }, context) => {
		try {
			const memoryResult = await context.searchMemory(query);

			return {
				success: true,
				memories: memoryResult.memories || [],
				count: memoryResult.memories?.length || 0,
				message: `Found ${memoryResult.memories?.length || 0} relevant memories`,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				message: "Memory search failed",
			};
		}
	},
});
