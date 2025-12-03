#!/usr/bin/env tsx

/**
 * 🧪 Teste Completo do FlowCloser Agent
 * Testa fluxo completo de conversação
 */

import * as dotenv from "dotenv";
import { askWithFallback } from "./src/agents/flowcloser/agent.js";

dotenv.config({ override: true });

const env = dotenv.config({ override: true });
if (env.parsed?.OPENAI_API_KEY) {
	process.env.OPENAI_API_KEY = env.parsed.OPENAI_API_KEY;
}
if (env.parsed?.OPENAI_ORG_ID) {
	process.env.OPENAI_ORGANIZATION = env.parsed.OPENAI_ORG_ID;
}
if (env.parsed?.OPENAI_PROJECT_ID) {
	process.env.OPENAI_PROJECT = env.parsed.OPENAI_PROJECT_ID;
}

async function testFullFlow() {
	console.log("🧪 Teste Completo - Fluxo de Conversação FlowCloser\n");
	console.log("=".repeat(70));

	const userId = `test-user-${Date.now()}`;
	const channel = "instagram";

	// Simular uma conversa completa
	const conversation = [
		"Oi, vi que vocês fazem sites",
		"Preciso de um site para minha empresa de consultoria",
		"Ainda não tenho identidade visual",
		"Preciso urgente, em 2 semanas",
		"Vocês têm exemplos de trabalhos?",
	];

	console.log(`👤 Usuário: ${userId}`);
	console.log(`📱 Canal: ${channel}\n`);

	for (let i = 0; i < conversation.length; i++) {
		const message = conversation[i];
		console.log(`\n${"=".repeat(70)}`);
		console.log(`💬 Mensagem ${i + 1}/${conversation.length}: "${message}"`);
		console.log("🔄 Processando...\n");

		try {
			const startTime = Date.now();
			const response = await askWithFallback(message, {
				channel,
				userId,
				context: {
					source: "test",
					timestamp: new Date().toISOString(),
					// Simular histórico
					history: conversation.slice(0, i).map((msg, idx) => ({
						role: idx % 2 === 0 ? "user" : "assistant",
						content: msg,
					})),
				},
			});
			const duration = Date.now() - startTime;

			console.log(`🤖 FlowCloser (${duration}ms):`);
			console.log(`"${response}"`);
		} catch (error) {
			console.error(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
		}

		// Delay entre mensagens
		if (i < conversation.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	console.log(`\n${"=".repeat(70)}`);
	console.log("✅ Teste completo finalizado!");
}

testFullFlow().catch(console.error);

