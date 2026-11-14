const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/segunda_tela.js','utf8');
const methods=source.slice(source.indexOf('function parentGrant('),source.indexOf('function ensure('));
let permitted=true,closed=0,started=0,auth=false,hidden=false,scope='https://example.invalid/app.html';const classes=new Set(['auth-pendente']);
const node={classList:{add(){hidden=true},remove(){hidden=false}}};
const child={},parent={closed:false,location:{href:scope},PFSecondScreenSession:{authorize:(requester,href)=>permitted&&requester===child&&href===scope+'?pf-secondary=dashboard'}};child.opener=parent;child.close=()=>closed++;
const env={URL,window:child,location:{href:scope+'?pf-secondary=dashboard'},choices:[['dashboard']],get protecaoAutenticada(){return auth},set protecaoAutenticada(v){auth=v},inherited:false,authorized:()=>auth&&!classes.has('auth-pendente'),iniciarAplicacao(){started++},$:()=>node,document:{body:{classList:{add(...keys){keys.forEach(k=>classes.add(k))},remove(...keys){keys.forEach(k=>classes.delete(k))}}}}};
vm.createContext(env);vm.runInContext(methods,env);
env.inheritSession();assert(auth);assert(hidden);assert.equal(started,1);env.inheritSession();assert.equal(started,1);
permitted=false;env.revokeInherited();assert(!auth);assert(!hidden);assert(classes.has('auth-pendente'));assert.equal(closed,1);
env.inheritSession();assert(!auth,'sem autorização viva não deve entrar');
permitted=true;parent.location.href='https://other.invalid/app.html';env.inheritSession();assert(!auth,'origem diferente negada');parent.location.href=scope.replace('app.html','other.html');env.inheritSession();assert(!auth,'projeto diferente negado');parent.location.href=scope;
child.opener=null;env.inheritSession();assert(!auth,'abertura independente não herda sessão');child.opener=parent;parent.closed=true;env.inheritSession();assert(!auth,'janela principal fechada não autoriza');
console.log('PASS: herança vinculada à janela principal viva; sem senha/tokens; rejeita origem/projeto diferente, abertura independente e revoga na saída.');

let grantAllowed=true;const receiver={},grantEnv={secondary:receiver,secondaryHref:scope+'?pf-secondary=dashboard',authorized:()=>grantAllowed};vm.createContext(grantEnv);vm.runInContext(source.slice(source.indexOf('function grant('),source.indexOf('window.PFSecondScreenSession=')),grantEnv);assert(grantEnv.grant(receiver,grantEnv.secondaryHref));assert(!grantEnv.grant({},grantEnv.secondaryHref));assert(!grantEnv.grant(receiver,scope));receiver.closed=true;assert(!grantEnv.grant(receiver,grantEnv.secondaryHref));receiver.closed=false;grantAllowed=false;assert(!grantEnv.grant(receiver,grantEnv.secondaryHref));
