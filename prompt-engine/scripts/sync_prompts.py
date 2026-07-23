import re
import shutil
from pathlib import Path

# Sincroniza o prompt-engine para o classpath do backend.
#   master-prompt.md            -> resources/prompts/veo/master-prompt.md
#   01-*.md ... 14-*.md         -> resources/prompts/veo/knowledge/
# O VideoPromptComposer carrega o master + concatena a base de conhecimento (knowledge).

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(ROOT.parent) / 'backend' / 'src' / 'main' / 'resources' / 'prompts' / 'veo'
KNOWLEDGE_OUT = OUT / 'knowledge'

NUMBERED = re.compile(r'^\d{2}-.*\.md$')


def sync():
    OUT.mkdir(parents=True, exist_ok=True)
    KNOWLEDGE_OUT.mkdir(parents=True, exist_ok=True)

    master = ROOT / 'master-prompt.md'
    shutil.copy2(master, OUT / master.name)
    print('copied', master.name, '->', OUT / master.name)

    for p in sorted(ROOT.glob('*.md')):
        if NUMBERED.match(p.name):
            dest = KNOWLEDGE_OUT / p.name
            shutil.copy2(p, dest)
            print('copied', p.name, '->', dest)


if __name__ == '__main__':
    sync()
