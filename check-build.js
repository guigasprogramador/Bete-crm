// Script para verificar se as variáveis de ambiente estão no build
const fs = require('fs');
const path = require('path');

function checkBuildForEnvVars() {
  console.log('🔍 Verificando variáveis de ambiente no build...');
  
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Pasta dist não encontrada. Execute: npm run build');
    return;
  }
  
  // Procurar por arquivos JS no build
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.error('❌ Nenhum arquivo JS encontrado no build');
    return;
  }
  
  console.log(`📁 Arquivos JS encontrados: ${jsFiles.join(', ')}`);
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];
  
  let foundVars = {};
  let hasErrors = false;
  
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file);
    if (!fs.existsSync(filePath)) {
      // Tentar na raiz do dist
      const rootFilePath = path.join(distPath, file);
      if (fs.existsSync(rootFilePath)) {
        checkFileContent(rootFilePath, file, requiredVars, foundVars);
      }
    } else {
      checkFileContent(filePath, file, requiredVars, foundVars);
    }
  });
  
  // Verificar arquivos na pasta assets
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath).filter(file => file.endsWith('.js'));
    assetFiles.forEach(file => {
      const filePath = path.join(assetsPath, file);
      checkFileContent(filePath, file, requiredVars, foundVars);
    });
  }
  
  console.log('\n📊 Resultado da verificação:');
  requiredVars.forEach(varName => {
    if (foundVars[varName]) {
      console.log(`✅ ${varName}: ENCONTRADA`);
    } else {
      console.log(`❌ ${varName}: NÃO ENCONTRADA`);
      hasErrors = true;
    }
  });
  
  if (hasErrors) {
    console.log('\n🚨 PROBLEMA IDENTIFICADO:');
    console.log('Algumas variáveis não foram encontradas no build.');
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verifique se as variáveis estão no .env.local');
    console.log('2. Verifique a configuração do vite.config.ts');
    console.log('3. Execute: npm run build novamente');
    console.log('4. Para produção, configure as variáveis no Cloudflare/Vercel');
  } else {
    console.log('\n✅ SUCESSO: Todas as variáveis foram encontradas no build!');
  }
}

function checkFileContent(filePath, fileName, requiredVars, foundVars) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    requiredVars.forEach(varName => {
      // Procurar por diferentes padrões
      const patterns = [
        new RegExp(`"${varName}"\s*:\s*"[^"]+"`, 'g'),
        new RegExp(`'${varName}'\s*:\s*'[^']+'`, 'g'),
        new RegExp(`${varName}\s*=\s*"[^"]+"`, 'g'),
        new RegExp(`${varName}\s*=\s*'[^']+'`, 'g'),
        new RegExp(`https://[a-zA-Z0-9.-]+\.supabase\.co`, 'g'), // URL do Supabase
        new RegExp(`eyJ[a-zA-Z0-9._-]+`, 'g') // JWT token pattern
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          foundVars[varName] = true;
        }
      });
    });
    
    // Verificar especificamente por valores do Supabase
    if (content.includes('katsiwvrfolsnkwwnnkx.supabase.co')) {
      foundVars['VITE_SUPABASE_URL'] = true;
    }
    
    if (content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
      foundVars['VITE_SUPABASE_ANON_KEY'] = true;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${fileName}:`, error.message);
  }
}

// Executar verificação
checkBuildForEnvVars();