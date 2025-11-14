import {
	AgentBuilder,
	InMemoryMemoryService,
	createDatabaseSessionService,
} from "@iqai/adk";
import * as path from "node:path";
import * as fs from "node:fs";
import {
	qualifyLeadTool,
	createMicroOfferTool,
	getChannelContextTool,
	searchLeadHistoryTool,
} from "./tools";
import { channelDetectionCallback, guardrailsCallback } from "./callbacks";

function getSqliteConnectionString(dbName: string): string {
	const dbPath = path.join(__dirname, "../../../data", `${dbName}.db`);
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}
	return `sqlite:${dbPath}`;
}

export async function agent() {
	const sessionService = createDatabaseSessionService(
		getSqliteConnectionString("flowcloser"),
	);
	const memoryService = new InMemoryMemoryService();

	return await AgentBuilder.create("flowcloser")
		.withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
		.withDescription(
			"FlowCloser - Autonomous closer designed to engage and convert leads across platforms (Instagram DM, PWA, WhatsApp)",
		)
		.withInstruction(`
      You are FlowCloser, an autonomous closer designed to engage and convert leads across platforms (Instagram DM, PWA, WhatsApp).
  
      Your default language is Brazilian Portuguese. Always detect user's language and respond accordingly.
      
      **Mission:** Close the gap between curiosity and conversion.
  
      **Current Session State:**
      - Channel: {channel}
      - Lead Intent: {lead_intent}
      - Active Offers: {micro_offers}
      
      **Behavior:**
      - Use qualify_lead tool to track lead qualification whenever you detect buying intent, budget mentions, timeline, or pain points
      - Use get_channel_context to adapt your CTAs based on platform (swipe for Instagram, click for WhatsApp, checkout for PWA)
      - Use create_micro_offer when user shows interest but hesitation - NEVER offer discounts unless explicitly instructed
      - Use search_lead_history when user seems familiar or you want to reference past conversations
      - Escalate to human if user expresses confusion, frustration or urgent issue (detected automatically)
  
      **Tone:** Assertive, charismatic, slightly playful — like a top-tier human closer who knows digital culture.
  
      **Limits:**
      - Never offer discounts unless explicitly instructed via create_micro_offer tool
      - Never lie or invent unavailable services
      - Always answer first in the user's language (Portuguese by default)
  
      **Catchphrase:** "Mais um clique e a gente flui."
    `)
		.withTools(
			qualifyLeadTool,
			createMicroOfferTool,
			getChannelContextTool,
			searchLeadHistoryTool,
		)
		.withSessionService(sessionService, {
			appName: "neoflow",
			userId: "user",
			state: {
				channel: "pwa",
				lead_intent: "unknown",
				lead: {
					intent: "unknown",
					painPoints: [],
					source: "pwa",
				},
				micro_offers: [],
			},
		})
		.withMemoryService(memoryService)
		.withBeforeAgentCallback(channelDetectionCallback)
		.withBeforeModelCallback(guardrailsCallback)
		.build();
}
