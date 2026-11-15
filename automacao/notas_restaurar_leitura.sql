-- Etapa 30 — restaurar a leitura das notas para contas autenticadas.
-- Executar somente no SQL Editor do projeto oflbclvieeknffjtndxo.
-- Não lê conteúdo, não modifica notas e não altera tabelas financeiras.
begin;

do $$
begin
 if pg_catalog.to_regclass('public.pf_notas_v3') is null then
  raise exception 'Tabela de notas não encontrada. Confirme o projeto antes de prosseguir.';
 end if;
 if not (select relrowsecurity from pg_catalog.pg_class
         where oid=pg_catalog.to_regclass('public.pf_notas_v3')) then
  raise exception 'Isolamento RLS das notas desativado. Nenhuma permissão foi alterada.';
 end if;
 if not exists(select 1 from pg_catalog.pg_policies
               where schemaname='public' and tablename='pf_notas_v3'
               and policyname='pf_notas_v3_ler_proprias' and cmd='SELECT') then
  raise exception 'Política de leitura das próprias notas não encontrada. Nenhuma permissão foi alterada.';
 end if;
 if not pg_catalog.has_schema_privilege('authenticated','public','USAGE') then
  raise exception 'A conta não possui USAGE no schema public. Nenhuma permissão foi alterada; envie esta mensagem para conferência.';
 end if;
end;
$$;

grant select on table public.pf_notas_v3 to authenticated;

select
 pg_catalog.has_table_privilege('authenticated','public.pf_notas_v3','SELECT') as leitura_autorizada,
 (select relrowsecurity from pg_catalog.pg_class
  where oid=pg_catalog.to_regclass('public.pf_notas_v3')) as isolamento_rls_ativo;
commit;
