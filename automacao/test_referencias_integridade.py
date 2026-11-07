import pathlib
import subprocess
import unittest


class ReferenciasIntegridadeTests(unittest.TestCase):
    def test_referencias_backup_pacote_e_importacao(self):
        root = pathlib.Path(__file__).resolve().parents[1]
        subprocess.run(['node', str(root / 'automacao/test_referencias_integridade.cjs')], cwd=root, check=True)


if __name__ == '__main__':
    unittest.main()
