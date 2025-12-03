#!/usr/bin/env tsx

/**
 * 💬 Chat Interativo com FlowCloser
 * Permite conversar com o agente diretamente no terminal
 */

import * as dotenv from "dotenv";
import * as readline from "readline";

// Forçar uso do .env mesmo se houver variáveis de ambiente do sistema
dotenv.config({ override: true });

// Garantir que a chave do .env seja usada (sobrescrever qualquer variável do sistema)
const env = dotenv.config({ override: true });
if (env.parsed?.OPENAI_API_KEY) {
	process.env.OPENAI_API_KEY = env.parsed.OPENAI_API_KEY;
	console.log("✅ Usando chave OpenAI do .env");
}
// Configurar Organization e Project se disponíveis
if (env.parsed?.OPENAI_ORG_ID) {
	process.env.OPENAI_ORG_ID = env.parsed.OPENAI_ORG_ID;
}
if (env.parsed?.OPENAI_PROJECT_ID) {
	process.env.OPENAI_PROJECT_ID = env.parsed.OPENAI_PROJECT_ID;
}

import { askWithFallback } from "./src/agents/flowcloser/agent.js";

// Cores para o terminal
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

// Interface readline para entrada do usuário
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// Banner
console.log(colors.cyan + colors.bright);
console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║                                                           ║");
console.log("║           💬 FlowCloser - Chat Interativo                ║");
console.log("║                                                           ║");
console.log("║     Digite sua mensagem e pressione ENTER               ║");
console.log("║     Digite 'sair' ou 'exit' para encerrar               ║");
console.log("║     Digite 'clear' para limpar o histórico               ║");
console.log("║                                                           ║");
console.log("╚═══════════════════════════════════════════════════════════╝");
console.log(colors.reset);

// Verificar variáveis de ambiente
const apiKey = process.env.IQAI_API_KEY;
if (!apiKey || apiKey === "your_iqai_api_key_here") {
	console.error(colors.red + "❌ ERRO: IQAI_API_KEY não configurada no .env" + colors.reset);
	console.log(colors.yellow + "💡 Configure a variável IQAI_API_KEY no arquivo .env" + colors.reset);
	process.exit(1);
}

const model = process.env.LLM_MODEL || "gpt-4o";
const fallbackModel = process.env.LLM_MODEL_FALLBACK || "gemini-2.5-flash";

console.log(colors.dim + `🤖 Modelo primário: ${model}` + colors.reset);
console.log(colors.dim + `🔄 Modelo fallback: ${fallbackModel}` + colors.reset);
console.log(colors.dim + `📝 Canal: terminal` + colors.reset);
console.log("");

// Histórico de conversa (opcional, para contexto)
let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

// Função para fazer pergunta ao agente
async function askAgent(question: string): Promise<string> {
	try {
		console.log(colors.blue + "🔄 Processando..." + colors.reset);
		
		const response = await askWithFallback(question, {
			channel: "terminal",
			userId: "terminal-user",
			context: {
				source: "terminal",
				timestamp: new Date().toISOString(),
				history: conversationHistory.slice(-5), // Últimas 5 mensagens para contexto
			},
		});

		return response;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return `❌ Erro: ${errorMessage}`;
	}
}

// Função para exibir resposta formatada
function displayResponse(response: string) {
	console.log("");
	console.log(colors.green + colors.bright + "🤖 FlowCloser:" + colors.reset);
	console.log(colors.green + response + colors.reset);
	console.log("");
}

// Função principal de chat
function startChat() {
	rl.question(colors.cyan + "💬 Você: " + colors.reset, async (input) => {
		const userMessage = input.trim();

		// Comandos especiais
		if (userMessage.toLowerCase() === "sair" || userMessage.toLowerCase() === "exit") {
			console.log(colors.yellow + "\n👋 Até logo! Obrigado por usar o FlowCloser." + colors.reset);
			rl.close();
			process.exit(0);
			return;
		}

		if (userMessage.toLowerCase() === "clear" || userMessage.toLowerCase() === "limpar") {
			conversationHistory = [];
			console.log(colors.yellow + "🧹 Histórico limpo!" + colors.reset);
			console.log("");
			startChat();
			return;
		}

		if (userMessage.toLowerCase() === "help" || userMessage.toLowerCase() === "ajuda") {
			console.log(colors.cyan + "\n📖 Comandos disponíveis:" + colors.reset);
			console.log("  • Digite sua mensagem normalmente para conversar");
			console.log("  • 'sair' ou 'exit' - Encerrar o chat");
			console.log("  • 'clear' ou 'limpar' - Limpar histórico");
			console.log("  • 'help' ou 'ajuda' - Mostrar esta ajuda");
			console.log("");
			startChat();
			return;
		}

		if (!userMessage) {
			console.log(colors.yellow + "⚠️ Digite uma mensagem válida" + colors.reset);
			console.log("");
			startChat();
			return;
		}

		// Adicionar ao histórico
		conversationHistory.push({ role: "user", content: userMessage });

		// Obter resposta do agente
		const response = await askAgent(userMessage);

		// Adicionar resposta ao histórico
		conversationHistory.push({ role: "assistant", content: response });

		// Exibir resposta
		displayResponse(response);

		// Continuar conversa
		startChat();
	});
}

// Tratamento de erros
process.on("SIGINT", () => {
	console.log(colors.yellow + "\n\n👋 Encerrando... Até logo!" + colors.reset);
	rl.close();
	process.exit(0);
});

// Iniciar chat
startChat();

