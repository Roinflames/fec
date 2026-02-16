# Reglas del Agente (Repositorio FEC)

## Regla obligatoria de primer contacto
- En la primera pregunta de cada conversación, el agente debe escanear el rol que debe cumplir en este repositorio.
- Si no existe una definición explícita de rol, debe crearla en `ROLE.md` antes de continuar con tareas de implementación.

## Fuente de verdad del rol
- El archivo `ROLE.md` define el rol operativo del agente para este repositorio.
- Si hay ambigüedad, `ROLE.md` tiene prioridad para orientar decisiones técnicas.

## Deploy
- Este repositorio usa deploy automático.

## Comandos internos (estilo `#help`)
- `#init`: valida configuración mínima del repo para agentes (modo check, sin escribir).
- `#init --fix`: corrige/crea archivos mínimos faltantes.
- `#init --role <nombre>`: define el rol objetivo al inicializar/corregir.
- Implementación del comando: `scripts/agent-init.sh`.
- Fuente de configuración del init: `agent.config.yml`.
