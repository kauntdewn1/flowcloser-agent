import * as dotenv from "dotenv";
import { askWithFallback } from "./src/agents/flowcloser/agent.js";

dotenv.config();

async function testConnection() {
	console.log("🔍 Testando conexão com IQ AI usando o agente FlowCloser...\n");
	console.log("═".repeat(60));

	const apiKey = process.env.IQAI_API_KEY;
	
	if (!apiKey) {
		console.error("❌ ERRO: IQAI_API_KEY não encontrada");
		process.exit(1);
	}

	console.log(`✅ Chave de API: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
	console.log(`✅ Modelo: ${process.env.LLM_MODEL || "gpt-4o-mini"}\n`);

	try {
		console.log("🔄 Enviando mensagem de teste...");
		const testMessage = "Olá, você está funcionando?";
		console.log(`📤 Pergunta: "${testMessage}"\n`);

		const response = await askWithFallback(testMessage);
		
		console.log(`📥 Resposta: "${response}"\n`);
		console.log("✅ Conexão funcionando corretamente!");
		console.log("\n" + "═".repeat(60));
		console.log("📊 RESUMO:");
		console.log("═".repeat(60));
		console.log(`   ✅ API IQ AI: Conectado`);
		console.log(`   ✅ ADK: Funcionando`);
		console.log(`   ✅ Agente: Respondendo`);
		console.log("═".repeat(60));
		
		process.exit(0);
	} catch (error) {
		console.error("\n❌ ERRO:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
			if (error.stack) {
				console.error(`\n   Stack:\n${error.stack.split('\n').slice(0, 5).join('\n')}`);
			}
		} else {
			console.error(`   ${String(error)}`);
		}
		process.exit(1);
	}
}

testConnection();

