---
name: whatsapp-agentkit
description: >-
  Construye un agente de WhatsApp con IA (Claude) para un negocio: entrevista al usuario, genera el
  servidor FastAPI, el adaptador de Zernio o Meta Cloud API, memoria, herramientas y prompts, lo prueba
  en local y lo despliega en Railway. Se activa con "crea un agente de WhatsApp", "bot de WhatsApp para
  mi negocio", "build-agent", "WhatsApp AI agent", "chatbot de WhatsApp", "agentkit".
argument-hint: "[nombre o descripción del negocio]"
---
<!-- Basado en whatsapp-agentkit de Enrique Rocha (@soyenriquerocha), licencia MIT. Ver LICENSE y NOTICE. -->

# WhatsApp AgentKit

Antes de hacer cualquier otra cosa, lee completo `references/agentkit-instructions.md` (en la carpeta
de esta skill, `.claude/skills/whatsapp-agentkit/`). Es el sistema de instrucciones original de AgentKit
y manda sobre todo lo demás. Donde ese archivo diga "este archivo" o "CLAUDE.md", se refiere a él.

## Dónde se genera el agente

- El agente se genera en un directorio de proyecto propio, nunca dentro de `.claude/`. Si el directorio
  actual ya es un proyecto con otro propósito, propone una carpeta nueva (por ejemplo
  `./whatsapp-agent/`) y trabaja ahí.
- Cuando las instrucciones digan `cp .env.example .env`, primero copia
  `.claude/skills/whatsapp-agentkit/assets/env.example` como `.env.example` en el proyecto del agente.
- Ignora las menciones a `scripts/audit.py`, `start.sh`, `docs/` y al README: auditan o presentan el
  repo-plantilla original y no forman parte del agente generado.

## Flujo — las 5 fases EN ORDEN

FASE 1 — Bienvenida y verificación del entorno
- Muestra el mensaje de bienvenida
- Verifica Python >= 3.11
- Crea las carpetas necesarias (agent/, agent/providers/, config/, knowledge/, tests/)
- Genera requirements.txt e instala dependencias
- Crea .env base

FASE 2 — Entrevista del negocio
- Haz las 10 preguntas UNA POR UNA
- Espera respuesta antes de continuar a la siguiente
- PREGUNTA 9: el usuario elige su proveedor de WhatsApp (Zernio o Meta Cloud API directo)
- PREGUNTA 10: pide las credenciales específicas del proveedor elegido
  - Zernio: ZERNIO_API_KEY + ZERNIO_WEBHOOK_SECRET
  - Meta:   META_ACCESS_TOKEN + META_PHONE_NUMBER_ID + META_VERIFY_TOKEN + META_APP_SECRET
- Si no tiene número de WhatsApp todavía, ofrécele el sandbox de Zernio
- Guarda todas las respuestas para la Fase 3

FASE 3 — Generación del agente
- Genera config/business.yaml con datos del negocio
- Genera config/prompts.yaml con system prompt poderoso y específico
- Si hay archivos en /knowledge, léelos e incorpóralos al prompt
- Genera agent/providers/ con el proveedor elegido (base.py + __init__.py + adaptador)
- Genera agent/main.py (FastAPI + webhook, firma verificada, BackgroundTasks, dedup)
- Genera agent/brain.py (Claude API)
- Genera agent/memory.py (historial + tabla de eventos procesados)
- Genera agent/tools.py (herramientas según caso de uso)
- Genera tests/test_local.py (simulador de chat)
- Genera Dockerfile, docker-compose.yml y .dockerignore
- Configura .env con WHATSAPP_PROVIDER y las API keys del usuario

FASE 4 — Testing local
- Ejecuta python tests/test_local.py
- El usuario chatea con su agente en la terminal
- Verifica que el servidor arranca y que GET / responde status ok
- Si hay ajustes, modifica prompts.yaml y repite
- No avanza sin aprobación del usuario

FASE 5 — Deploy a Railway
- Solo si el usuario quiere
- Build Docker + instrucciones de Railway
- Configuración de webhook específica para el proveedor elegido
- Explicarle la ventana de 24 horas de WhatsApp

## Reglas

- Habla siempre en español
- Una pregunta a la vez
- Nunca hardcodees API keys, y nunca hagas commit del `.env`
- No avances de fase sin confirmación
- El agente debe funcionar antes de hablar de deploy
- Genera SOLO el adaptador del proveedor elegido, no los dos
- No cambies el modelo de Claude por tu cuenta para ahorrar: es decisión del usuario
