(() => {
 'use strict';
 const $=id=>document.getElementById(id),base=new URL('./',location.href),client=window.supabase?.createClient('https://oflbclvieeknffjtndxo.supabase.co','sb_publishable_n_k8Yggb0xq8ESLo0rYVsw_SZ5LTSpJ',{auth:{storageKey:'pf-distribuicao-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 let user=null,frame=null,generation=0,recovering=false,installEvent=null;
 Object.defineProperty(window,'pfdUser',{get:()=>user});
 Object.defineProperty(window,'pfdClient',{value:client});
 function status(text){$('pfdStatus').textContent=text;}
 function closeApp(){generation++;user=null;frame?.remove();frame=null;$('pfdLogin').hidden=false;for(const d of document.querySelectorAll('dialog[open]'))d.close();}
 function busy(value){$('pfdForm').querySelectorAll('button,input').forEach(el=>el.disabled=value);}
 async function enter(session){
  if(!session?.user){closeApp();status('Entre ou crie sua conta.');return;}
  if(user?.id===session.user.id&&frame&&!recovering)return;
  closeApp();if(recovering){$('pfdForm').hidden=true;$('pfdRecovery').hidden=false;return;}
  const run=generation;status('Verificando sua conta…');
  const {data,error}=await client.auth.getUser(session.access_token);if(run!==generation)return;
  if(error||!data?.user||data.user.id!==session.user.id){status(error?.message ? 'Não foi possível validar sua conta: '+error.message : 'A sessão não corresponde à conta informada. Entre novamente.');return;}
  user=Object.freeze({id:data.user.id,email:data.user.email||''});
  $('pfdPassword').value='';$('pfdLogin').hidden=true;
  frame=document.createElement('iframe');frame.title='Seu planejamento financeiro';frame.src='./app.html';document.body.append(frame);
 }
 if(!client){status('Não foi possível carregar o serviço de acesso. Atualize a página com internet.');return;}
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){recovering=true;closeApp();$('pfdForm').hidden=true;$('pfdRecovery').hidden=false;status('Defina uma nova senha.');return;}
  if(event==='SIGNED_OUT'){recovering=false;closeApp();$('pfdForm').hidden=false;$('pfdRecovery').hidden=true;status('Você saiu. Seus dados continuam vinculados à sua conta.');return;}
  if(user&&session?.user?.id!==user.id)closeApp();
  setTimeout(()=>enter(session).catch(e=>{closeApp();status(e.message);}),0);
 });
 $('pfdForm').onsubmit=async e=>{e.preventDefault();busy(true);status('Entrando…');try{const {data,error}=await client.auth.signInWithPassword({email:$('pfdEmail').value.trim(),password:$('pfdPassword').value});if(error)throw error;recovering=false;await enter(data.session);}catch(e){status('Não foi possível entrar: '+e.message);}finally{busy(false);}};
 $('pfdSignup').onclick=async()=>{if(!$('pfdForm').reportValidity())return;busy(true);status('Criando sua conta…');try{const {data,error}=await client.auth.signUp({email:$('pfdEmail').value.trim(),password:$('pfdPassword').value,options:{emailRedirectTo:base.href}});if(error)throw error;$('pfdPassword').value='';if(data.session)await enter(data.session);else status('Se o cadastro puder ser concluído, você receberá uma confirmação por e-mail. Confirme e depois entre com sua senha.');}catch(e){status('Não foi possível concluir o cadastro: '+e.message);}finally{busy(false);}};
 async function sendReset(email){if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Informe seu e-mail.');const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:base.href});if(error)throw error;return 'Se houver uma conta com esse e-mail, um link de recuperação será enviado. Confira também o spam. Abra o link neste navegador.';}
 $('pfdForgot').onclick=async()=>{try{status(await sendReset($('pfdEmail').value.trim()));}catch(e){status(e.message);}};
 $('pfdRecovery').onsubmit=async e=>{e.preventDefault();if($('pfdNew').value!==$('pfdConfirm').value){status('As senhas não conferem.');return;}const button=e.currentTarget.querySelector('button');button.disabled=true;try{const {error}=await client.auth.updateUser({password:$('pfdNew').value});if(error)throw error;$('pfdNew').value='';$('pfdConfirm').value='';recovering=false;await client.auth.signOut({scope:'local'});$('pfdForm').hidden=false;$('pfdRecovery').hidden=true;status('Senha alterada. Entre com sua nova senha.');}catch(e){status(e.message);}finally{button.disabled=false;}};

 window.pfdConfirmPassword=async password=>{
  if(!user?.id||!user.email)throw Error('Entre novamente na sua conta.');
  const ownerId=user.id,run=generation,email=user.email;
  const response=await fetch('https://oflbclvieeknffjtndxo.supabase.co/auth/v1/token?grant_type=password',{
   method:'POST',headers:{apikey:'sb_publishable_n_k8Yggb0xq8ESLo0rYVsw_SZ5LTSpJ','Content-Type':'application/json'},
   body:JSON.stringify({email,password}),cache:'no-store',signal:AbortSignal.timeout(15000)
  });
  if(user?.id!==ownerId||generation!==run)throw Error('A conta foi alterada. Entre novamente.');
  if(response.status===400||response.status===401)return false;
  if(!response.ok)throw Error(response.status===429?'Muitas tentativas. Aguarde antes de tentar novamente.':'Não foi possível validar a senha. Verifique a conexão e tente novamente.');
  const data=await response.json();
  if(user?.id!==ownerId||generation!==run)throw Error('A conta foi alterada. Entre novamente.');
  return data.user?.id===ownerId;
 };
 window.pfdOpenAccount=()=>{if(!user)return;$('pfdAccountEmail').textContent=user.email;$('pfdAccountStatus').textContent='';$('pfdAccount').showModal();};
 window.pfdLogout=async()=>{const old=user;closeApp();try{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;status('Você saiu da conta.');}catch(e){status('A sessão não pôde ser encerrada: '+e.message+' Tente sair novamente.');if(old){const {data}=await client.auth.getSession();await enter(data.session);}}};
 $('pfdLogout').onclick=()=>window.pfdLogout();$('pfdAccountClose').onclick=()=>$('pfdAccount').close();$('pfdResetInside').onclick=async()=>{const email=user?.email;try{$('pfdAccountStatus').textContent=await sendReset(email||'');}catch(e){$('pfdAccountStatus').textContent=e.message;}};
 window.pfdOpenInstall=()=>{$('pfdShareLink').value=base.href;$('pfdInstallStatus').textContent='';$('pfdInstallDialog').showModal();};
 $('pfdInstall').onclick=window.pfdOpenInstall;$('pfdInstallClose').onclick=()=>$('pfdInstallDialog').close();$('pfdCopyLink').onclick=async()=>{try{await navigator.clipboard.writeText(base.href);$('pfdInstallStatus').textContent='Link copiado.';}catch(e){$('pfdShareLink').select();$('pfdInstallStatus').textContent='Selecione e copie o link acima.';}};
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;});addEventListener('appinstalled',()=>{installEvent=null;$('pfdInstallStatus').textContent='Aplicativo instalado.';});
 $('pfdInstallHere').onclick=async()=>{if(matchMedia('(display-mode: standalone)').matches||navigator.standalone){$('pfdInstallStatus').textContent='Você já está usando a janela do aplicativo instalado.';return;}if(installEvent){const event=installEvent;installEvent=null;await event.prompt();await event.userChoice;return;}$('pfdInstallStatus').textContent=/iPhone|iPad|iPod/.test(navigator.userAgent)?'No Safari, use Compartilhar → Adicionar à Tela de Início.':'No Chrome, abra o menu ⋮ e procure Instalar aplicativo, Adicionar à tela inicial ou Instalar página como app. Se aparecer Abrir no aplicativo, ele já está instalado.';};
 window.pfdVersionCheck=async()=>{const response=await fetch(new URL('version.json?t='+Date.now(),base),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Não foi possível consultar a versão.');return response.json();};
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).catch(()=>status('O acesso está disponível, mas o suporte offline ainda não foi ativado.'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)return;client.auth.getSession().then(({data})=>{if(user&&data.session?.user?.id!==user.id)closeApp();return enter(data.session);}).catch(()=>{});});
})();
