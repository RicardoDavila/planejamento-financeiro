import pathlib, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
class HubFit33Tests(unittest.TestCase):
 def test_scoped_desktop_layout_keeps_content_available(self):
  css=(ROOT/'automacao/enquadramento_hubs.css').read_text(encoding='utf-8')
  self.assertIn('(min-width:901px) and (pointer:fine)',css)
  self.assertIn('[data-go-view="hub"]',css)
  for forbidden in ['overflow:hidden','overflow:clip','text-overflow:ellipsis','line-clamp','zoom:','transform:scale']:
   self.assertNotIn(forbidden,css)
  self.assertIn('minmax(0,1fr)',css)
  self.assertIn('flex-wrap:wrap!important',css)
 def test_synced_apps_and_explicit_graphics_scope(self):
  css=(ROOT/'automacao/enquadramento_hubs.css').read_text(encoding='utf-8')
  for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/name).read_text(encoding='utf-8')
   self.assertEqual(html.count('<style id="pf-hub-fit-style">'),1,name)
   self.assertIn(css,html,name)
   self.assertIn('root.dataset.goView=view;',html,name)
