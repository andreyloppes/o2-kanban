#!/bin/bash
# ============================================
# O2 Kanban — Setup Google OAuth
# Guia interativo para configurar Google Login
# ============================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔐 O2 Kanban — Setup Google OAuth     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Detectar URL do Supabase do .env.local
ENV_FILE="$(dirname "$0")/../.env.local"
if [ -f "$ENV_FILE" ]; then
  SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL "$ENV_FILE" | cut -d'=' -f2)
  SUPABASE_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
  echo -e "${GREEN}✓${NC} Supabase URL detectada: ${BOLD}$SUPABASE_URL${NC}"
  echo -e "${GREEN}✓${NC} Project ref: ${BOLD}$SUPABASE_REF${NC}"
else
  echo -e "${RED}✗${NC} .env.local não encontrado. Execute a partir da raiz do projeto."
  exit 1
fi

# Detectar URL do app (Vercel)
echo ""
echo -e "${YELLOW}Qual é a URL do seu app? (ex: https://o2-kanban.vercel.app)${NC}"
read -p "> " APP_URL
APP_URL=${APP_URL%/} # remove trailing slash

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}PASSO 1: Google Cloud Console${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "1. Acesse: ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
echo ""
echo -e "2. Crie um projeto (ou selecione um existente)"
echo ""
echo -e "3. Configure a ${BOLD}Tela de Consentimento OAuth${NC}:"
echo "   - User Type: Externo"
echo "   - App name: O2 Kanban"
echo "   - Email de suporte: seu email"
echo "   - Scopes: email, profile, openid"
echo "   - Domínios autorizados: supabase.co"
echo ""
echo -e "4. Crie ${BOLD}Credenciais > OAuth Client ID${NC}:"
echo "   - Tipo: Aplicativo Web"
echo "   - Nome: O2 Kanban"
echo ""
echo -e "   ${BOLD}Authorized JavaScript Origins:${NC}"
echo -e "   ${GREEN}$APP_URL${NC}"
echo ""
echo -e "   ${BOLD}Authorized Redirect URIs:${NC}"
echo -e "   ${GREEN}${SUPABASE_URL}/auth/v1/callback${NC}"
echo ""
echo -e "5. Copie o ${BOLD}Client ID${NC} e ${BOLD}Client Secret${NC}"
echo ""

read -p "Pressione Enter quando tiver o Client ID e Secret... "

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}PASSO 2: Supabase Dashboard${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "1. Acesse: ${BLUE}https://supabase.com/dashboard/project/${SUPABASE_REF}/auth/providers${NC}"
echo ""
echo -e "2. Encontre ${BOLD}Google${NC} na lista de providers"
echo ""
echo -e "3. Ative o toggle e cole:"
echo "   - Client ID (do passo anterior)"
echo "   - Client Secret (do passo anterior)"
echo ""
echo -e "4. Acesse: ${BLUE}https://supabase.com/dashboard/project/${SUPABASE_REF}/auth/url-configuration${NC}"
echo ""
echo -e "5. Configure:"
echo -e "   - ${BOLD}Site URL:${NC} ${GREEN}$APP_URL${NC}"
echo -e "   - ${BOLD}Redirect URLs:${NC} adicione ${GREEN}$APP_URL/auth/callback${NC}"
echo ""

read -p "Pressione Enter quando tiver configurado no Supabase... "

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}PASSO 3: Migration do Banco${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "Execute a migration OAuth no SQL Editor do Supabase:"
echo -e "${BLUE}https://supabase.com/dashboard/project/${SUPABASE_REF}/sql/new${NC}"
echo ""
echo "Cole o conteúdo de: supabase/migration-oauth.sql"
echo ""

read -p "Pressione Enter quando tiver executado a migration... "

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}PASSO 4: Testar${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "1. Acesse: ${BLUE}$APP_URL/login${NC}"
echo -e "2. Clique em ${BOLD}Google${NC}"
echo -e "3. Autorize com sua conta Google"
echo -e "4. Você deve ser redirecionado para o dashboard"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup completo!                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Troubleshooting:${NC}"
echo "- Se der 'redirect_uri_mismatch': verifique que a URI no Google Cloud"
echo "  é exatamente: ${SUPABASE_URL}/auth/v1/callback"
echo "- Se o login redireciona pra localhost: atualize o Site URL no Supabase"
echo "- Se o usuário não aparece na tabela users: execute migration-oauth.sql"
