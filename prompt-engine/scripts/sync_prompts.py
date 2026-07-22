import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(ROOT.parent) / 'backend' / 'src' / 'main' / 'resources' / 'prompts'
TEMPLATES = ROOT / 'templates'


def ensure_out():
    OUT.mkdir(parents=True, exist_ok=True)


def sync():
    ensure_out()
    for p in TEMPLATES.glob('*.md'):
        dest = OUT / p.name
        shutil.copy2(p, dest)
        print('copied', p.name, '->', dest)


if __name__ == '__main__':
    sync()
