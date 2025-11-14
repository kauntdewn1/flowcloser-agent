import { createTool } from "@iqai/adk";
import { z } from "zod";
import { CHANNEL_CONFIGS } from "../config";

export const getChannelContextTool = createTool({
	name: "get_channel_context",
	description:
		"Gets the current channel configuration (Instagram, WhatsApp, or PWA) to adapt CTAs and tone accordingly",
	schema: z.object({}),
	fn: async (_, context) => {
		const channel =
			(context as any).metadata?.source || context.state.get("channel", "pwa");

		const config = CHANNEL_CONFIGS[channel] || CHANNEL_CONFIGS.pwa;

		return {
			channel,
			config,
			ctaStyle: config.ctaStyle,
			tone: config.tone,
			message: `Current channel: ${channel}`,
		};
	},
});
