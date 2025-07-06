
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Check, X, Clock, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

interface Wish {
  id: string;
  guest_id: string;
  guest_name: string;
  content: string;
  image_url?: string;
  likes_count: number;
  replies_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

const WishManagement = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const { toast } = useToast();

  // Fetch all wishes (approved and pending)
  const fetchWishes = async () => {
    try {
      console.log('Fetching all wishes for management...');
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishes:', error);
        throw error;
      }
      
      console.log('Fetched wishes:', data);
      setWishes(data || []);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      toast({
        title: "Error",
        description: "Failed to load wishes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Approve a wish
  const approveWish = async (wishId: string) => {
    try {
      console.log('Approving wish:', wishId);
      const { error } = await supabase
        .from('wishes')
        .update({ is_approved: true })
        .eq('id', wishId);

      if (error) {
        console.error('Error approving wish:', error);
        throw error;
      }

      setWishes(wishes.map(wish => 
        wish.id === wishId ? { ...wish, is_approved: true } : wish
      ));

      toast({
        title: "✨ Wish Approved!",
        description: "The wish is now visible to all guests.",
      });
    } catch (error) {
      console.error('Error approving wish:', error);
      toast({
        title: "Error",
        description: "Failed to approve wish",
        variant: "destructive",
      });
    }
  };

  // Reject/Delete a wish
  const rejectWish = async (wishId: string) => {
    try {
      console.log('Rejecting wish:', wishId);
      const { error } = await supabase
        .from('wishes')
        .delete()
        .eq('id', wishId);

      if (error) {
        console.error('Error rejecting wish:', error);
        throw error;
      }

      setWishes(wishes.filter(wish => wish.id !== wishId));

      toast({
        title: "Wish Removed",
        description: "The wish has been deleted.",
      });
    } catch (error) {
      console.error('Error rejecting wish:', error);
      toast({
        title: "Error",
        description: "Failed to remove wish",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscription for new wishes
  useEffect(() => {
    fetchWishes();

    const channel = supabase
      .channel('wish-management-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'wishes'
        },
        (payload) => {
          console.log('Real-time wish change:', payload);
          fetchWishes(); // Refresh the list when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter wishes based on search and status
  const filteredWishes = wishes.filter(wish => {
    const matchesSearch = wish.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wish.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && wish.is_approved) ||
                         (statusFilter === 'pending' && !wish.is_approved);
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = wishes.filter(wish => !wish.is_approved).length;
  const approvedCount = wishes.filter(wish => wish.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl text-wedding-maroon mb-1">
            <Heart size={20} className="inline-block mr-2 text-wedding-gold" />
            Wish Management
          </h2>
          <p className="text-gray-600 text-sm">Review and approve wedding wishes from your guests</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {approvedCount} Approved
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search wishes by content or guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-wedding-gold/30 focus:border-wedding-gold"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-full sm:w-48 border-wedding-gold/30">
            <Filter size={16} className="mr-2 text-wedding-gold" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wishes</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p>Debug: Total wishes: {wishes.length}</p>
          <p>Debug: Filtered wishes: {filteredWishes.length}</p>
          <p>Debug: Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Wishes List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner mb-4"></div>
          <p className="text-wedding-maroon font-dancing-script text-xl ml-3">Loading wishes...</p>
        </div>
      ) : filteredWishes.length === 0 ? (
        <Card className="border-wedding-gold/20">
          <CardContent className="text-center py-12">
            <Heart size={48} className="mx-auto text-wedding-gold/50 mb-4" />
            <h3 className="text-lg font-playfair text-wedding-maroon mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No wishes found' : 'No wishes yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more wishes.' 
                : 'Wedding wishes will appear here as guests submit them.'}
            </p>
            {wishes.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Tip: Guests can submit wishes from the main invitation page.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWishes.map((wish) => (
            <Card key={wish.id} className={`border-wedding-gold/30 transition-all duration-300 hover:shadow-lg ${
              !wish.is_approved ? 'bg-orange-50/50 border-orange-200' : 'bg-green-50/30 border-green-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wedding-gold/30 to-wedding-gold/20 flex items-center justify-center shadow-sm">
                          <span className="font-semibold text-wedding-maroon">
                            {wish.guest_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-wedding-maroon">{wish.guest_name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatDistanceToNow(new Date(wish.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant={wish.is_approved ? "default" : "secondary"} 
                             className={wish.is_approved 
                               ? "bg-green-100 text-green-700 border-green-200" 
                               : "bg-orange-100 text-orange-700 border-orange-200"}>
                        {wish.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed font-poppins italic mb-4">
                      "{wish.content}"
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        {wish.likes_count} likes
                      </span>
                      <span>{wish.replies_count} replies</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!wish.is_approved ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveWish(wish.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectWish(wish.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectWish(wish.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X size={14} className="mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishManagement;
