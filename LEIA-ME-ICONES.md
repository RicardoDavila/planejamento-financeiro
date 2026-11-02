# Ícones — V4.12.35

Esta atualização acrescenta ícones sem renomear categorias, cartões, situações, menus ou botões. Os valores e textos continuam sendo os originais.

Aplicação: resumos do PC e do celular, tipos e situações dos lançamentos, navegação lateral/inferior e cartões dos relatórios. A mesma camada foi incluída na versão pessoal, na distribuição e na cópia teste-gemini existente.

Os ícones são SVG decorativos incorporados ao HTML. Não exigem instalação, APK, nova biblioteca, cadastro ou conexão adicional. Os nomes continuam acessíveis aos leitores de tela; os símbolos não são anunciados repetidamente.

Os cálculos, dados, login, isolamento das contas e sincronização foram preservados. A exibição dos ícones acompanha as atualizações das listas, sem modificar as funções financeiras. Os relatórios recebem os mesmos desenhos e continuam compreensíveis na impressão em preto e branco.

## Publicação no repositório atual

Extraia o ZIP e atualize os arquivos do projeto no seu repositório, mantendo a estrutura das pastas. Não envie apenas o ZIP como um arquivo dentro do site. Mantenha suas configurações de GitHub Pages e os demais arquivos de configuração existentes no repositório.

Os arquivos de versão e os caches do PWA foram atualizados para V4.12.35. Depois da publicação, os usuários devem usar o fluxo de atualização já existente no aplicativo. Nenhuma publicação remota foi executada durante esta entrega.

## Manutenção

As fontes da camada visual estão em `automacao/icones_interface.js` e `automacao/icones_interface.css`. Após editá-las, execute:

```powershell
python automacao/aplicar_icones.py
```

Esse comando incorpora a camada nas três telas e pode ser repetido sem duplicar ícones. O gerador de distribuição existente também preserva o bloco incorporado ao HTML pessoal.

## Verificação

Foi feita comparação com o ZIP original: nas três telas financeiras, removendo a camada de ícones e normalizando o número da versão, o HTML e o JavaScript originais permanecem idênticos. Os arquivos de acesso e isolamento permanecem idênticos em bytes.

Os testes existentes do projeto foram executados. Uma página de verificação isolada no navegador também confirmou a preservação dos textos, os ícones de tipo/situação, a atualização de linhas, a ausência de duplicações e os ícones nos relatórios. A página usa exemplos fictícios e não faz parte do aplicativo entregue. Não foi realizado login em contas reais ou alteração de dados na nuvem.
