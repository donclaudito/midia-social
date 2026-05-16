import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import SearchBar from "@/components/posts/SearchBar";
import PostFormDialog from "@/components/posts/PostFormDialog";

export default function AllPosts() {
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
      toast({ description: "Post criado!" });
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

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({ description: "Conteúdo copiado!" });
    });
  };

  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-outfit font-bold text-foreground">
            Todos os Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e gerencie todos os seus rascunhos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPost(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Post
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">
          Nenhum post encontrado.
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border overflow-hidden bg-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Título</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">
                  Tags
                </TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Data
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow
                  key={post.id}
                  className="border-border hover:bg-secondary/30"
                >
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {post.title}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {post.tags
                        ?.split(",")
                        .slice(0, 3)
                        .map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {t.trim()}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      className={
                        post.status === "ready"
                          ? "bg-green-500/15 text-green-400 border-0"
                          : "bg-secondary text-muted-foreground border-0"
                      }
                    >
                      {post.status === "ready" ? "Pronto" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                    {post.created_date
                      ? format(new Date(post.created_date), "dd/MM/yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleCopy(post.content)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingPost(post);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(post.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      <PostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editingPost}
        onSave={handleSave}
      />
    </div>
  );
}