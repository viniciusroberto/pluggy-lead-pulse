#!/usr/bin/env node

/**
 * Script para testar problemas em produção
 * Uso: node scripts/test-production.js [url]
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = 'https://pluggy-lead-dash.vercel.app';

async function testUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testProduction() {
  const url = process.argv[2] || DEFAULT_URL;
  console.log(`🔍 Testando produção: ${url}\n`);
  
  try {
    // 1. Testar página principal
    console.log('1. Testando página principal...');
    const mainPage = await testUrl(url);
    
    if (mainPage.statusCode === 200) {
      console.log('✅ Página principal carregou');
      
      // Verificar se é uma SPA (contém React)
      if (mainPage.body.includes('react') || mainPage.body.includes('React')) {
        console.log('✅ SPA detectada');
      } else {
        console.log('⚠️  SPA não detectada - pode ser problema de build');
      }
    } else {
      console.error(`❌ Página principal falhou: ${mainPage.statusCode}`);
      return false;
    }
    
    // 2. Testar rota de auth
    console.log('\n2. Testando rota de auth...');
    const authPage = await testUrl(`${url}/auth`);
    
    if (authPage.statusCode === 200) {
      console.log('✅ Rota de auth carregou');
    } else {
      console.error(`❌ Rota de auth falhou: ${authPage.statusCode}`);
      return false;
    }
    
    // 3. Testar rota de dashboard
    console.log('\n3. Testando rota de dashboard...');
    const dashboardPage = await testUrl(`${url}/dashboard`);
    
    if (dashboardPage.statusCode === 200) {
      console.log('✅ Rota de dashboard carregou');
    } else {
      console.error(`❌ Rota de dashboard falhou: ${dashboardPage.statusCode}`);
      return false;
    }
    
    // 4. Testar rota inexistente (deve retornar 200 para SPA)
    console.log('\n4. Testando rota inexistente...');
    const notFoundPage = await testUrl(`${url}/rota-inexistente`);
    
    if (notFoundPage.statusCode === 200) {
      console.log('✅ SPA routing funcionando');
    } else {
      console.error(`❌ SPA routing falhou: ${notFoundPage.statusCode}`);
      return false;
    }
    
    // 5. Testar headers de cache
    console.log('\n5. Verificando headers de cache...');
    const cacheHeaders = mainPage.headers['cache-control'];
    if (cacheHeaders) {
      console.log(`📊 Cache-Control: ${cacheHeaders}`);
    } else {
      console.log('⚠️  Cache-Control não definido');
    }
    
    console.log('\n🎉 Todos os testes de produção passaram!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao testar produção:', error.message);
    return false;
  }
}

async function main() {
  const isValid = await testProduction();
  
  if (isValid) {
    console.log('\n✅ Testes de produção concluídos com sucesso!');
    process.exit(0);
  } else {
    console.log('\n❌ Testes de produção falharam!');
    process.exit(1);
  }
}

main().catch(console.error);
