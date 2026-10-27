/* Cópia Gemini: leitura de dados e única função de IA autorizada. */
(()=>{const raw=window.fetch.bind(window);window.fetch=(input,init={})=>{
 const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url,location.href);
 const method=String(init.method||(input instanceof Request?input.method:'GET')).toUpperCase();
 if(url.hostname.endsWith('.supabase.co')){
  if(url.hostname!=='oflbclvieeknffjtndxo.supabase.co')return Promise.reject(Error('Projeto Supabase não autorizado.'));
  const auth=url.pathname.startsWith('/auth/v1/');
  const allowed=auth?((url.pathname.endsWith('/token')&&method==='POST')||(url.pathname.endsWith('/user')&&method==='GET')||(url.pathname.endsWith('/logout')&&method==='POST')):((url.pathname==='/rest/v1/planejamento_financeiro_sync'&&method==='GET')||(url.pathname==='/functions/v1/assistente-financeiro'&&method==='POST'));
  if(!allowed)return Promise.reject(Error('Cópia de testes: gravação remota bloqueada.'));
 }
 return raw(input,init);
};})();
