import express from "express";
import * as dotenv from "dotenv";
import { agent, askWithFallback } from "./agents/flowcloser/agent.js";
import { privacyPolicy, termsOfService } from "./routes/legal.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8042;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "flowcloser_webhook_neo";

app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════
// PÁGINAS LEGAIS (Obrigatório para aprovação no Meta Developer)
// ═══════════════════════════════════════════════════════════════════════

app.get("/privacy-policy", privacyPolicy);
app.get("/terms-of-service", termsOfService);

app.get("/api/agents", async (req, res) => {
	try {
		res.json({
			agents: ["flowcloser"],
			status: "ok",
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to list agents" });
	}
});

app.get("/api/webhooks/instagram", (req, res) => {
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];

	if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
		console.log("✅ Webhook verified");
		res.status(200).send(challenge);
	} else {
		res.sendStatus(403);
	}
});

app.post("/api/webhooks/instagram", async (req, res) => {
	try {
		const body = req.body;

		if (body.object === "instagram") {
			body.entry?.forEach((entry: any) => {
				entry.messaging?.forEach(async (event: any) => {
					if (event.message && event.message.text) {
						const senderId = event.sender.id;
						const messageText = event.message.text;

						console.log(`📨 Message from ${senderId}: ${messageText}`);

						try {
							const responseText = await askWithFallback(messageText);
							console.log(`✅ Response: ${responseText}`);
						} catch (error) {
							console.error("Error processing message:", error);
						}
					}
				});
			});

			res.status(200).send("EVENT_RECEIVED");
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		console.error("Webhook error:", error);
		res.sendStatus(500);
	}
});

app.get("/api/auth/instagram/callback", async (req, res) => {
	try {
		const { code } = req.query;

		if (!code) {
			return res.status(400).send("Missing authorization code.");
		}

		const appId = process.env.INSTAGRAM_APP_ID;
		const appSecret = process.env.INSTAGRAM_APP_SECRET;
		const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

		if (!appId || !appSecret || !redirectUri) {
			console.error("Missing Instagram OAuth configuration");
			return res.status(500).send("Server configuration error.");
		}

		const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

		console.log(`🔄 Exchanging code for access token...`);

		const tokenRes = await fetch(tokenUrl);
		const data = (await tokenRes.json()) as {
			access_token?: string;
			error?: { message?: string };
		};

		if (data.error) {
			console.error("Instagram OAuth error:", data.error);
			return res.status(400).send(`Error: ${data.error.message || "Failed to get access token"}`);
		}

		console.log("✅ ACCESS TOKEN received:", data.access_token ? "***" + data.access_token.slice(-10) : "not found");

		res.send(`
			<html>
				<head>
					<title>Instagram Auth Success</title>
					<style>
						body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
						.success { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
						.check { color: #4CAF50; font-size: 48px; }
					</style>
				</head>
				<body>
					<div class="success">
						<div class="check">✓</div>
						<h2>Autenticado com sucesso!</h2>
						<p>Você pode fechar esta janela.</p>
						<p><small>Access Token salvo no servidor.</small></p>
					</div>
				</body>
			</html>
		`);
	} catch (error) {
		console.error("Instagram callback error:", error);
		res.status(500).send(`Error: ${error instanceof Error ? error.message : "Internal server error"}`);
	}
});

app.post("/api/agents/flowcloser/message", async (req, res) => {
	try {
		const { message, sessionId } = req.body;

		if (!message) {
			return res.status(400).json({ error: "Message is required" });
		}

		const response = await askWithFallback(message);

		res.json({
			response: response,
			sessionId: sessionId || "default",
		});
	} catch (error) {
		console.error("Error processing message:", error);
		res.status(500).json({
			error: "Failed to process message",
			details: error instanceof Error ? error.message : String(error),
		});
	}
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 FlowCloser API running on port ${PORT}`);
	console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
	console.log(`📍 Agents: http://0.0.0.0:${PORT}/api/agents`);
	console.log(`📍 Instagram Webhook: http://0.0.0.0:${PORT}/api/webhooks/instagram`);
	console.log(`📍 Instagram OAuth Callback: http://0.0.0.0:${PORT}/api/auth/instagram/callback`);
	console.log(`📍 Privacy Policy: http://0.0.0.0:${PORT}/privacy-policy`);
	console.log(`📍 Terms of Service: http://0.0.0.0:${PORT}/terms-of-service`);
});
