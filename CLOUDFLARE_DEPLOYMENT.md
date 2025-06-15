# Guia de Deploy no Cloudflare Pages - CRM WhatsApp Manager

## Problema: Tela Branca no Cloudflare Pages

Se você está vendo uma tela branca no Cloudflare Pages com o erro "Missing Supabase environment variables", siga este guia:

## Configuração no Cloudflare Pages

### 1. Acesse o Painel do Cloudflare
- Vá para [dash.cloudflare.com](https://dash.cloudflare.com)
- Faça login na sua conta
- Clique em "Pages" no menu lateral
- Selecione seu projeto

### 2. Configure as Variáveis de Ambiente
- Clique em **Settings** no projeto
- Vá para **Environment variables**
- Clique em **Add variable**
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
- **Variable name**: Nome da variável (ex: `VITE_SUPABASE_URL`)
- **Value**: Valor da variável
- **Environment**: Selecione `Production` e `Preview`

### 4. Configurações de Build
Verifique se as configurações de build estão corretas:
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (raiz do projeto)

### 5. Redeploy da Aplicação
Após adicionar todas as variáveis:
- Vá para a aba **Deployments**
- Clique em **Retry deployment** no último deployment
- Ou faça um novo commit no repositório para trigger um novo build

## Verificação

Após o redeploy:
1. Aguarde o build completar (pode levar alguns minutos)
2. Acesse sua aplicação
3. Abra o F12 (Developer Tools) > Console
4. Procure pelos logs de debug que adicionamos:
   - "Environment check:" - mostra quais variáveis estão presentes
   - Se houver erro, verá detalhes específicos sobre quais variáveis estão faltando

## Problemas Específicos do Cloudflare Pages

### ❌ Variáveis não carregam no build
**Causa**: Cloudflare Pages pode ter cache agressivo
**Solução**:
1. Limpe o cache do projeto:
   - Settings > General > Purge cache
2. Force um novo deployment:
   - Faça um commit vazio: `git commit --allow-empty -m "Force redeploy"`
   - Push para o repositório

### ❌ Build falha com erro de variáveis
**Causa**: Variáveis não estão disponíveis durante o build
**Solução**:
1. Verifique se as variáveis estão configuradas para "Production"
2. Confirme que todas começam com `VITE_`
3. Teste localmente:
   ```bash
   npm run build
   npm run preview
   ```

### ❌ Erro "process is not defined"
**Causa**: Configuração incorreta do Vite
**Solução**: O `vite.config.ts` já foi atualizado para resolver isso

## Diferenças entre Cloudflare Pages e Vercel

| Aspecto | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| Variáveis de Ambiente | Settings > Environment variables | Settings > Environment Variables |
| Cache | Mais agressivo | Menos agressivo |
| Build Time | Pode ser mais lento | Geralmente mais rápido |
| Propagação | Pode levar mais tempo | Mais rápido |

## Debug Avançado

Se o problema persistir, os logs de debug no console mostrarão:

```javascript
// Exemplo de log quando funcionando:
Environment check: {
  VITE_SUPABASE_URL: 'PRESENTE',
  VITE_SUPABASE_ANON_KEY: 'PRESENTE',
  allEnvVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', ...]
}

// Exemplo de log quando com problema:
Environment check: {
  VITE_SUPABASE_URL: 'AUSENTE',
  VITE_SUPABASE_ANON_KEY: 'AUSENTE',
  allEnvVars: []
}
```

## Teste Local

Antes de fazer deploy, teste localmente:

```bash
# 1. Instale dependências
npm install

# 2. Verifique variáveis locais
node env-check.js

# 3. Build para produção
npm run build

# 4. Preview do build
npm run preview
```

## Suporte

Se ainda houver problemas:
1. Verifique os logs de build no Cloudflare Pages
2. Compare com os logs de debug no console
3. Teste em diferentes navegadores
4. Verifique se o Supabase está funcionando corretamente

---

**Importante**: Os logs de debug foram adicionados temporariamente. Remova-os após resolver o problema para não expor informações em produção.