// Script para verificar se as variáveis de ambiente estão sendo carregadas
// Execute com: node env-check.js

console.log('=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===\n');

// Verificar variáveis do Supabase
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NÃO ENCONTRADA`);
    allVarsPresent = false;
  }
});

console.log('\n=== RESULTADO ===');
if (allVarsPresent) {
  console.log('✅ Todas as variáveis necessárias estão presentes!');
} else {
  console.log('❌ Algumas variáveis estão faltando. Verifique sua configuração.');
}

console.log('\n=== INSTRUÇÕES ===');
console.log('1. Certifique-se de que o arquivo .env.local existe na raiz do projeto');
console.log('2. Na Vercel, configure as variáveis em Settings > Environment Variables');
console.log('3. Após adicionar variáveis na Vercel, faça um redeploy completo');
console.log('4. Verifique se selecionou "Production" para todas as variáveis');