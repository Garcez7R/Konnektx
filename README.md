# Konnektx

Konnektx e um PWA para barbearias, saloes e profissionais de beleza com pagina publica, agendamento e fidelidade.

## Demo
- Front: (em breve)
- API health: (em breve)

## Arquitetura
- `web/`: PWA (Vite + React + TypeScript)
- `api/`: Cloudflare Worker
- D1 + R2: previstos na proxima etapa

## Rodar local
1. `cd api` e rode `npm install` (uma vez)
2. `npm run dev`
3. Em outra aba: `cd web` e rode `npm install` (uma vez)
4. `npm run dev`
5. Abra `http://localhost:5173/s/aurora`

## Deploy
- Worker: `cd api` -> `npm run deploy`
- Pages: publicar `web/`

No Pages, configure `VITE_API_BASE` com a URL do Worker.

## Variaveis de ambiente
- `VITE_API_BASE` (front)
- `GOOGLE_CLIENT_ID` (futuro)
- `GOOGLE_CLIENT_SECRET` (futuro)
- `D1_DATABASE_ID` (futuro)
- `R2_BUCKET_NAME` (futuro)

## Roadmap
- Login Google para clientes e equipe
- Banco D1 para saloes, agenda e fidelidade
- Upload de logo e capa no R2
- Painel do salao (dono + funcionarios)

## Licenca
A definir
