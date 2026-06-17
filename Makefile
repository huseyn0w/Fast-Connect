# Fast Connect — local development via Docker (docker-compose.dev.yml).
#
# Quick start:
#   make up        # build + start the dev stack (client :5173, server :5055)
#   make logs      # follow logs
#   make test      # run both test suites inside the containers
#   make down      # stop and remove the stack
#
# Run `make help` (or just `make`) for the full list.

COMPOSE := docker compose -f docker-compose.dev.yml

# Run one-off test/lint containers from the built images (deps baked in), with
# the source bind-mounted but without starting the rest of the stack.
RUN := $(COMPOSE) run --rm --no-deps

CLIENT_WS := @fast-connect/client
SERVER_WS := @fast-connect/server

.DEFAULT_GOAL := help
.PHONY: help up start stop restart rebuild down clean logs logs-server logs-client ps \
        test test-server test-client typecheck lint sh-server sh-client

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

## --- Lifecycle ---------------------------------------------------------------

up: ## Build (if needed) and start the dev stack in the background
	$(COMPOSE) up --build -d

start: ## Start the existing stopped containers
	$(COMPOSE) start

stop: ## Stop the containers without removing them
	$(COMPOSE) stop

restart: ## Restart the containers
	$(COMPOSE) restart

rebuild: ## Rebuild images and recreate containers, renewing anon node_modules volumes (use after changing dependencies)
	$(COMPOSE) up --build --renew-anon-volumes -d

down: ## Stop and remove containers and networks
	$(COMPOSE) down

clean: ## Remove containers, networks AND volumes (full reset)
	$(COMPOSE) down -v

## --- Inspection --------------------------------------------------------------

logs: ## Follow logs from all services
	$(COMPOSE) logs -f

logs-server: ## Follow server logs
	$(COMPOSE) logs -f server

logs-client: ## Follow client logs
	$(COMPOSE) logs -f client

ps: ## Show container status
	$(COMPOSE) ps

## --- Tests & checks (run inside containers) ----------------------------------

test: test-server test-client ## Run both test suites inside the containers

test-server: ## Run the server test suite inside a container
	$(RUN) server npm run test --workspace $(SERVER_WS)

test-client: ## Run the client test suite inside a container
	$(RUN) client npm run test --workspace $(CLIENT_WS)

typecheck: ## Typecheck both workspaces inside containers
	$(RUN) server npm run typecheck --workspace $(SERVER_WS)
	$(RUN) client npm run typecheck --workspace $(CLIENT_WS)

lint: ## Lint the client inside a container
	$(RUN) client npm run lint --workspace $(CLIENT_WS)

## --- Shell access ------------------------------------------------------------

sh-server: ## Open a shell in the running server container
	$(COMPOSE) exec server sh

sh-client: ## Open a shell in the running client container
	$(COMPOSE) exec client sh
