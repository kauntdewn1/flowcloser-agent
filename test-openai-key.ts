#!/usr/bin/env tsx

/**
 * 🔑 Teste de Validação da Chave OpenAI
 * Verifica se a chave está correta e funcionando
 */

import * as dotenv from "dotenv";

dotenv.config();

async function testOpenAIKey() {
	console.log("🔍 Testando chave da OpenAI...\n");
	console.log("═".repeat(60));

	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		console.error("❌ ERRO: OPENAI_API_KEY não encontrada no .env");
		process.exit(1);
	}

	// Mostrar início e fim da chave (sem expor tudo)
	const keyPreview = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`;
	console.log(`📝 Chave encontrada: ${keyPreview}`);
	console.log(`📏 Tamanho: ${apiKey.length} caracteres`);
	console.log(`🔤 Começa com: ${apiKey.substring(0, 7)}`);
	console.log("");

	// Testar diretamente com a API da OpenAI
	console.log("🔄 Testando conexão com OpenAI API...\n");

	try {
		const response = await fetch("https://api.openai.com/v1/models", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
		});

		const status = response.status;
		const data = await response.json();

		if (status === 200) {
			console.log("✅ Chave válida! Conexão com OpenAI funcionando.");
			console.log(`📊 Total de modelos disponíveis: ${data.data?.length || 0}`);
			
			// Verificar se o modelo gpt-4o-mini está disponível
			const models = data.data?.map((m: any) => m.id) || [];
			const hasGpt4oMini = models.some((id: string) => id.includes("gpt-4o-mini"));
			
			if (hasGpt4oMini) {
				console.log("✅ Modelo gpt-4o-mini disponível!");
			} else {
				console.log("⚠️ Modelo gpt-4o-mini não encontrado na lista");
				console.log("   Modelos disponíveis (primeiros 5):");
				models.slice(0, 5).forEach((id: string) => {
					console.log(`   - ${id}`);
				});
			}
		} else if (status === 401) {
			console.error("❌ ERRO: Chave inválida ou expirada (401)");
			console.error(`   Detalhes: ${JSON.stringify(data)}`);
			console.log("\n💡 Possíveis soluções:");
			console.log("   1. Verifique se a chave está correta no .env");
			console.log("   2. Verifique se a chave não expirou");
			console.log("   3. Gere uma nova chave em: https://platform.openai.com/account/api-keys");
			console.log("   4. Verifique se a chave tem permissões adequadas");
		} else if (status === 429) {
			console.error("⚠️ ERRO: Rate limit atingido (429)");
			console.log("   Aguarde alguns minutos e tente novamente");
		} else {
			console.error(`❌ ERRO: Status ${status}`);
			console.error(`   Resposta: ${JSON.stringify(data)}`);
		}

		console.log("\n" + "═".repeat(60));
		console.log("📊 RESUMO:");
		console.log("═".repeat(60));
		console.log(`   Status HTTP: ${status}`);
		console.log(`   Chave válida: ${status === 200 ? "✅ Sim" : "❌ Não"}`);
		console.log("═".repeat(60));

		process.exit(status === 200 ? 0 : 1);
	} catch (error) {
		console.error("\n❌ ERRO ao testar chave:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		} else {
			console.error(`   ${String(error)}`);
		}
		process.exit(1);
	}
}

testOpenAIKey();

