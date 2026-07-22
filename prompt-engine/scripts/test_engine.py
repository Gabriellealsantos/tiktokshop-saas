import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / 'templates'


def list_templates():
    return [p for p in TEMPLATES.glob('*.md')]


def render_template(path: Path, variables: dict = None):
    text = path.read_text(encoding='utf-8')
    if variables:
        for k, v in variables.items():
            text = text.replace('{{%s}}' % k, str(v))
    return text


if __name__ == '__main__':
    templates = list_templates()
    if not templates:
        print('Nenhum template encontrado em', TEMPLATES)
        print('Crie um arquivo .md em templates/ e rode novamente')
    else:
        print('Templates encontrados:')
        for t in templates:
            print('-', t.name)
        print('\nRenderizando o primeiro template com variáveis de exemplo...')
        sample = render_template(templates[0], {'PRODUCT_NAME': 'Meu Produto', 'TONE': 'dinâmico'})
        print('---\n', sample)
