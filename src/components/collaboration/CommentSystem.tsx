import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Heart, 
  Pin, 
  MoreVertical,
  Edit,
  Trash,
  AtSign,
  Paperclip,
  Smile
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  entity_type: 'engagement' | 'outcome' | 'agent' | 'project';
  entity_id: string;
  parent_id?: string;
  mentions: string[];
  attachments?: string[];
  reactions: { [emoji: string]: string[] };
  is_pinned: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

interface CommentSystemProps {
  entityType: 'engagement' | 'outcome' | 'agent' | 'project';
  entityId: string;
  title?: string;
  allowReplies?: boolean;
  maxHeight?: string;
}

export const CommentSystem = ({ 
  entityType, 
  entityId, 
  title = "Comments",
  allowReplies = true,
  maxHeight = "400px"
}: CommentSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchComments();
    fetchTeamMembers();
    setupRealtimeSubscription();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      // Comments functionality not implemented yet - return empty array
      setComments([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Fetch real team members from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .limit(10);

      if (error) throw error;

      const members = (data || []).map(profile => ({
        id: profile.user_id,
        name: profile.full_name || profile.email || 'Unknown User',
        email: profile.email || 'No email'
      }));

      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`comments-${entityType}-${entityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `entity_id=eq.${entityId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      // Comment system not fully implemented yet
      toast({
        title: "Feature Coming Soon",
        description: "Comment system will be available in a future update",
        variant: "default"
      });

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[2]);
    }

    return mentions;
  };

  const handleMention = (member: { id: string; name: string }) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    // Find the @ symbol that triggered the mention
    const beforeCursor = currentValue.slice(0, start);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return;

    const newValue = 
      currentValue.slice(0, atIndex) + 
      `@[${member.name}](${member.id}) ` + 
      currentValue.slice(end);

    setNewComment(newValue);
    setShowMentions(false);
    setMentionQuery('');

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = atIndex + `@[${member.name}](${member.id}) `.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleTextareaChange = (value: string) => {
    setNewComment(value);

    // Check for mention trigger
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const beforeCursor = value.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@([^@\s]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId) || 
                    comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
      
      if (!comment) return;

      const reactions = { ...comment.reactions };
      if (!reactions[emoji]) reactions[emoji] = [];
      
      if (reactions[emoji].includes(user.id)) {
        reactions[emoji] = reactions[emoji].filter(id => id !== user.id);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        reactions[emoji].push(user.id);
      }

      // Mock reaction update
      fetchComments();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const togglePin = async (commentId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      // Mock pin toggle
      fetchComments();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8' : ''} space-y-3`}>
      <div className={`flex gap-3 p-3 rounded-lg ${comment.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted/30'}`}>
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={comment.user_avatar} />
          <AvatarFallback>
            {comment.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.user_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.is_pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => togglePin(comment.id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {comment.is_pinned ? 'Unpin' : 'Pin'}
                  </Button>
                  {allowReplies && !isReply && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setReplyingTo(comment.id)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  )}
                  {comment.user_id === user?.id && (
                    <>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="text-sm">{comment.content}</div>
          
          {Object.keys(comment.reactions).length > 0 && (
            <div className="flex gap-1 mt-2">
              {Object.entries(comment.reactions).map(([emoji, userIds]) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => addReaction(comment.id, emoji)}
                >
                  {emoji} {userIds.length}
                </Button>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => addReaction(comment.id, '👍')}>
              <Heart className="h-3 w-3 mr-1" />
              Like
            </Button>
            {allowReplies && !isReply && (
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)}>
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
      
      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-8 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-20"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleSubmitComment(replyContent, comment.id)} disabled={submitting}>
              <Send className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
          <Badge variant="secondary">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <div className="relative space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... Use @ to mention team members"
            value={newComment}
            onChange={(e) => handleTextareaChange(e.target.value)}
            className="min-h-20"
          />
          
          {/* Mention Suggestions */}
          {showMentions && filteredMembers.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 max-h-48 overflow-y-auto">
              <CardContent className="p-2">
                {filteredMembers.slice(0, 5).map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => handleMention(member)}
                  >
                    <AtSign className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => handleSubmitComment(newComment)} disabled={submitting || !newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
        
        {/* Comments List */}
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Start the conversation by adding the first comment</p>
              </div>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};