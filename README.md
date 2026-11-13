# Bio-Óleo

Sistema de agendamento de coleta de óleo de cozinha usado (parte do cliente).

## Como rodar
1. `npm install`
2. `npm run server` (json-server em http://localhost:3001, usa o `db.json`)
3. Abrir `telas/tela_abertura.html` com o Live Server do VS Code

## Telas do cliente (pasta `telas/`)
| Tela | Para que serve |
|---|---|
| `tela_abertura`, `tela_sobre`, `tela_contato` | Páginas públicas |
| `tela_cadastro`, `tela_login` | Criar conta e entrar |
| `tela_inicial` | Agendar coleta (domiciliar ou empresa) |
| `tela_solicitacoes` | Acompanhar, rastrear e cancelar agendamentos; pedir devolução do recipiente |
| `tela_devolucao` | Solicitar a devolução do recipiente |
| `tela_avisos` | Avisos da empresa |
| `tela_perfil`, `tela_alterar` | Ver e alterar os dados do cliente |

## Dados (`db.json`)
- **pessoas**: nome, idade, email, senha, cpf, telefone, endereço
- **agendamentos**: usuarioId, tipo (`residencial` | `empresa`), cnpj, reservatorio, endereço, quantidade (litros), data, status, criadoEm, devolucao
- **avisos**: titulo, texto, data

Status do agendamento usados na tela do cliente: `pendente`, `confirmado`, `cancelado`
(combinar com quem faz o painel da empresa; qualquer outro texto de status aparece como está).

## Limitações conhecidas
- Senhas ficam em texto puro no `db.json` e o login é feito no navegador (protótipo, sem autenticação real).
- CPF e CNPJ têm máscara e formato, mas os dígitos verificadores não são conferidos.
