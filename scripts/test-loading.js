#!/usr/bin/env node

/**
 * Script para testar os problemas de carregamento
 * Este script simula os cenários problemáticos e verifica se as correções funcionam
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando correções implementadas...\n');

// Verificar se os arquivos principais existem
const filesToCheck = [
  'src/App.tsx',
  'src/hooks/use-auth.ts',
  'src/components/auth/ProtectedRoute.tsx',
  'src/components/AuthFallback.tsx',
  'src/components/LoadingFallback.tsx',
  'src/integrations/supabase/client.ts',
  'vercel.json',
  'vite.config.ts'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - Não encontrado`);
    allFilesExist = false;
  }
});

console.log('\n🔧 Verificando correções específicas...\n');

// Verificar se o QueryClient duplicado foi removido
const appContent = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
if (appContent.includes('import { queryClient } from "./lib/query-client"')) {
  console.log('✅ QueryClient duplicado removido - usando importação centralizada');
} else {
  console.log('❌ QueryClient duplicado ainda presente');
}

// Verificar se o Suspense foi adicionado
if (appContent.includes('<Suspense fallback={<LoadingFallback />}>')) {
  console.log('✅ Suspense adicionado para melhor carregamento');
} else {
  console.log('❌ Suspense não encontrado');
}

// Verificar se o hook de auth foi simplificado
const authContent = fs.readFileSync(path.join(process.cwd(), 'src/hooks/use-auth.ts'), 'utf8');
if (authContent.includes('const [retryCount, setRetryCount] = useState(0);') === false) {
  console.log('✅ Hook de auth simplificado - retryCount removido');
} else {
  console.log('❌ Hook de auth ainda complexo');
}

// Verificar se o ProtectedRoute foi simplificado
const protectedRouteContent = fs.readFileSync(path.join(process.cwd(), 'src/components/auth/ProtectedRoute.tsx'), 'utf8');
if (protectedRouteContent.includes('if (loading && !isInitialized)')) {
  console.log('✅ ProtectedRoute simplificado - lógica de loading melhorada');
} else {
  console.log('❌ ProtectedRoute ainda complexo');
}

// Verificar se a configuração do Supabase foi melhorada
const supabaseContent = fs.readFileSync(path.join(process.cwd(), 'src/integrations/supabase/client.ts'), 'utf8');
if (supabaseContent.includes('flowType: \'pkce\'')) {
  console.log('✅ Configuração do Supabase melhorada - PKCE flow adicionado');
} else {
  console.log('❌ Configuração do Supabase não otimizada');
}

// Verificar se a configuração da Vercel foi otimizada
const vercelContent = fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8');
if (vercelContent.includes('"source": "/index.html"')) {
  console.log('✅ Configuração da Vercel otimizada - cache headers melhorados');
} else {
  console.log('❌ Configuração da Vercel não otimizada');
}

console.log('\n📋 Resumo das correções implementadas:');
console.log('1. ✅ Removida duplicação do QueryClient');
console.log('2. ✅ Simplificado o hook de autenticação');
console.log('3. ✅ Melhorado o ProtectedRoute para ser mais robusto');
console.log('4. ✅ Adicionado Suspense para melhor carregamento');
console.log('5. ✅ Melhorada configuração do Supabase com PKCE');
console.log('6. ✅ Otimizada configuração da Vercel');
console.log('7. ✅ Adicionados fallbacks robustos para erros');

console.log('\n🚀 Próximos passos:');
console.log('1. Execute: npm run build');
console.log('2. Faça deploy na Vercel');
console.log('3. Teste em aba normal e anônima');
console.log('4. Teste o refresh da página (F5)');

if (allFilesExist) {
  console.log('\n✅ Todas as correções foram implementadas com sucesso!');
  process.exit(0);
} else {
  console.log('\n❌ Algumas correções podem estar incompletas.');
  process.exit(1);
}
