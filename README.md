# User Story Generator

Generate well-structured user stories in Classic and Gherkin format from a simple feature description.

Built by [Xavi Marín](https://xavimarin.net) · [Live demo](https://user-stories.xavimarin.net)

---

## Por qué existe esta herramienta

Escribir user stories bien estructuradas a mano toma entre 15 y 20 minutos por feature, y la calidad varía según quien lo escribe. El resultado: sprints con historias inconsistentes, criterios de aceptación incompletos y ninguna trazabilidad en formato Gherkin.

Esta herramienta elimina ese problema con un motor de templates que genera 2-5 historias completas en menos de 2 minutos, incluyendo formato Gherkin y criterios de aceptación, y permite exportarlas directamente a Jira o CSV.

## Screenshots

> _Añadir capturas tras el primer deploy: landing, vista del generador con historias generadas, modal de Jira._

## Decisiones de producto

- **Sin IA de pago:** el motor de templates en TypeScript puro cubre el 90% de los casos sin coste ni latencia. La IA se añadirá como mejora en v2 (Groq free tier).
- **Dos formatos por historia:** Classic es lo que el equipo entiende; Gherkin es lo que QA necesita. Ofrecer ambos en el mismo card reduce el trabajo a cero.
- **Jira vía server-side proxy:** las credenciales nunca pasan por el navegador — evita CORS y es más seguro.
- **Demo sin login:** cualquier recruiter o PM puede probarlo en 10 segundos sin crear cuenta.

## Setup

### 1. Variables de entorno

No hay variables de entorno obligatorias para el modo demo. Para pre-configurar Jira:

```bash
cp .env.example .env.local
# Edita .env.local con tus valores opcionales
```

### 2. Ejecutar en local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

## Deploy a Vercel

| Variable | Dónde obtenerla | Obligatoria |
|----------|-----------------|-------------|
| _(ninguna requerida)_ | — | No |

```bash
# Opción A — CLI
npm i -g vercel
vercel deploy --prod

# Opción B — GitHub
# 1. Sube el repo a GitHub
# 2. vercel.com/new → Import → Deploy
# Framework: Next.js (auto-detectado)
```

### Conectar el subdominio (user-stories.xavimarin.net)

1. Vercel dashboard → Settings → Domains → Añadir `user-stories.xavimarin.net`
2. En tu proveedor DNS, registro CNAME:
   - Name: `user-stories`
   - Value: `cname.vercel-dns.com`
3. SSL automático en ~1 min

## Cómo funciona

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Usuario describe la feature | Inputs: título, persona, objetivo, beneficio |
| 2 | Motor de templates | Genera 2-5 historias con 5 arquetipos (happy path, validación, feedback, empty state, permisos) |
| 3 | Export | Copia individual, CSV completo, o push a Jira via REST API v3 con ADF |

## Roadmap

- [ ] Integración con Groq (Llama 3.3) para generación con IA cuando los templates no son suficientes
- [ ] Exportar en formato Notion / Confluence
- [ ] Guardar historias en sesión con Supabase free tier
- [ ] Dark/light mode toggle
- [ ] Soporte para épicas (agrupar varias features)

## Limitaciones conocidas

- El motor de templates genera historias basadas en patrones predefinidos — no infiere semántica libre del texto de entrada. Para features muy específicas, los campos estructurados (persona, objetivo, beneficio) guían mejor el output.
- La integración con Jira requiere un token de API de Atlassian — no funciona con SSO/SAML corporativo sin token.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS, Vercel
- Sin base de datos, sin autenticación, sin dependencias de IA

## Licencia

MIT
