import pathlib,subprocess,unittest,re,hashlib,json
ROOT=pathlib.Path(__file__).resolve().parents[1]
class LightPalette32Tests(unittest.TestCase):
 def test_schemes_preserve_dark_and_semantic_actions(self):
  subprocess.run(['node','-e',r"""
const assert=require('node:assert/strict'),p=require('./automacao/paleta_projeto.js');
for(const [kind,scheme]of Object.entries(p.styles)){assert.strictEqual(p.lightScheme(scheme,kind,false,true),scheme);assert.strictEqual(p.lightScheme(scheme,kind,true,true),scheme);assert.strictEqual(p.lightScheme(scheme,kind,false,false,true),scheme);}
for(const kind of ['primary','pdf','saveBlue'])assert.deepEqual(p.lightScheme(p.styles[kind],kind,false,false),['onBlue','solidBlue','solidBlue']);
assert.deepEqual(p.lightScheme(p.styles.print,'print',false,false),['muted','secondary','secondaryLine']);
assert.deepEqual(p.lightScheme(p.styles.danger,'danger',false,false),['red','secondary','secondaryLine']);
assert.deepEqual(p.lightScheme(p.styles.month,'month',true,false),['blueActive','selected','solidBlue']);
"""],cwd=ROOT,check=True)
 def test_existing_dark_css_unchanged(self):
  # Referência das regras escuras da Etapa 31 aprovada, sem depender de pastas locais.
  new=(ROOT/'automacao/paleta_projeto.css').read_text(encoding='utf-8')
  rule=r'html body\.dark-mode[^{}]*\{[^{}]*\}'
  actual=hashlib.sha256(json.dumps(re.findall(rule,new),ensure_ascii=True,separators=(',',':')).encode()).hexdigest()
  self.assertEqual(actual,'03430c263b8a61b6fef7f542490018b4cd2868bffa462b12c4ce2a2c9b95e75c')
