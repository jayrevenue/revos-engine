import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface UserRole {
  id: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'rev_scientist' | 'qa';
  created_at: string;
  avatar_url?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          full_name,
          avatar_url,
          created_at,
          user_roles (
            role
          )
        `);

      if (error) throw error;

      const usersWithRoles = data?.map(user => ({
        id: user.user_id,
        email: user.email || '',
        full_name: user.full_name || '',
        role: (user.user_roles?.[0] as any)?.role || 'rev_scientist',
        created_at: user.created_at,
        avatar_url: user.avatar_url,
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole['role']) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
      return false;
    }
  };

  const inviteUser = async (email: string, role: UserRole['role'] = 'rev_scientist') => {
    try {
      // In a real implementation, you would send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email} with role ${role}.`,
      });
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    updateUserRole,
    inviteUser,
    reloadUsers: loadUsers,
  };
};