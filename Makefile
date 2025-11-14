.PHONY: help install build dev test lint format clean clean-all web agent-flowcloser setup check-env

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project variables
NODE_VERSION := 22
PNPM_VERSION := 9.0.0
ADK_WEB_PORT := 8042
ADK_WEB_URL := https://adk-web.iqai.com

# Default target
.DEFAULT_GOAL := help

##@ Help

help: ## Display this help message
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           FlowCloser ADK-TS - Makefile Commands             ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(GREEN)Usage:$(NC)\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Setup & Installation

setup: check-env install ## Complete project setup (check env + install)
	@echo "$(GREEN)✅ Setup complete!$(NC)"

check-env: ## Check environment prerequisites
	@echo "$(BLUE)🔍 Checking environment...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is not installed$(NC)"; exit 1; }
	@command -v pnpm >/dev/null 2>&1 || { echo "$(RED)❌ pnpm is not installed. Install with: npm install -g pnpm@$(PNPM_VERSION)$(NC)"; exit 1; }
	@node -v | grep -q "^v$(NODE_VERSION)" || { echo "$(YELLOW)⚠️  Node.js version mismatch. Expected v$(NODE_VERSION)$(NC)"; }
	@test -f .env || { echo "$(YELLOW)⚠️  .env file not found. Creating from .env.example...$(NC)"; cp .env.example .env 2>/dev/null || true; }
	@echo "$(GREEN)✅ Environment check passed$(NC)"

install: ## Install all dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	@pnpm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

install-global-cli: ## Install adk-cli globally
	@echo "$(BLUE)🌐 Installing @iqai/adk-cli globally...$(NC)"
	@npm install -g ./packages/adk-cli
	@echo "$(GREEN)✅ adk-cli installed globally$(NC)"

##@ Development

dev: ## Start development mode (turbo dev)
	@echo "$(BLUE)🚀 Starting development mode...$(NC)"
	@pnpm dev

dev-web: ## Start ADK Web interface
	@echo "$(BLUE)🌐 Starting ADK Web Interface...$(NC)"
	@echo "$(GREEN)🔗 Open: $(ADK_WEB_URL)$(NC)"
	@echo "$(GREEN)   API Server: http://localhost:$(ADK_WEB_PORT)$(NC)"
	@adk web

dev-web-port: ## Start ADK Web on custom port (usage: make dev-web-port PORT=8043)
	@echo "$(BLUE)🌐 Starting ADK Web Interface on port $(PORT)...$(NC)"
	@adk web --port $(PORT)

dev-docs: ## Start documentation server
	@echo "$(BLUE)📚 Starting documentation server...$(NC)"
	@pnpm start:docs

##@ Build

build: ## Build all packages
	@echo "$(BLUE)🔨 Building all packages...$(NC)"
	@pnpm build
	@echo "$(GREEN)✅ Build complete$(NC)"

build-adk: ## Build @iqai/adk package only
	@echo "$(BLUE)🔨 Building @iqai/adk...$(NC)"
	@pnpm build --filter=@iqai/adk
	@echo "$(GREEN)✅ @iqai/adk built$(NC)"

build-cli: ## Build @iqai/adk-cli package only
	@echo "$(BLUE)🔨 Building @iqai/adk-cli...$(NC)"
	@pnpm build --filter=@iqai/adk-cli
	@echo "$(GREEN)✅ @iqai/adk-cli built$(NC)"

build-docs: ## Build documentation
	@echo "$(BLUE)📚 Building documentation...$(NC)"
	@pnpm build:docs
	@echo "$(GREEN)✅ Documentation built$(NC)"

rebuild: clean build ## Clean and rebuild everything
	@echo "$(GREEN)✅ Rebuild complete$(NC)"

##@ Testing

test: ## Run all tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@pnpm test
	@echo "$(GREEN)✅ Tests complete$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)🧪 Running tests in watch mode...$(NC)"
	@pnpm test --watch

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)🧪 Running tests with coverage...$(NC)"
	@pnpm test --coverage

##@ Code Quality

lint: ## Run linter
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	@pnpm lint
	@echo "$(GREEN)✅ Linting complete$(NC)"

format: ## Format code with Biome
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	@pnpm format
	@echo "$(GREEN)✅ Code formatted$(NC)"

format-check: ## Check code formatting without changes
	@echo "$(BLUE)🔍 Checking code format...$(NC)"
	@biome format . --check

lint-fix: format ## Fix linting issues and format code
	@echo "$(GREEN)✅ Code quality fixes applied$(NC)"

##@ Cleanup

clean: ## Clean build artifacts
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	@pnpm clean
	@echo "$(GREEN)✅ Clean complete$(NC)"

clean-cache: ## Clean ADK cache directory
	@echo "$(BLUE)🧹 Cleaning ADK cache...$(NC)"
	@rm -rf .adk-cache
	@echo "$(GREEN)✅ Cache cleaned$(NC)"

clean-dist: ## Clean all dist directories
	@echo "$(BLUE)🧹 Cleaning dist directories...$(NC)"
	@pnpm clean-dist
	@echo "$(GREEN)✅ Dist directories cleaned$(NC)"

clean-modules: ## Clean all node_modules directories
	@echo "$(BLUE)🧹 Cleaning node_modules...$(NC)"
	@pnpm clean-modules
	@echo "$(GREEN)✅ node_modules cleaned$(NC)"

clean-all: clean-cache clean-dist clean-modules ## Clean everything (cache + dist + node_modules)
	@echo "$(GREEN)✅ Full cleanup complete$(NC)"

##@ FlowCloser Agent

agent-flowcloser: ## Test FlowCloser agent (requires adk web running)
	@echo "$(BLUE)🤖 FlowCloser agent is available in ADK Web$(NC)"
	@echo "$(GREEN)   Start with: make dev-web$(NC)"
	@echo "$(GREEN)   Agent location: apps/examples/src/agents/flowcloser/agent.ts$(NC)"

agent-flowcloser-rebuild: clean-cache build-cli install-global-cli ## Rebuild FlowCloser agent and CLI
	@echo "$(GREEN)✅ FlowCloser agent rebuilt$(NC)"

##@ Publishing

version: ## Create a changeset for version bump
	@echo "$(BLUE)📝 Creating changeset...$(NC)"
	@pnpm changeset
	@echo "$(GREEN)✅ Changeset created$(NC)"

version-bump: ## Bump package versions
	@echo "$(BLUE)⬆️  Bumping versions...$(NC)"
	@pnpm version-packages
	@echo "$(GREEN)✅ Versions bumped$(NC)"

publish: ## Build, lint, and publish packages
	@echo "$(BLUE)📦 Publishing packages...$(NC)"
	@pnpm publish-packages
	@echo "$(GREEN)✅ Packages published$(NC)"

##@ Utilities

port-check: ## Check if ADK Web port is in use
	@lsof -ti:$(ADK_WEB_PORT) 2>/dev/null && echo "$(YELLOW)⚠️  Port $(ADK_WEB_PORT) is in use$(NC)" || echo "$(GREEN)✅ Port $(ADK_WEB_PORT) is available$(NC)"

port-kill: ## Kill process using ADK Web port
	@echo "$(BLUE)🔪 Killing process on port $(ADK_WEB_PORT)...$(NC)"
	@lsof -ti:$(ADK_WEB_PORT) 2>/dev/null | xargs kill -9 2>/dev/null && echo "$(GREEN)✅ Port $(ADK_WEB_PORT) freed$(NC)" || echo "$(YELLOW)⚠️  No process found on port $(ADK_WEB_PORT)$(NC)"

logs: ## Show recent ADK logs (if available)
	@echo "$(BLUE)📋 Recent logs:$(NC)"
	@tail -n 50 .adk-cache/*.log 2>/dev/null || echo "$(YELLOW)No log files found$(NC)"

info: ## Show project information
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                  Project Information                       ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Node.js:$(NC) $$(node -v)"
	@echo "$(GREEN)pnpm:$(NC) $$(pnpm -v)"
	@echo "$(GREEN)Package Manager:$(NC) $(PNPM_VERSION)"
	@echo "$(GREEN)ADK Web Port:$(NC) $(ADK_WEB_PORT)"
	@echo "$(GREEN)ADK Web URL:$(NC) $(ADK_WEB_URL)"
	@echo ""
	@echo "$(BLUE)Project Structure:$(NC)"
	@echo "  📦 packages/adk          - Core ADK package"
	@echo "  📦 packages/adk-cli     - CLI tools"
	@echo "  🤖 apps/examples/.../flowcloser - FlowCloser agent"
	@echo ""

##@ Quick Commands

quick-start: setup dev-web ## Quick start: setup + start web interface

quick-test: build test ## Quick test: build + test

quick-clean: clean-cache build-cli install-global-cli ## Quick clean: cache + rebuild CLI

