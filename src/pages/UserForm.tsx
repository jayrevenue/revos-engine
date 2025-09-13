import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface UserData {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  role: string | null;
  role_id: string | null;
}

const UserForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'analyst' as 'admin' | 'scientist' | 'analyst'
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkUserRole();
      if (id) {
        fetchUser();
      }
    }
  }, [user, id]);

  const checkUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data.role);
    } catch (error: any) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchUser = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch role data
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', id)
        .single();

      const userData: UserData = {
        ...profile,
        role: roleData?.role || null,
        role_id: roleData?.id || null
      };
      
      setTargetUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        role: (userData.role as 'admin' | 'scientist' | 'analyst') || 'analyst'
      });
    } catch (error: any) {
      toast({
        title: "Error fetching user",
        description: error.message,
        variant: "destructive",
      });
      navigate('/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq('user_id', targetUser.user_id);

      if (profileError) throw profileError;

      // Update role if changed
      if (targetUser.role !== formData.role) {
        // Delete existing role if it exists
        if (targetUser.role_id) {
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('id', targetUser.role_id);

          if (deleteError) throw deleteError;
        }

        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: targetUser.user_id,
            role: formData.role
          });

        if (roleError) throw roleError;
      }

      toast({
        title: "User updated successfully",
        description: "The user's information has been updated.",
      });
      
      navigate('/users');
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/users')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Access Denied</h1>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">You don't have permission to edit users. Admin role required.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/users')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit User</h1>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'scientist' | 'analyst') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="scientist">Scientist</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserForm;