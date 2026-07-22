Estrutura `prompt-engine/`

- `templates/` — templates principais de prompt (vídeo/imagem).
- `libraries/` — blocos reutilizáveis, fragments.
- `examples/` — prompts de exemplo prontos para gerar.
- `scripts/` — scripts para gerar/testar/sincronizar prompts.

Conveções

- Nome dos arquivos: `video-<nome>--template.md` ou `image-<nome>--template.md`.
- Variáveis: use `{{VAR_NAME}}`.

Uso rápido

1. Adicione templates em `templates/`.
2. Rode `python scripts/test_engine.py` para gerar um prompt de exemplo.
3. Rode `python scripts/sync_prompts.py` para copiar para `backend/src/main/resources/prompts`.
