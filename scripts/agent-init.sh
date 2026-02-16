#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CONFIG_FILE="agent.config.yml"
MODE="check"
ROLE_NAME="${AGENT_ROLE:-fullstack}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fix)
      MODE="fix"
      shift
      ;;
    --role)
      ROLE_NAME="${2:-fullstack}"
      shift 2
      ;;
    *)
      echo "Uso: $0 [--fix] [--role <nombre>]"
      exit 1
      ;;
  esac
done

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[ERROR] Falta $CONFIG_FILE"
  exit 1
fi

failures=0
changes=0

ok() { echo "[OK] $1"; }
warn() { echo "[WARN] $1"; }
fix() { echo "[FIX] $1"; }

extract_scalar() {
  local key="$1"
  awk -F': ' -v key="$key" '$1==key {print $2; exit}' "$CONFIG_FILE" | tr -d '"'
}

extract_list_in_defaults() {
  local list_key="$1"
  awk -v key="$list_key" '
    /^defaults:/ {in_defaults=1; next}
    in_defaults && /^[^ ]/ {in_defaults=0}
    in_defaults && $0 ~ "^  " key ":" {in_list=1; next}
    in_defaults && in_list && /^  [a-z_]+:/ {in_list=0}
    in_defaults && in_list && /^    - / {sub(/^    - /, ""); print}
  ' "$CONFIG_FILE"
}

extract_role_title() {
  local role="$1"
  awk -v role="$role" '
    /^roles:/ {in_roles=1; next}
    in_roles && /^  [a-z0-9_-]+:/ {
      current=$1
      gsub(":", "", current)
      in_target=(current==role)
      next
    }
    in_roles && in_target && /^    role_title:/ {
      sub(/^    role_title: /, "")
      gsub(/"/, "")
      print
      exit
    }
  ' "$CONFIG_FILE"
}

ensure_file() {
  local file="$1"
  local content="$2"
  if [[ -f "$file" ]]; then
    ok "$file existe"
    return
  fi

  if [[ "$MODE" == "fix" ]]; then
    printf "%s\n" "$content" > "$file"
    fix "$file creado"
    changes=$((changes + 1))
  else
    warn "$file falta"
    failures=$((failures + 1))
  fi
}

ensure_contains_line() {
  local file="$1"
  local line="$2"

  if [[ ! -f "$file" ]]; then
    warn "$file falta (no se puede validar '$line')"
    failures=$((failures + 1))
    return
  fi

  if rg -n "^${line}$" "$file" >/dev/null 2>&1; then
    ok "$file contiene '$line'"
    return
  fi

  if [[ "$MODE" == "fix" ]]; then
    printf "\n%s\n" "$line" >> "$file"
    fix "$file actualizado con '$line'"
    changes=$((changes + 1))
  else
    warn "$file no contiene '$line'"
    failures=$((failures + 1))
  fi
}

ensure_contains_pattern() {
  local file="$1"
  local pattern="$2"
  local description="$3"

  if [[ ! -f "$file" ]]; then
    warn "$file falta (no se puede validar $description)"
    failures=$((failures + 1))
    return
  fi

  if rg -n "$pattern" "$file" >/dev/null 2>&1; then
    ok "$file declara $description"
  else
    warn "$file no declara $description"
    failures=$((failures + 1))
  fi
}

DEPLOY_AUTO="$(extract_scalar "  deploy_auto" || true)"
ROLE_TITLE="$(extract_role_title "$ROLE_NAME" || true)"
if [[ -z "$ROLE_TITLE" ]]; then
  ROLE_NAME="fullstack"
  ROLE_TITLE="$(extract_role_title "$ROLE_NAME")"
fi

AGENTS_TEMPLATE="# Reglas del Agente

## Regla de inicio
- En la primera pregunta de cada conversación, escanear el rol a cumplir en este repositorio.
- Si no existe una definición explícita de rol, crearla en \`ROLE.md\` antes de implementar cambios.

## Deploy
- Este repositorio usa deploy automático.

## Comandos internos
- \`#init\` ejecuta \`scripts/agent-init.sh\` en modo check.
- \`#init --fix\` corrige configuración mínima faltante.
- Fuente de verdad de la política: \`agent.config.yml\`."

ROLE_TEMPLATE="# Rol del Agente

Rol activo: ${ROLE_NAME}

## Enfoque
- ${ROLE_TITLE}

## Criterios
- Priorizar estabilidad de producción.
- Mantener trazabilidad de causa raíz y corrección."

# Archivos mínimos
while IFS= read -r required_file; do
  [[ -z "$required_file" ]] && continue
  case "$required_file" in
    AGENTS.md)
      ensure_file "$required_file" "$AGENTS_TEMPLATE"
      ;;
    ROLE.md)
      ensure_file "$required_file" "$ROLE_TEMPLATE"
      ;;
    Procfile)
      ensure_file "$required_file" "web: php artisan serve --host 0.0.0.0 --port \${PORT:-10000}"
      ;;
    render.yaml)
      ensure_file "$required_file" "services: []"
      ;;
    *)
      ensure_file "$required_file" ""
      ;;
  esac
done < <(extract_list_in_defaults "required_files")

# Validaciones de líneas
while IFS= read -r check; do
  [[ -z "$check" ]] && continue
  file_part="${check%%::*}"
  line_part="${check#*::}"
  ensure_contains_line "$file_part" "$line_part"
done < <(extract_list_in_defaults "required_line_checks")

# Deploy automático (solo valida que AGENTS lo declare)
if [[ "$DEPLOY_AUTO" == "true" ]]; then
  ensure_contains_pattern "AGENTS.md" "deploy automático|deploy automatico" "deploy automático"
fi

echo "----"
if [[ "$MODE" == "fix" ]]; then
  echo "Init completado. Cambios aplicados: $changes"
else
  echo "Check completado. Fallas: $failures"
fi

if [[ "$MODE" == "check" && $failures -gt 0 ]]; then
  exit 1
fi
