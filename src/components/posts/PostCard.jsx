import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Pencil, Trash2, Eye, Share2, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import LinkedInPreviewModal from "@/components/posts/LinkedInPreviewModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({ post, onEdit, onDelete, index }) {
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content).then(() => {
      toast({ description: "Conteúdo copiado!" });
    });
  };

  const handleShareText = () => {
    navigator.clipboard.writeText(post.content).then(() => {
      toast({ description: "Texto copiado para compartilhar!" });
    });
  };

  const handleShareImage = () => {
    if (post.image_url) {
      window.open(post.image_url, "_blank");
    }
  };

  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      {post.image_url ? (
        <div className="w-full h-36 rounded-xl overflow-hidden -mb-1">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary"
          >
            {tag}
          </span>
        ))}
        {post.status === "ready" && (
          <Badge className="bg-green-500/15 text-green-400 border-0 text-[10px]">
            Pronto
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-outfit font-bold text-foreground leading-snug">
        {post.title}
      </h3>

      {/* Content preview */}
      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed flex-1">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground">
          {post.created_date
            ? format(new Date(post.created_date), "dd/MM/yyyy")
            : "—"}
        </span>
        <div className="flex gap-1">
          {/* Botão de preview LinkedIn */}
          <Button
            variant="ghost"
            size="icon"
            title="Visualizar no LinkedIn"
            className="w-8 h-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Compartilhar"
                className="w-8 h-8 text-muted-foreground hover:text-green-400 hover:bg-green-400/10 rounded-lg"
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareText}>
                <FileText className="w-4 h-4 mr-2" />
                Copiar texto
              </DropdownMenuItem>
              {post.image_url && (
                <DropdownMenuItem onClick={handleShareImage}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Abrir imagem
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
            onClick={() => onEdit(post)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            onClick={() => onDelete(post)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Modal de prévia LinkedIn */}
      <LinkedInPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={post}
      />
    </motion.div>
  );
}