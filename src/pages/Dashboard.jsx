import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import StatCard from "@/components/dashboard/StatCard";
import SearchBar from "@/components/posts/SearchBar";
import PostCard from "@/components/posts/PostCard";
import PostFormDialog from "@/components/posts/PostFormDialog";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ description: "Post criado com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ description: "Post atualizado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ description: "Post excluído." });
    },
  });

  const handleSave = async (formData, existingId) => {
    if (existingId) {
      await updateMutation.mutateAsync({ id: existingId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setDialogOpen(true);
  };

  const handleDelete = (post) => {
    deleteMutation.mutate(post.id);
  };

  const handleNew = () => {
    setEditingPost(null);
    setDialogOpen(true);
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(posts, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "backup_posts_linkedin.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast({ description: "Backup exportado!" });
  };

  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPosts = posts.length;
  const readyPosts = posts.filter((p) => p.status === "ready").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Post Architect
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seus rascunhos para LinkedIn
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-border text-muted-foreground hover:text-foreground gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            onClick={handleNew}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2 shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Novo Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total de Posts"
          value={totalPosts}
          icon={FileText}
          glowColor="hsl(183 100% 50%)"
        />
        <StatCard
          label="Prontos para Postar"
          value={readyPosts}
          icon={CheckCircle2}
          glowColor="hsl(268 100% 50%)"
        />
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Posts Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search
              ? "Nenhum post encontrado."
              : "Nenhum post ainda. Comece criando um!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialog */}
      <PostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editingPost}
        onSave={handleSave}
      />
    </div>
  );
}