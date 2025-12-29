# Calendário CGTIC 2026 - TODO

## Autenticação
- [x] Sistema de autenticação com Manus OAuth
- [x] Controle de acesso por usuário

## Banco de Dados
- [x] Schema de eventos (título, data, hora, descrição, responsável, tipo)
- [x] Schema de responsáveis
- [x] Schema de aniversários
- [x] Migrations aplicadas

## Backend (tRPC + WebSocket)
- [x] CRUD completo de eventos
- [x] WebSocket para sincronização em tempo real
- [x] Endpoint para listar responsáveis
- [x] Endpoint para listar aniversários
- [x] Sistema de notificações em tempo real

## Frontend
- [x] Calendário visual mensal com eventos por dia
- [x] Modal de criação/edição de eventos
- [x] Painel de controle com botões (Novo Evento, Importar, Exportar PDF, Responsáveis, Aniversários, Configurações)
- [x] Sincronização em tempo real via WebSocket
- [x] Notificações visuais de mudanças
- [x] Interface responsiva
- [x] Suporte a tema claro/escuro

## Extras
- [ ] Exportar PDF do calendário
- [ ] Importar eventos
- [x] Testes unitários

## Novas Funcionalidades (Fase 2)
- [x] Exportação PDF do calendário completo
- [x] Filtros de visualização por tipo de evento
- [x] Filtros de visualização por responsável
- [x] Sistema de notificações para eventos próximos
- [x] Modal de configurações com envio manual de notificações

## Migração de Dados
- [x] Extrair eventos do calendário antigo
- [x] Inserir eventos no novo banco de dados
- [x] 7 responsáveis migrados
- [x] 13 eventos migrados

## Ajustes de Layout
- [x] Alterar calendário para mostrar apenas eventos (não todos os dias do mês)
- [x] Exibir data completa e horário nos cartões de eventos

## Novos Responsáveis
- [x] Adicionar setores SMIT/CGTIC como responsáveis (7 setores adicionados)

## Configurações da Página
- [x] Criar tabela de configurações no banco de dados
- [x] Implementar API para salvar/carregar configurações
- [x] Adicionar campos no modal: título, subtítulo, texto do rodapé
- [x] Exibir textos personalizados no cabeçalho e rodapé da página

## Ajustes Visuais
- [x] Alterar cores dos cabeçalhos dos meses para não repetir com cores dos eventos

## Acesso Público
- [x] Permitir criar/editar/excluir eventos sem login
- [x] Remover verificação de autenticação no frontend
- [x] Alterar rotas protegidas para públicas no backend

## Exportação PDF Visual
- [x] Ajustar PDF para exibir calendário igual à tela do site
- [x] Incluir cartões coloridos dos meses
- [x] Manter layout visual dos eventos
