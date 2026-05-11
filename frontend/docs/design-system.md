# Design System (frontend)

Este frontend usa **Vue 3 + Vite + Tailwind CSS** com **shadcn-vue** (componentes UI) e tokens baseados em **CSS Variables**.

## 1) Fundamentos

### Tokens (cores, raio, tipografia)
- Os tokens ficam em `src/index.css` como variáveis CSS (`:root` e `.dark`).
- O Tailwind mapeia esses tokens para classes semânticas via `@theme inline`.

Use preferencialmente as classes semânticas (elas acompanham o tema):
- Fundo/texto: `bg-background`, `text-foreground`
- Superfície: `bg-card`, `text-card-foreground`
- Muted: `text-muted-foreground`, `bg-muted`
- Bordas: `border-border`, `ring-ring`
- Ações: `text-primary`, `bg-primary`, `text-primary-foreground`
- Estado destrutivo: `text-destructive`, `bg-destructive`

Tipografia:
- Fonte padrão: Inter (`--font-sans`) aplicada no `body`.

Raio:
- `--radius` define o “base radius” e o Tailwind deriva `--radius-sm/md/lg/xl`.

### Dark mode
- O modo escuro é ativado pela classe `.dark` em um ancestral (geralmente no `html`/`body`).
- Não hardcode cores para “consertar” contraste no dark; use tokens.

### Animações
- O projeto carrega `tw-animate-css` e `tailwindcss-animate`.
- Padrão: use utilitários do tipo `animate-in`, `fade-in`, `zoom-in`, `duration-300`.

## 2) Componentes UI (shadcn-vue)

### Onde ficam
- `src/components/ui/*` contém os componentes base (ex.: `card`, `alert`, `avatar`).

### Como importar
- Use os barrels existentes:
  - `import { Card, CardContent } from '@/components/ui/card'`
  - `import { Alert, AlertTitle } from '@/components/ui/alert'`

### Como estender estilo
- Os componentes aceitam `class` e internamente fazem merge com `cn()`.
- Utilitário: `src/lib/utils.ts` exporta `cn(...classes)` (clsx + tailwind-merge).

Regra prática:
- Estilo “padrão do design system” → deixe no componente `ui/*`.
- Estilo de layout/variação do contexto (ex.: espaçamento de uma tela) → passe via `class` no uso.

## 3) Convenções de organização

- `src/views/*`:
  - Componentes de rota (páginas).
  - Devem conter orquestração (router, chamadas de API, stores) e composição de seções.

- `src/components/ui/*`:
  - Componentes genéricos e reutilizáveis (design system).

- `src/components/<feature>/*`:
  - Componentes específicos de uma feature/tela (ex.: `home/`, `rows/`, etc.).
  - Preferir props bem tipadas e eventos (`defineEmits`) no lugar de acessar router/store direto.

## 4) Como componentizar uma View (passo a passo)

1. **Identifique blocos** que se repetem ou que têm muita marcação (ex.: Header, Cards, Grids).
2. **Extraia componentes “presentacionais”** primeiro (recebem props, emitem eventos).
3. **Mantenha a fonte de dados na View** (por enquanto): o componente não deve buscar dados.
4. **Suba ou desça estado**:
   - Estado local (ex.: “card expandido” dentro de um carrossel) pode ficar no próprio componente.
   - Estado compartilhado entre seções (ex.: filtros globais) tende a ficar na View/store.
5. **Congele o UX**: copie classes/markup para garantir que visual e espaçamento não mudem.

## 5) Exemplo aplicado: HomeView

A `HomeView` foi quebrada em:
- `src/components/home/HomeHeader.vue`
- `src/components/home/HomeAlert.vue`
- `src/components/home/CarreiraCarousel.vue`
- `src/components/home/CarreiraCard.vue`
- `src/components/home/GeneralInfoGrid.vue`
- `src/components/home/types.ts`

Resultado:
- A View fica responsável por `router` + dados (mock por enquanto).
- O carrossel gerencia internamente a seleção/expansão da carreira.
- Cada componente fica menor e mais fácil de evoluir (ex.: trocar mock por API depois).
