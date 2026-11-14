import json
import re
import subprocess
import unittest
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Buttons(HTMLParser):
    def __init__(self):
        super().__init__()
        self.handlers = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'button' and attrs.get('onclick'):
            self.handlers.append(attrs['onclick'])

class AreaCardsTests(unittest.TestCase):
    def test_inventory_keeps_original_commands(self):
        definitions = json.loads(subprocess.check_output(
            ['node', '-e', "console.log(JSON.stringify(require('./automacao/areas_cards.js')))"],
            cwd=ROOT, encoding='utf-8'))
        html = (ROOT/'index.html').read_text(encoding='utf-8')
        parser = Buttons(); parser.feed(html)
        self.assertEqual(set(definitions), {'acoes', 'seguranca', 'ajuda'})
        for category, config in definitions.items():
            for key, icon, title, description, *kind in config['items']:
                self.assertTrue(icon and description)
                if kind == ['id']:
                    self.assertIn('id="'+key+'"', html)
                elif kind == ['text']:
                    self.assertIn(key, html)
                elif kind == ['function']:
                    self.assertIn('window.'+key, html)
                else:
                    self.assertTrue(any(key in h for h in parser.handlers), (category, key))
        for category, marker in [('seguranca','pf-seguranca-dropdown'),('ajuda','pf-help-dropdown')]:
            block = re.search(r'<div class="'+marker+r'"[^>]*>([\s\S]*?)</details>',html).group(1)
            p = Buttons(); p.feed(block)
            keys = [d[0] for d in definitions[category]['items']]
            self.assertTrue(all(any(k in h for k in keys) for h in p.handlers))
            self.assertEqual(len(p.handlers),len(keys))

    def test_injected_pages_share_same_navigation(self):
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for tag, file, ident in [('script','areas_cards.js','pf-area-cards-script'),('style','areas_cards.css','pf-area-cards-style')]:
                self.assertEqual(re.findall('<'+tag+' id="'+ident+'">([\s\S]*?)</'+tag+'>',html),[(ROOT/'automacao'/file).read_text(encoding='utf-8')],name)

    def test_navigation_does_not_access_financial_storage(self):
        js=(ROOT/'automacao/areas_cards.js').read_text(encoding='utf-8')
        for forbidden in ['localStorage','sessionStorage','indexedDB','fetch(','transacoes','eval(']:
            self.assertNotIn(forbidden,js)
        self.assertIn('await window.ehAdministrador()',js)
        self.assertIn('ticket!==epoch||!authorized()',js)
        self.assertIn('action.node.click()',js)
        self.assertIn("card.disabled=Boolean(action.node?.disabled)",js)
        self.assertIn("body.classList.contains('pf-area-open')",js)

if __name__=='__main__': unittest.main()

