# Você Calcula 🧮

Hub de calculadoras utilitárias construído com React e Next.js, focado em organização de código, experiência de usuário e práticas modernas de desenvolvimento front-end.

---

## Preview

![Preview do projeto](./public/preview.png)

---

## Sobre o projeto

O **Você Calcula** é uma aplicação web que reúne diferentes ferramentas de cálculo do dia a dia, como finanças, saúde e matemática.

O projeto foi criado com foco em prática de desenvolvimento front-end moderno, incluindo componentização, consumo de APIs, validação de dados e organização por módulos (*feature-based architecture*).

A ideia é simular um produto real, com escalabilidade e manutenção em mente.

Obs.: Este repositório é do FRONT-END da aplicação. Para ver o BACK-END acesse o repositório [voce-calcula-backend](https://github.com/davihenriquedev1/voce-calcula-backend/)

---

## Funcionalidades

- **Saúde**
  - Calculadora de IMC
  - Calculadora de TMB (Taxa Metabólica Basal)

- **Finanças**
  - Conversor de moedas (API externa)
  - Simulador de investimentos
  - Calculadora de empréstimos com tabela de amortização

- **Matemática**
  - Calculadora científica

- **Interface**
  - Tema claro/escuro
  - Animações de interface

---

## Tecnologias

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-000000?style=for-the-badge&logo=radix-ui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-EF008F?style=for-the-badge&logo=framer&logoColor=white)

![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge)

![React Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge)

![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)

---

## Como rodar o projeto

```bash
git clone https://github.com/davihenriquedev1/voce-calcula.git

cd voce-calcula
npm install
````

Crie um arquivo `.env` baseado no `.env.example` (caso necessário).

Depois rode o projeto:

```bash
npm run dev
```

A aplicação ficará disponível em:
[localhost:3000](http://localhost:3000)

---

## Estrutura do projeto

O projeto segue uma organização baseada em features, separando responsabilidades por domínio:

```
/src
  /app           # Rotas (Next.js App Router)
  /components    # Componentes reutilizáveis
  /features      # Módulos da aplicação (bmi, loans, etc.)
  /hooks         # Hooks personalizados
  /providers     # Contextos globais
  /utils         # Funções auxiliares
```

---

## Melhorias futuras

* Melhorias de performance em tabelas grandes
* Aumento da cobertura de testes
* Adicionar mais páginas de calculadoras diversas
* Melhorias de acessibilidade


---

![Vercel](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)

Acesse o site:
[voce-calcula.vercel.app](https://voce-calcula.vercel.app)
