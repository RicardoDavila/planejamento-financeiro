import json,os,pathlib,subprocess,tempfile,unittest
import gerar
class VersaoPublicacaoTests(unittest.TestCase):
 def test_versao_declarada_sem_contador_github(self):
  old=os.environ.get('GITHUB_RUN_NUMBER')
  try:
   os.environ['GITHUB_RUN_NUMBER']='103'
   self.assertEqual(gerar.versao_publicacao(),'V5.1.6')
   self.assertNotIn("default='V4.12.'",(gerar.ROOT/'automacao/gerar.py').read_text(encoding='utf-8'))
  finally:
   if old is None:os.environ.pop('GITHUB_RUN_NUMBER',None)
   else:os.environ['GITHUB_RUN_NUMBER']=old
 def test_cli_sem_version_produz_versao_correta(self):
  with tempfile.TemporaryDirectory() as tmp:
   out=pathlib.Path(tmp)/'site'
   subprocess.run(['python',str(gerar.ROOT/'automacao/gerar.py'),'--output',str(out)],env={**os.environ,'GITHUB_RUN_NUMBER':'103'},check=True)
   for name in ['version.json','distribuicao/version.json']:
    self.assertEqual(json.loads((out/name).read_text(encoding='utf-8'))['version'],'V5.1.6')
   for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
    html=(out/name).read_text(encoding='utf-8');self.assertIn("const CURRENT_VERSION='V5.1.6';",html);self.assertIn("'+CURRENT_VERSION+'",html)
