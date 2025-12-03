# 🔑 Solução: Chave OpenAI Incorreta

## 🔍 Problema Identificado

O teste mostrou que:
- ❌ A chave no `.env` está sendo **sobrescrita** por uma variável de ambiente do sistema
- ❌ A chave do sistema (`sk-svcacct-...`) está inválida/expirada
- ✅ A chave no `.env` (`sk-proj-...`) parece estar correta

## 💡 Solução

### Opção 1: Remover Variável do Sistema (Recomendado)

A variável `OPENAI_API_KEY` está configurada no seu sistema e está sobrescrevendo o `.env`.

**No macOS/Linux:**
```bash
# Verificar se está configurada
env | grep OPENAI_API_KEY

# Remover do shell atual
unset OPENAI_API_KEY

# Remover permanentemente (se estiver no ~/.zshrc ou ~/.bashrc)
# Edite o arquivo e remova a linha com OPENAI_API_KEY
```

**No Windows:**
```bash
# Remover variável
setx OPENAI_API_KEY ""
```

### Opção 2: Atualizar a Variável do Sistema

Se você quer manter a variável do sistema, atualize com a chave correta:

```bash
# macOS/Linux
export OPENAI_API_KEY="sua_chave_correta_aqui"

# Adicionar ao ~/.zshrc ou ~/.bashrc para persistir
echo 'export OPENAI_API_KEY="sua_chave_correta_aqui"' >> ~/.zshrc
```

### Opção 3: Forçar Uso do .env

Modifique o código para garantir que o `.env` tenha prioridade:

```typescript
// No início do arquivo, antes de usar process.env
import * as dotenv from "dotenv";
dotenv.config({ override: true }); // Força sobrescrever variáveis do sistema
```

## 🧪 Testar Após Correção

```bash
# Testar chave
npm run test:openai

# Se passar, testar chat
npm run chat
```

## 📝 Nota Importante

O **dotenv** por padrão **não sobrescreve** variáveis de ambiente do sistema. Isso é uma feature de segurança, mas pode causar confusão.

A ordem de precedência é:
1. Variáveis do sistema (maior prioridade)
2. Variáveis do `.env` (menor prioridade)

---

**Status:** Chave no `.env` parece correta ✅ | Variável do sistema está sobrescrevendo ❌

