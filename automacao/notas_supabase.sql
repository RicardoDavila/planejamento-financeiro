-- Instalação das notas v3. Não modifica tabelas financeiras nem public.notas.
-- Execute no SQL Editor do MESMO projeto Supabase usado pelo aplicativo.
begin;

create table if not exists public.pf_notas_v3 (
 user_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 titulo text not null default '' check (length(titulo)<=200),
 texto text not null default '' check (length(texto)<=100000),
 cor text not null default '#2563eb' check (cor in ('#94a3b8','#2563eb','#16a34a','#f59e0b','#dc2626','#7c3aed')),
 fixa boolean not null default false,
 deleted boolean not null default false,
 versao bigint not null default 1 check (versao>0),
 mutacao uuid not null,
 updated_at timestamptz not null default now(),
 primary key (user_id,id)
);
alter table public.pf_notas_v3 enable row level security;
drop policy if exists pf_notas_v3_ler_proprias on public.pf_notas_v3;
create policy pf_notas_v3_ler_proprias on public.pf_notas_v3
 for select to authenticated using ((select auth.uid())=user_id);

-- Leituras passam pelo RLS. Escritas somente pela função abaixo, com CAS.
revoke all on public.pf_notas_v3 from public,anon,authenticated;
grant select on public.pf_notas_v3 to authenticated;

create or replace function public.pf_notas_gravar_v3(
 p_dono uuid,p_id uuid,p_base bigint,p_mutacao uuid,p_titulo text,p_texto text,
 p_cor text,p_fixa boolean,p_excluida boolean
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 dono uuid := auth.uid();
 atual public.pf_notas_v3%rowtype;
begin
 if dono is null then raise exception 'Entre na sua conta para sincronizar notas.' using errcode='42501'; end if;
 if p_dono is null or p_dono<>dono then raise exception 'A conta mudou; reabra as notas antes de sincronizar.' using errcode='42501'; end if;
 if p_id is null or p_mutacao is null or p_base is null or p_base<0
    or p_titulo is null or p_texto is null or p_cor is null or p_fixa is null or p_excluida is null
    or length(p_titulo)>200 or length(p_texto)>100000
    or p_cor not in ('#94a3b8','#2563eb','#16a34a','#f59e0b','#dc2626','#7c3aed')
 then raise exception 'Nota inválida.' using errcode='22023'; end if;

 -- Serializa tentativas sobre a mesma nota, incluindo sua primeira criação.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(dono::text||':'||p_id::text,0));
 select * into atual from public.pf_notas_v3 where user_id=dono and id=p_id for update;
 if found then
  if atual.mutacao=p_mutacao then
   return pg_catalog.jsonb_build_object('status','aplicada','nota',pg_catalog.to_jsonb(atual));
  end if;
  if atual.versao<>p_base then
   return pg_catalog.jsonb_build_object('status','conflito','nota',pg_catalog.to_jsonb(atual));
  end if;
  update public.pf_notas_v3
   set titulo=case when p_excluida then '' else p_titulo end,
       texto=case when p_excluida then '' else p_texto end,
       cor=p_cor,fixa=p_fixa,deleted=p_excluida,versao=atual.versao+1,
       mutacao=p_mutacao,updated_at=pg_catalog.now()
   where user_id=dono and id=p_id returning * into atual;
 else
  if p_base<>0 then raise exception 'Base da nota indisponível; atualize antes de enviar.' using errcode='40001'; end if;
  insert into public.pf_notas_v3(user_id,id,titulo,texto,cor,fixa,deleted,mutacao)
   values(dono,p_id,case when p_excluida then '' else p_titulo end,
          case when p_excluida then '' else p_texto end,p_cor,p_fixa,p_excluida,p_mutacao)
   returning * into atual;
 end if;
 return pg_catalog.jsonb_build_object('status','aplicada','nota',pg_catalog.to_jsonb(atual));
end;
$$;
revoke all on function public.pf_notas_gravar_v3(uuid,uuid,bigint,uuid,text,text,text,boolean,boolean) from public,anon;
grant execute on function public.pf_notas_gravar_v3(uuid,uuid,bigint,uuid,text,text,text,boolean,boolean) to authenticated;

-- Tombstones permanecem para evitar que um aparelho offline ressuscite exclusões.
-- Não há DELETE público nem limpeza automática de notas do servidor.
notify pgrst,'reload schema';
commit;
