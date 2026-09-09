#!/bin/bash

# ============================================================
# PedeJá Mobile - Script de Testes
# Executa todos os testes do projeto
# ============================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  PedeJá Mobile - Execução de Testes${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules não encontrado. Executando npm install...${NC}"
    npm install --legacy-peer-deps
    echo ""
fi

# Verificar se Jest está instalado
if [ ! -f "node_modules/.bin/jest" ]; then
    echo -e "${RED}✗ Jest não encontrado. Instalando dependências...${NC}"
    npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native --legacy-peer-deps
    echo ""
fi

# Verificar se TypeScript está instalado
if [ ! -f "node_modules/.bin/tsc" ]; then
    echo -e "${RED}✗ TypeScript não encontrado. Instalando...${NC}"
    npm install --save-dev typescript --legacy-peer-deps
    echo ""
fi

echo -e "${BLUE}1/3 Verificando TypeScript...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

if ./node_modules/.bin/tsc --noEmit; then
    echo -e "${GREEN}✓ TypeScript: Sem erros de tipo${NC}"
else
    echo -e "${RED}✗ TypeScript: Erros encontrados${NC}"
    echo ""
    echo -e "${RED}Corrija os erros de tipo antes de continuar.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2/3 Executando testes unitários...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

# Executar testes com output detalhado
if ./node_modules/.bin/jest --verbose --forceExit --detectOpenHandles 2>&1; then
    echo ""
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
else
    echo ""
    echo -e "${RED}✗ Alguns testes falharam${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}3/3 Gerando relatório de cobertura...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

# Executar testes com cobertura
if ./node_modules/.bin/jest --coverage --forceExit --detectOpenHandles 2>&1; then
    echo ""
    echo -e "${GREEN}✓ Relatório de cobertura gerado${NC}"
    echo -e "${BLUE}  Relatório em: coverage/lcov-report/index.html${NC}"
else
    echo -e "${YELLOW}⚠ Não foi possível gerar cobertura completa${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}  Execução concluída com sucesso!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Resumo:"
echo -e "  ${GREEN}✓${NC} TypeScript: Verificado"
echo -e "  ${GREEN}✓${NC} Testes: Executados"
echo -e "  ${GREEN}✓${NC} Cobertura: Gerada"
echo ""
