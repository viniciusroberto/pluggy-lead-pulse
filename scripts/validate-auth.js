#!/usr/bin/env node

/**
 * Script para validar problemas de autenticação
 * Uso: node scripts/validate-auth.js [local|vercel]
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://qgihoqydtgtsulijrmeg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaWhvcXlkdGd0c3VsaWpybWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njc3MTYsImV4cCI6MjA2OTI0MzcxNn0.2nMRoyjA6b8TeJTVuqkdfI2G6LLWZ9sxTVA9ChaTcb4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function validateAuth() {
  console.log('🔍 Validando autenticação...\n');
  
  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão com Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    console.log(`📊 Sessão: ${session ? 'Ativa' : 'Inativa'}`);
    
    // 2. Testar acesso à tabela users
    console.log('\n2. Testando acesso à tabela users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError.message);
      return false;
    }
    
    console.log('✅ Tabela users acessível');
    console.log(`📊 Usuários encontrados: ${users?.length || 0}`);
    
    // 3. Testar timeout de autenticação
    console.log('\n3. Testando timeout de autenticação...');
    const startTime = Date.now();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    const authPromise = supabase.auth.getSession();
    
    try {
      await Promise.race([authPromise, timeoutPromise]);
      const endTime = Date.now();
      console.log(`✅ Autenticação respondida em ${endTime - startTime}ms`);
    } catch (error) {
      console.error('❌ Timeout na autenticação:', error.message);
      return false;
    }
    
    // 4. Testar carregamento de perfil
    if (session?.user) {
      console.log('\n4. Testando carregamento de perfil...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar perfil:', profileError.message);
        return false;
      }
      
      console.log('✅ Carregamento de perfil OK');
      console.log(`📊 Perfil: ${profile ? 'Encontrado' : 'Não encontrado'}`);
    }
    
    console.log('\n🎉 Todos os testes passaram!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

async function main() {
  const environment = process.argv[2] || 'local';
  console.log(`🚀 Validando autenticação para ambiente: ${environment}\n`);
  
  const isValid = await validateAuth();
  
  if (isValid) {
    console.log('\n✅ Validação concluída com sucesso!');
    process.exit(0);
  } else {
    console.log('\n❌ Validação falhou!');
    process.exit(1);
  }
}

main().catch(console.error);
