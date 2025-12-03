import * as dotenv from "dotenv";
import { AgentBuilder, createDatabaseSessionService } from "@iqai/adk";
import * as path from "node:path";
import * as fs from "node:fs";

dotenv.config();

const IQAI_API_BASE_URL = "https://api.iqai.com";

async function testRESTAPI(apiKey: string) {
	console.log("📡 Testando API REST do IQ AI...\n");
	
	try {
		// Testar endpoint GET /api/agents/info com o endereço do agente FlowCloser
		// Agent Contract: 0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4
		// Token Contract: 0x2Dd669407Ab779724f2b38b54A4322aA40C55e67
		const agentAddress = "0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4";
		
		// Tentar diferentes endpoints possíveis
		const endpoints = [
			`${IQAI_API_BASE_URL}/api/agents/info?address=${agentAddress}`,
			`${IQAI_API_BASE_URL}/api/agent/info?address=${agentAddress}`,
			`${IQAI_API_BASE_URL}/api/agents?address=${agentAddress}`,
		];
		
		let success = false;
		for (const url of endpoints) {
			try {
				console.log(`🔄 Tentando: ${url}`);
				
				const response = await fetch(url, {
					method: "GET",
					headers: {
						"Authorization": `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
				});

				const status = response.status;
				const data = await response.json();

				if (status === 200) {
					console.log("✅ API REST respondendo corretamente!");
					console.log(`📊 Dados do agente:`);
					console.log(`   - Status: ${status} OK`);
					console.log(`   - Resposta: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
					success = true;
					break;
				} else if (status === 401 || status === 403) {
					console.log(`⚠️ Autenticação falhou (${status}), mas a API está respondendo`);
					console.log(`   Isso indica que a chave pode estar incorreta ou sem permissões`);
					break;
				} else {
					console.log(`   Status ${status}: ${JSON.stringify(data).substring(0, 100)}`);
				}
			} catch (err) {
				console.log(`   Erro: ${err instanceof Error ? err.message : String(err)}`);
			}
		}
		
		if (!success) {
			console.log("\n💡 Nota: A API REST pode ter endpoints diferentes ou requerer configuração adicional.");
			console.log("   O teste do ADK abaixo é mais confiável para verificar a conexão.");
		}
		
		return success;
	} catch (error) {
		console.error("❌ Erro ao testar API REST:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		}
		return false;
	}
}

async function testIQAIConnection() {
	console.log("🔍 Testando conexão com IQ AI API...\n");
	console.log("═".repeat(60));

	// 1. Verificar se a chave de API está configurada
	const apiKey = process.env.IQAI_API_KEY;
	
	if (!apiKey) {
		console.error("❌ ERRO: IQAI_API_KEY não encontrada no arquivo .env");
		console.log("💡 Configure a variável IQAI_API_KEY no arquivo .env");
		process.exit(1);
	}

	if (apiKey === "MY-IQAI_API_KEY" || apiKey === "sua_chave_iqai_aqui") {
		console.error("❌ ERRO: IQAI_API_KEY contém valor placeholder");
		console.log("💡 Substitua 'MY-IQAI_API_KEY' pela sua chave real da API IQ AI");
		process.exit(1);
	}

	console.log(`✅ Chave de API encontrada: ${apiKey}`);
	console.log(`   Formato: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
	
	// Garantir que a chave está disponível como variável de ambiente para o ADK
	process.env.IQAI_API_KEY = apiKey;

	// 2. Verificar se o modelo LLM está configurado
	const model = process.env.LLM_MODEL || "gpt-4o-mini";
	console.log(`✅ Modelo LLM: ${model}`);

	// 3. Tentar criar um agente de teste usando ADK
	console.log("\n" + "─".repeat(60));
	console.log("🔄 Testando ADK (Agent Development Kit)...\n");
	
	try {
		// Usar exatamente o mesmo método que o agente real usa
		function getSqliteConnectionString(dbName: string): string {
			const dbPath = path.join(process.cwd(), "data", `${dbName}.db`);
			const dbDir = path.dirname(dbPath);
			if (!fs.existsSync(dbDir)) {
				fs.mkdirSync(dbDir, { recursive: true });
			}
			return `sqlite:${dbPath}`;
		}
		
		const connectionString = getSqliteConnectionString("test-connection");
		const dbPath = path.join(process.cwd(), "data", "test-connection.db");
		console.log(`💾 Banco de dados: ${connectionString}`);
		
		console.log("🔄 Criando serviço de sessão...");
		const sessionService = createDatabaseSessionService(connectionString);
		console.log("✅ Serviço de sessão criado");

		// Criar agente simples para teste
		console.log("🔄 Criando agente...");
		const { runner } = await AgentBuilder.create("flowcloser-test")
			.withModel(model)
			.withDescription("Agente de teste de conexão")
			.withInstruction("Você é um assistente de teste. Responda brevemente.")
			.withSessionService(sessionService, {
				appName: "test",
				userId: "test-user",
				state: {},
			})
			.build();

		console.log("✅ Agente ADK criado com sucesso!\n");

		// 5. Testar uma pergunta simples
		console.log("🔄 Testando pergunta simples via ADK...");
		const testMessage = "Olá, você está funcionando?";
		console.log(`📤 Pergunta: "${testMessage}"`);

		const response = await runner.ask(testMessage);
		console.log(`📥 Resposta: "${response}"\n`);

		console.log("✅ ADK funcionando corretamente!");
		
		// Limpar arquivo de teste
		if (fs.existsSync(dbPath)) {
			fs.unlinkSync(dbPath);
		}

		// Resumo final
		console.log("\n" + "═".repeat(60));
		console.log("📊 RESUMO DOS TESTES:");
		console.log("═".repeat(60));
		console.log(`   ✅ ADK: OK`);
		console.log(`   📝 Token: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
		console.log(`   🤖 Modelo: ${model}`);
		console.log(`   🌐 Status: Conectado`);
		console.log("═".repeat(60));
		
		process.exit(0);
	} catch (error) {
		console.error("\n❌ ERRO ao testar ADK:");
		
		if (error instanceof Error) {
			console.error(`   Mensagem: ${error.message}`);
			
			// Verificar erros comuns
			if (error.message.includes("API key") || error.message.includes("authentication")) {
				console.error("\n💡 Possíveis soluções:");
				console.error("   1. Verifique se a chave de API está correta");
				console.error("   2. Verifique se a chave tem permissões adequadas");
				console.error("   3. Verifique se a chave não expirou");
			} else if (error.message.includes("model") || error.message.includes("LLM")) {
				console.error("\n💡 Possíveis soluções:");
				console.error("   1. Verifique se o modelo especificado está disponível");
				console.error("   2. Verifique se OPENAI_API_KEY ou GOOGLE_API_KEY estão configuradas");
			} else if (error.message.includes("network") || error.message.includes("fetch")) {
				console.error("\n💡 Possíveis soluções:");
				console.error("   1. Verifique sua conexão com a internet");
				console.error("   2. Verifique se há firewall bloqueando a conexão");
			}
		} else {
			console.error(`   Erro desconhecido: ${String(error)}`);
		}

		// Resumo final mesmo com erro
		console.log("\n" + "═".repeat(60));
		console.log("📊 RESUMO DOS TESTES:");
		console.log("═".repeat(60));
		console.log(`   ❌ ADK: Falhou`);
		console.log(`   📝 Token: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
		console.log("═".repeat(60));

		process.exit(1);
	}
}

// Executar teste
testIQAIConnection().catch((error) => {
	console.error("❌ Erro fatal:", error);
	process.exit(1);
});

