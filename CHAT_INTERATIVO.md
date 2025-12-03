# 💬 Chat Interativo com FlowCloser

## 🚀 Como Usar

### Iniciar o Chat

```bash
npm run chat
```

Ou diretamente:

```bash
tsx chat.ts
```

---

## 📋 Funcionalidades

- ✅ Conversa interativa em tempo real
- ✅ Histórico de conversa (últimas 5 mensagens para contexto)
- ✅ Cores no terminal para melhor visualização
- ✅ Comandos especiais

---

## 🎮 Comandos Disponíveis

- **Digite normalmente** - Conversa com o agente
- `sair` ou `exit` - Encerrar o chat
- `clear` ou `limpar` - Limpar histórico de conversa
- `help` ou `ajuda` - Mostrar ajuda

---

## 💡 Exemplos de Uso

### Exemplo 1: Conversa Básica

```
💬 Você: Olá, preciso de um site
🔄 Processando...

🤖 FlowCloser:
E aí! O que te trouxe aqui?

💬 Você: Quero um site profissional para minha empresa
...
```

### Exemplo 2: Ver Portfólio

```
💬 Você: Quero ver exemplos do seu trabalho
🔄 Processando...

🤖 FlowCloser:
[Resposta com link do portfólio]
...
```

### Exemplo 3: Sair do Chat

```
💬 Você: sair
👋 Até logo! Obrigado por usar o FlowCloser.
```

---

## ⚙️ Configuração

O chat usa as mesmas variáveis de ambiente do projeto:

- `IQAI_API_KEY` - Obrigatória
- `LLM_MODEL` - Padrão: `gpt-4o-mini`
- `LLM_MODEL_FALLBACK` - Padrão: `gemini-2.5-flash`
- `OPENAI_API_KEY` - Para GPT models
- `GOOGLE_API_KEY` - Para Gemini models

---

## 🎨 Cores no Terminal

- 🔵 **Azul** - Suas mensagens
- 🟢 **Verde** - Respostas do FlowCloser
- 🟡 **Amarelo** - Avisos e comandos
- 🔴 **Vermelho** - Erros

---

## 🐛 Troubleshooting

### Erro: "IQAI_API_KEY não configurada"

**Solução:** Configure a variável no arquivo `.env`:
```env
IQAI_API_KEY=sua_chave_aqui
```

### Erro: "Missing required peer dependency: better-sqlite3"

**Solução:** Instale as dependências:
```bash
npm install
```

### Chat não responde

**Solução:** 
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs no console
3. Teste a conexão: `npm run test:iqai`

---

## 📝 Notas

- O chat mantém contexto das últimas 5 mensagens
- O agente usa o mesmo prompt e ferramentas do sistema principal
- Canal configurado como "terminal" para testes
- Histórico é mantido apenas na sessão atual

---

**Divirta-se conversando com o FlowCloser! 🚀**

