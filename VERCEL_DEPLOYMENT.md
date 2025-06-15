# Guia de Deploy na Vercel - CRM WhatsApp Manager

## Problema: Tela Branca em Produção

Se você está vendo uma tela branca na Vercel com o erro "Missing Supabase environment variables", este é um problema comum que pode ter várias causas. Siga este guia completo:

## Principais Causas do Problema

1. **Variáveis de ambiente não configuradas na Vercel**
2. **Configuração incorreta do Vite para produção**
3. **Falta de redeploy após adicionar variáveis**
4. **Variáveis não aplicadas ao ambiente correto**

## Solução Completa: Passo a Passo

### 1. Acesse o Painel da Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login na sua conta
- Selecione seu projeto (bete-crm)

### 2. Configure as Variáveis de Ambiente
- Clique em **Settings** no menu do projeto
- Clique em **Environment Variables** no menu lateral
- Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://katsiwvrfolsnkwwnnkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdHNpd3ZyZm9sc25rd3dubmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDQyMzQsImV4cCI6MjA2NTQyMDIzNH0.blmo4dk4c7JrXjmPLHPk_bzV6ad_eeFiyCvr4lw4CAc
VITE_APP_NAME=CRM WhatsApp Manager
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

### 3. Configuração por Ambiente
Para cada variável:
- **Name**: Nome da variável (ex: `VITE_SUPABASE_URL`)
- **Value**: Valor da variável
- **Environment**: Selecione `Production`, `Preview` e `Development`

### 4. Redeploy da Aplicação
Após adicionar todas as variáveis:
- Vá para a aba **Deployments**
- Clique nos três pontos (...) no último deployment
- Selecione **Redeploy**
- ⚠️ **IMPORTANTE**: Aguarde o processo finalizar completamente (pode levar alguns minutos)

### 5. Verificação das Variáveis
Antes de testar, verifique se as variáveis foram aplicadas:
- Vá em **Settings** > **Environment Variables**
- Confirme que todas as 6 variáveis estão listadas
- Verifique se cada uma tem "Production" selecionado
- Se alguma estiver faltando, adicione e refaça o redeploy

## Verificação Final

Após o redeploy:
1. **Aguarde 2-3 minutos** para propagação completa
2. Acesse sua aplicação: https://bete-crm.vercel.app/
3. Abra o F12 (Developer Tools) > Console
4. Verifique se não há mais erros de "Missing Supabase environment variables"
5. Se a tela ainda estiver branca, force refresh (Ctrl+F5)

## Teste Local das Variáveis

Para verificar se as variáveis estão corretas localmente:
```bash
node env-check.js
```

Este script verificará se todas as variáveis necessárias estão presentes.

## Problemas Comuns e Soluções

### ❌ Erro persiste após configurar variáveis
**Possíveis causas:**
- Não fez redeploy após adicionar variáveis
- Variáveis não foram aplicadas ao ambiente "Production"
- Cache do navegador ou CDN da Vercel

**Soluções:**
1. Faça um **redeploy completo** (não apenas restart)
2. Verifique se TODAS as variáveis têm "Production" selecionado
3. Aguarde 5-10 minutos para propagação completa
4. Force refresh no navegador (Ctrl+Shift+R)
5. Teste em modo incógnito

### ❌ Variáveis não aparecem no console
**Possíveis causas:**
- Configuração incorreta do Vite
- Variáveis sem prefixo VITE_
- Problema na build

**Soluções:**
1. Confirme que todas as variáveis começam com `VITE_`
2. Verifique se não há espaços extras nos nomes/valores
3. Teste localmente com `npm run build && npm run preview`
4. Verifique os logs de build na Vercel

### ❌ Tela branca persiste
**Soluções avançadas:**
1. **Verifique os logs da Vercel:**
   - Vá em Deployments > clique no deployment > View Function Logs
   - Procure por erros específicos

2. **Teste a configuração do Vite:**
   - O arquivo `vite.config.ts` foi atualizado com `loadEnv`
   - Confirme que `envPrefix: 'VITE_'` está presente

3. **Recrie o deployment:**
   - Delete o projeto na Vercel
   - Reimporte do GitHub
   - Configure as variáveis novamente

### ❌ Erro "process is not defined"
Este erro foi corrigido na configuração do Vite, mas se persistir:
1. Confirme que o `vite.config.ts` está atualizado
2. Verifique se não há referências diretas a `process.env` no código
3. Use apenas `import.meta.env.VITE_*` no código frontend

## Suporte

Se o problema persistir:
1. Verifique os logs na aba "Functions" da Vercel
2. Confirme se o Supabase está funcionando corretamente
3. Teste localmente com `npm run build && npm run preview`

---

**Importante**: Nunca commite arquivos `.env.local` para o repositório. Use apenas o `.env.example` como referência.