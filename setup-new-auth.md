# 🔐 Configuração do Novo Sistema de Autenticação

## 📋 Passos para Implementar

### 1. **Executar a Migração no Supabase**
```sql
-- Execute o arquivo: supabase/migrations/20250115000000_recreate_auth_system.sql
-- No SQL Editor do Supabase Dashboard
```

### 2. **Criar Usuário Admin**
```sql
-- Execute o arquivo: create-admin-user.sql
-- No SQL Editor do Supabase Dashboard
```

### 3. **Regenerar Tipos TypeScript**
```bash
# No terminal do projeto
npx supabase gen types typescript --project-id qgihoqydtgtsulijrmeg > src/integrations/supabase/types.ts
```

### 4. **Testar o Sistema**
- Fazer login com: `admin@pluggy.com` / `admin1234`
- Verificar se não há mais erros de "Perfil não encontrado"

## 🗂️ Arquivos Modificados

### ✅ **Novos Arquivos:**
- `supabase/migrations/20250115000000_recreate_auth_system.sql` - Nova migração
- `create-admin-user.sql` - Script para criar admin
- `setup-new-auth.md` - Este guia

### ✅ **Arquivos Atualizados:**
- `src/hooks/use-auth.ts` - Hook simplificado
- `src/components/auth/ProtectedRoute.tsx` - Rota protegida melhorada
- `src/integrations/supabase/types.ts` - Tipos atualizados

## 🔧 **Principais Mudanças**

### **Tabela Simplificada:**
- ❌ `usuarios_dashboard` (antiga)
- ✅ `users` (nova, mais simples)

### **Campos Simplificados:**
- ❌ `nome` → ✅ `name`
- ❌ `last_login_at` (removido)
- ✅ Mantidos: `email`, `role`, `is_active`

### **Segurança Mantida:**
- ✅ RLS (Row Level Security)
- ✅ Políticas de acesso
- ✅ Triggers automáticos
- ✅ Validações de role

## 🚨 **Importante**

1. **Backup:** Faça backup dos dados antes de executar a migração
2. **Ordem:** Execute os scripts na ordem correta
3. **Teste:** Teste completamente antes de usar em produção
4. **Usuários:** Todos os usuários existentes precisarão ser recriados

## 🔍 **Verificações Pós-Implementação**

- [ ] Migração executada sem erros
- [ ] Usuário admin criado
- [ ] Tipos TypeScript regenerados
- [ ] Login funcionando
- [ ] Proteção de rotas funcionando
- [ ] Sem erros no console
