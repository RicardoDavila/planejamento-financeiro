# Correção do menu e conversão de moedas — V4.12.78

Nome: Correção do menu e conversão de moedas

O botão Moeda agora acompanha o botão Idioma imediatamente à direita, no mesmo grupo da barra superior. A posição também acompanha as mudanças entre PC e celular.

A conversão visual passa a abranger os sete cartões reais do painel gerencial atual (receitas, recebido, despesas, a vencer, vencido, investimentos e resultado), além dos saldos adicionais. Os cartões antigos já eram convertidos, mas os campos do painel atual não estavam incluídos. Os cálculos, registros, edição, histórico e backups continuam com os valores originais em reais.

Instalação: este pacote é complementar à atualização de moedas V4.12.77 já aplicada. Extraia na raiz do projeto e substitua os arquivos correspondentes, incluindo automacao. Não apague os demais arquivos. Não é necessário editar novamente publicar.yml; mantenha o ajuste de publicação que ficou verde.

Após publicar, recarregue o sistema e selecione USD ou EUR no menu Moeda. Verifique os cartões do painel e volte a BRL para conferir os valores originais. A cotação, fonte e data continuam disponíveis no menu Moeda.

Verificação: testes de regressão para os sete IDs reais do painel, atualização do valor-base, preservação de edição/histórico e posicionamento junto ao idioma no PC e celular. Geração das versões públicas e comparação dos blocos CSS das três aplicações com a atualização anterior.
