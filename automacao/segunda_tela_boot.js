/* Transição antes da primeira pintura; não concede autenticação. */
(()=>{'use strict';try{
if(!window.opener||window.opener.closed||matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
const key=new URL(location.href).searchParams.get('pf-secondary');
if(!['dashboard','entries','new','charts','analysis','tools','security','help'].includes(key))return;
document.documentElement.classList.add('pf-secondary-pending');
let timer;const finish=()=>{clearTimeout(timer);document.documentElement.classList.remove('pf-secondary-pending');};
window.PFSecondScreenLoading={finish};timer=setTimeout(finish,4000);
}catch{document.documentElement.classList.remove('pf-secondary-pending');}})();
