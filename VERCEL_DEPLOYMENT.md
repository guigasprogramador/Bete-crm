# Guia de Deploy na Vercel - CRM WhatsApp Manager

## Problema: Tela Branca em Produção

Se você está vendo uma tela branca na Vercel com o erro "Missing Supabase environment variables", siga este guia:

## Solução: Configurar Variáveis de Ambiente na Vercel

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
- Aguarde o processo finalizar

## Verificação

Após o redeploy:
1. Acesse sua aplicação: https://bete-crm.vercel.app/
2. Abra o F12 (Developer Tools)
3. Verifique se não há mais erros de "Missing Supabase environment variables"

## Problemas Comuns

### Erro persiste após configurar variáveis
- Certifique-se de que fez o **redeploy** após adicionar as variáveis
- Verifique se todas as variáveis foram adicionadas corretamente
- Confirme que selecionou "Production" para todas as variáveis

### Variáveis não aparecem
- Limpe o cache do navegador
- Aguarde alguns minutos para propagação
- Verifique se não há espaços extras nos nomes/valores das variáveis

## Suporte

Se o problema persistir:
1. Verifique os logs na aba "Functions" da Vercel
2. Confirme se o Supabase está funcionando corretamente
3. Teste localmente com `npm run build && npm run preview`

---

**Importante**: Nunca commite arquivos `.env.local` para o repositório. Use apenas o `.env.example` como referência.