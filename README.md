# ObraFlow — Gestão integrada da obra

MVP web modular para gestão de obras de data center. O primeiro módulo controla plataformas elevatórias (PTA) e paleteiras elétricas.

## Como executar

Não requer instalação. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor HTTP local.

Os dados são persistidos no `localStorage` do navegador. O QR Code aponta para a rota do equipamento no próprio app, por isso em produção o projeto deve ser publicado em uma URL HTTPS acessível pelos celulares da obra.

## Funcionalidades

- Tela inicial preparada para receber novos módulos da obra
- Aba simplificada de disponibilidade, uso e manutenção de PTAs
- Cadastro de PTA e paleteira elétrica
- 12 PTAs da planilha OMNIA DC01 já cadastradas
- Importação em massa de PTAs pelo mesmo modelo da planilha OMNIA DC01
- Download do modelo oficial e exportação em Excel da base atual de PTAs
- QR Code individual pronto para impressão
- Checklist FV-MAQ-ST fiel ao formulário de campo, com logos Heating Cooling e Afonso França
- Checklist obrigatório tanto na retirada quanto na devolução/baixa
- Respostas A, O, R e NA, horímetro, visto e observações
- Impressão ou download em PDF no mesmo formato da ficha
- Bloqueio automático quando uma falha é registrada
- Registro de empresa, responsável, telefone, local e Data Hall 1–10
- Empresa e responsável selecionados a partir da planilha de efetivo
- Importação de novas versões do relatório de efetivo em Excel
- Exportação em Excel da base atual de empresas e efetivo
- Cadastro, edição e exclusão manual de pessoas e empresas
- Ficha pública do equipamento ao ler o QR Code
- Registro obrigatório de atividade, Data Hall e local específico
- Checklists PEMT como seção interna do módulo de PTAs, não como módulo independente
- Central de checklists com filtros por pessoa, equipamento, tipo e período
- Exportação dos resultados filtrados em Excel
- Visualização e salvamento individual do formulário em PDF
- Impressão do formulário físico em branco ou preenchido
- Confirmação obrigatória de arquivamento da via física na pasta do colaborador
- Previsão de retirada e devolução
- Fluxo de devolução com registro de avaria
- Histórico completo e exportação CSV
- Central de relatórios com PDFs de utilização e movimentações, checklists, frota e efetivo
- Relatório de uso com responsável, empresa, atividade, Data Hall, local e previsão de devolução
- Filtros de relatórios por empresa, pessoa, equipamento, status, tipo, Data Hall, resultado e período
- Visualização responsiva para desktop e celular

## Próxima etapa recomendada

Conectar autenticação e banco de dados compartilhado para operação multiusuário. A interface já separa entidades de equipamentos, usos e movimentações para facilitar essa evolução.
