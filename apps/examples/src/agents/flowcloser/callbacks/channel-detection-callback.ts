import type { CallbackContext } from "@iqai/adk";

export function channelDetectionCallback(context: CallbackContext): undefined {
	const channel =
		(context as any).metadata?.source || context.state.get("channel", "pwa");

	if (!context.state.get("channel")) {
		context.state.set("channel", channel);
		const lead = context.state.get("lead", {});
		if (lead) {
			lead.source = channel;
			context.state.set("lead", lead);
		}
	}

	return undefined;
}
