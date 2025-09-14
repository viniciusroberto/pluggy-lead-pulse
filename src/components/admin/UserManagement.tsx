import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Edit, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Usuario {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export const UserManagement = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_dashboard')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios((data || []) as Usuario[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update role after creation
        const { error: updateError } = await supabase
          .from('usuarios_dashboard')
          .update({
            role: formData.role,
            is_active: formData.is_active,
          })
          .eq('user_id', authData.user.id);

        if (updateError) throw updateError;

        toast({
          title: "Usuário criado com sucesso!",
          description: `${formData.nome} foi adicionado ao sistema`,
        });

        setDialogOpen(false);
        resetForm();
        fetchUsuarios();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('usuarios_dashboard')
        .update({
          nome: formData.nome,
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado com sucesso!",
        description: `${formData.nome} foi atualizado`,
      });

      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      password: "",
      role: "user",
      is_active: true,
    });
  };

  const openEditDialog = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      password: "",
      role: user.role,
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    resetForm();
    setDialogOpen(true);
  };

  return (
    <Card className="glass-card border-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie usuários e suas permissões no sistema
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="button-premium">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-glass">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Atualize as informações do usuário"
                    : "Preencha os dados para criar um novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-white">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="glass-input"
                    placeholder="Nome completo"
                  />
                </div>
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="glass-input"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="glass-input"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white">Tipo de Usuário</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="text-white">Usuário ativo</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    className="button-premium flex-1"
                    disabled={loading}
                  >
                    {editingUser ? "Atualizar" : "Criar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="glass-button"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-glass hover:bg-white/5">
                <TableHead className="text-white">Nome</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Tipo</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Último Login</TableHead>
                <TableHead className="text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((user) => (
                <TableRow key={user.id} className="border-glass hover:bg-white/5">
                  <TableCell className="text-white">{user.nome}</TableCell>
                  <TableCell className="text-white">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-secondary/20 text-secondary border border-secondary/30'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-danger/20 text-danger border border-danger/30'
                      }`}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="glass-button h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};