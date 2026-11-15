-- Etapa 30: diagnóstico somente leitura; não consulta conteúdo nem IDs de notas.
-- Executar no SQL Editor do MESMO projeto Supabase indicado em Detalhes da sincronização.
select
 pg_catalog.to_regclass('public.pf_notas_v3') is not null as tabela_notas_existe,
 pg_catalog.has_schema_privilege('authenticated','public','USAGE') as conta_acessa_schema,
 case when pg_catalog.to_regclass('public.pf_notas_v3') is null then null
      else pg_catalog.has_table_privilege('authenticated','public.pf_notas_v3','SELECT') end as conta_pode_ler_notas,
 (select relrowsecurity from pg_catalog.pg_class where oid=pg_catalog.to_regclass('public.pf_notas_v3')) as isolamento_rls_ativo,
 exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='pf_notas_v3' and policyname='pf_notas_v3_ler_proprias') as politica_notas_existe,
 pg_catalog.to_regprocedure('public.pf_notas_gravar_v3(uuid,uuid,bigint,uuid,text,text,text,boolean,boolean)') is not null as funcao_gravacao_existe,
 case when pg_catalog.to_regprocedure('public.pf_notas_gravar_v3(uuid,uuid,bigint,uuid,text,text,text,boolean,boolean)') is null then null
      else pg_catalog.has_function_privilege('authenticated','public.pf_notas_gravar_v3(uuid,uuid,bigint,uuid,text,text,text,boolean,boolean)','EXECUTE') end as conta_pode_chamar_gravacao;
