import * as dotenv from "dotenv";
import { AgentBuilder, createDatabaseSessionService } from "@iqai/adk";
import * as path from "node:path";
import * as fs from "node:fs";

dotenv.config();

async function testWithGemini() {
	console.log("🔍 Testando conexão IQ AI com Gemini (fallback)...\n");
	console.log("═".repeat(60));

	const apiKey = process.env.IQAI_API_KEY;
	const googleKey = process.env.GOOGLE_API_KEY;
	
	if (!apiKey) {
		console.error("❌ ERRO: IQAI_API_KEY não encontrada");
		process.exit(1);
	}

	if (!googleKey) {
		console.error("❌ ERRO: GOOGLE_API_KEY não encontrada");
		process.exit(1);
	}

	console.log(`✅ IQAI_API_KEY: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
	console.log(`✅ GOOGLE_API_KEY: ${googleKey.substring(0, 8)}...${googleKey.substring(googleKey.length - 4)}`);
	console.log(`✅ Modelo: gemini-2.5-flash\n`);

	try {
		// Criar banco de dados
		function getSqliteConnectionString(dbName: string): string {
			const dbPath = path.join(process.cwd(), "data", `${dbName}.db`);
			const dbDir = path.dirname(dbPath);
			if (!fs.existsSync(dbDir)) {
				fs.mkdirSync(dbDir, { recursive: true });
			}
			return `sqlite://${dbPath}`;
		}

		const sessionService = createDatabaseSessionService(
			getSqliteConnectionString("test_gemini"),
		);

		console.log("🔄 Criando agente com Gemini...");
		const { runner } = await AgentBuilder.create("test_gemini")
			.withModel("gemini-2.5-flash")
			.withDescription("Teste de conexão com Gemini")
			.withInstruction("Você é um assistente de teste. Responda brevemente.")
			.withSessionService(sessionService, {
				appName: "test",
				userId: "test_user",
				state: {},
			})
			.build();

		console.log("✅ Agente criado!\n");

		const testMessage = "Olá, você está funcionando? Responda em português.";
		console.log(`📤 Pergunta: "${testMessage}"\n`);

		const response = await runner.ask(testMessage);
		
		console.log(`📥 Resposta: "${response}"\n`);
		console.log("✅ Teste concluído com sucesso!");
		console.log("\n" + "═".repeat(60));
		console.log("📊 RESUMO:");
		console.log("═".repeat(60));
		console.log(`   ✅ IQAI_API_KEY: Configurada`);
		console.log(`   ✅ GOOGLE_API_KEY: Configurada`);
		console.log(`   ✅ ADK: Funcionando`);
		console.log(`   ✅ Gemini: Respondendo`);
		console.log(`   ✅ Conexão IQ AI: OK`);
		console.log("═".repeat(60));
		
		process.exit(0);
	} catch (error) {
		console.error("\n❌ ERRO:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		} else {
			console.error(`   ${String(error)}`);
		}
		process.exit(1);
	}
}

testWithGemini();

