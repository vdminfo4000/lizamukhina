import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AssetCommentsDialogProps {
  assetType: "plot" | "equipment" | "facility";
  assetId: string;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Comment {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export function AssetCommentsDialog({
  assetType,
  assetId,
  companyId,
  open,
  onOpenChange,
}: AssetCommentsDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, assetId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("asset_comments")
      .select("*")
      .eq("asset_type", assetType)
      .eq("asset_id", assetId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const userName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Пользователь"
      : "Пользователь";

    const { error } = await supabase.from("asset_comments").insert({
      company_id: companyId,
      asset_type: assetType,
      asset_id: assetId,
      user_id: user.id,
      user_name: userName,
      message: newMessage,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сообщение",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Сообщение добавлено",
      });
      setNewMessage("");
      loadComments();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Сообщения от сотрудников</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Нет сообщений</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
          <Textarea
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !newMessage.trim()}>
              {loading ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}