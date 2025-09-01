# 🏗️ Calculos Solares - Ferramentas de Engenharia Elétrica

## 📋 Descrição

O **Calculos Solares** é uma aplicação web profissional desenvolvida para engenheiros e técnicos de engenharia elétrica, oferecendo ferramentas especializadas para dimensionamento de cabos e cálculos de sombras em instalações fotovoltaicas.

## ✨ Funcionalidades Principais

### 🔌 Dimensionamento de Cabos
- **Tabela Dinâmica**: Interface intuitiva para dimensionamento de circuitos trifásicos
- **Cálculos Automáticos**: Fórmulas RTIEBT implementadas automaticamente
- **Validações**: Verificação das condições de segurança (IB < In < Iz e I2 < 1.45 Iz)
- **Tabelas RTIEBT**: Acesso direto às tabelas de capacidade de condução (Cobre e Alumínio)
- **Responsivo**: Interface otimizada para desktop e mobile

### 🌤️ Cálculos de Sombras
- **Conversor de Coordenadas**: Conversão automática de coordenadas decimais para DMS
- **Fórmulas de Sombreamento**: Cálculo de distâncias para evitar sombras entre painéis
- **Layout Otimizado**: Interface clara com parâmetros de entrada e imagem explicativa
- **Margem de Segurança**: Configurável para compensar imprecisões de instalação

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.0 com React 18
- **UI Components**: shadcn/ui com Tailwind CSS
- **Formulários**: React Hook Form com Zod validation
- **Ícones**: Lucide React
- **Deploy**: Otimizado para Vercel

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone [URL_DO_REPOSITORIO]

# Entrar na pasta do projeto
cd calculos-solares

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Build de Produção
```bash
# Criar build otimizado
npm run build

# Executar build de produção
npm start
```

## 📁 Estrutura do Projeto

```
calculos-solares/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── calculos-sombras/   # Página de cálculos de sombras
│   │   ├── dimensionamento-cabos/ # Página de dimensionamento
│   │   └── ...
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── site/              # Header, Footer, etc.
│   │   └── tables/            # Tabelas especializadas
│   ├── features/              # Funcionalidades específicas
│   │   ├── cabos/             # Lógica de dimensionamento
│   │   └── sombras/           # Lógica de cálculos
│   └── lib/                   # Utilitários
├── public/                    # Assets estáticos
└── ...
```

## 🎯 Convenções de Desenvolvimento

### Commits Semânticos
Seguimos a convenção de commits semânticos. Consulte o arquivo `COMMIT_GUIDELINES.md` para detalhes.

### Estrutura de Branches
- `main` - Código de produção
- `develop` - Código em desenvolvimento
- `feat/*` - Novas funcionalidades
- `fix/*` - Correções de bugs

## 📊 Fórmulas Implementadas

### Dimensionamento de Cabos
- **IB**: Corrente de projeto (kW/kVA)
- **I2**: Corrente de funcionamento da proteção
- **1.45 Iz**: Capacidade de condução com fator de segurança
- **U**: Queda de tensão
- **DU%**: Percentagem de queda de tensão
- **DU Total**: Soma cumulativa das quedas de tensão

### Cálculos de Sombras
- **h**: Altura do painel = b × sin(β)
- **γ**: Ângulo solar = 90° - |latitude - (-23.44°)|
- **d1**: Distância de sombra = h / tan(γ - α) + 0.2
- **d**: Distância total = d1 + b × cos(β)

## 🔗 Links Úteis

- **RTIEBT**: [Portaria 949-A/2006](https://files.diariodarepublica.pt/1s/2006/09/17501/00020191.pdf)
- **DGEG**: [Direção-Geral de Energia e Geologia](https://www.dgeg.gov.pt)

## 👥 Desenvolvimento

### Equipe
- **Desenvolvedor**: Joao Barros
- **Empresa**: Circuitos Energy Solutions, Lda.

### Contribuição
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feat/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da **Circuitos Energy Solutions, Lda.** Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico, contacte: **info@circuitosenergy.pt**

---

**Desenvolvido com precisão e conformidade técnica** ⚡
