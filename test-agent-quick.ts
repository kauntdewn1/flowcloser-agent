#!/usr/bin/env tsx

/**
 * 🧪 Teste Rápido do FlowCloser Agent
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

async function testAgent() {
	console.log("🧪 Testando FlowCloser Agent...\n");
	console.log("=" .repeat(60));

	const tests = [
		{
			name: "Teste 1: Primeira mensagem",
			message: "Oi, vi que vocês fazem sites",
			channel: "instagram",
		},
		{
			name: "Teste 2: Pergunta sobre projeto",
			message: "Preciso de um site para minha empresa",
			channel: "instagram",
		},
		{
			name: "Teste 3: Pergunta sobre portfólio",
			message: "Vocês têm exemplos de trabalhos?",
			channel: "instagram",
		},
	];

	for (const test of tests) {
		console.log(`\n${test.name}`);
		console.log(`📨 Mensagem: "${test.message}"`);
		console.log(`📝 Canal: ${test.channel}`);
		console.log("🔄 Processando...\n");

		try {
			const startTime = Date.now();
			const response = await askWithFallback(test.message, {
				channel: test.channel,
				userId: "test-user-123",
				context: {
					source: "test",
					timestamp: new Date().toISOString(),
				},
			});
			const duration = Date.now() - startTime;

			console.log(`✅ Resposta (${duration}ms):`);
			console.log(`"${response}"`);
			console.log("-".repeat(60));
		} catch (error) {
			console.error(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
			console.log("-".repeat(60));
		}

		// Pequeno delay entre testes
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	console.log("\n✅ Testes concluídos!");
}

testAgent().catch(console.error);

