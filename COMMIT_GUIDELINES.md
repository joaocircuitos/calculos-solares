# 📝 Diretrizes de Commits - Projeto Circuitos

## 🎯 Convenção de Commits Semânticos

Utilizamos commits semânticos para manter um histórico claro e organizado. Cada commit deve seguir o formato:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

## 🏷️ Tipos de Commit

### ✨ `feat` - Nova Funcionalidade
- Adiciona uma nova funcionalidade ao projeto
- Exemplo: `feat(cabos): adiciona tabela dinâmica de dimensionamento`

### 🐛 `fix` - Correção de Bug
- Corrige um bug ou problema
- Exemplo: `fix(sombras): corrige cálculo da margem de segurança`

### 📚 `docs` - Documentação
- Atualiza documentação, comentários ou README
- Exemplo: `docs: atualiza diretrizes de commits`

### 🎨 `style` - Formatação
- Alterações que não afetam o código (espaços, formatação, etc.)
- Exemplo: `style(ui): ajusta espaçamento dos componentes`

### ♻️ `refactor` - Refatoração
- Refatoração de código sem alterar funcionalidade
- Exemplo: `refactor(cabos): reorganiza funções de cálculo`

### ⚡ `perf` - Performance
- Melhorias de performance
- Exemplo: `perf(sombras): otimiza cálculos em tempo real`

### ✅ `test` - Testes
- Adiciona ou corrige testes
- Exemplo: `test(cabos): adiciona testes para fórmulas`

### 🔧 `chore` - Tarefas de Manutenção
- Tarefas de build, dependências, configurações
- Exemplo: `chore: atualiza dependências do projeto`

## 🎯 Escopos

### `cabos` - Funcionalidades de Dimensionamento de Cabos
- Tabela dinâmica
- Cálculos elétricos
- Validações RTIEBT

### `sombras` - Funcionalidades de Cálculos de Sombras
- Conversor de coordenadas
- Fórmulas de sombreamento
- Layout da página

### `ui` - Interface do Usuário
- Componentes visuais
- Layout responsivo
- Estilos e temas

### `seo` - Otimização para Motores de Busca
- Metadados
- Estrutura de dados
- Performance

### `mobile` - Otimizações Mobile
- Layout responsivo
- UX mobile
- Performance mobile

## 📝 Exemplos de Commits

### ✅ Bons Exemplos:
```
feat(cabos): adiciona funcionalidade de remover linhas na tabela
fix(sombras): corrige conversão de coordenadas sem casas decimais
refactor(ui): reorganiza layout da página de sombras
docs: adiciona diretrizes de commits
style(mobile): ajusta espaçamento em dispositivos móveis
```

### ❌ Maus Exemplos:
```
fix bug
update
changes
wip
```

## 🔄 Padrão de Branch

### Branches Principais:
- `main` - Código de produção
- `develop` - Código em desenvolvimento

### Branches de Feature:
- `feat/nome-da-funcionalidade`
- `fix/nome-do-bug`
- `refactor/nome-da-refatoracao`

## 📋 Checklist de Commit

Antes de fazer commit, verifique:

- [ ] Código funciona corretamente
- [ ] Testes passam (se aplicável)
- [ ] Documentação atualizada (se necessário)
- [ ] Commit segue a convenção semântica
- [ ] Mensagem é clara e descritiva
- [ ] Não há código temporário ou comentários desnecessários

## 🚀 Primeiro Commit

Para o primeiro commit do projeto:

```
feat: implementa ferramentas de engenharia elétrica

- Adiciona dimensionamento de cabos com tabela dinâmica
- Implementa cálculos de sombras com conversor de coordenadas
- Cria interface responsiva e intuitiva
- Inclui validações RTIEBT e fórmulas elétricas
- Adiciona SEO otimizado e estrutura profissional
```

---

**Nota:** Estas diretrizes garantem um histórico de commits limpo, organizado e profissional! 🎯
