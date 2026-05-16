import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Sparkles, ImagePlus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PostFormDialog({ open, onOpenChange, post, onSave }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    status: "draft",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, image_url: file_url }));
    setUploadingImage(false);
  };

  const handleGenerateTitle = async () => {
    if (!form.content) return;
    setGeneratingTitle(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em LinkedIn. Com base no conteúdo abaixo, gere um título curto, impactante e atrativo (máximo 10 palavras) para o post. Responda APENAS com o título, sem aspas ou explicações.\n\nConteúdo:\n${form.content}`,
    });
    setForm((prev) => ({ ...prev, title: result }));
    setGeneratingTitle(false);
  };

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        content: post.content || "",
        tags: post.tags || "",
        status: post.status || "draft",
        image_url: post.image_url || "",
      });
    } else {
      setForm({ title: "", content: "", tags: "", status: "draft", image_url: "" });
    }
  }, [post, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    await onSave(form, post?.id);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent rounded-t-lg" />
        <DialogHeader>
          <DialogTitle className="font-outfit text-xl">
            {post ? "Editar Post" : "Novo Post"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
                Título
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!form.content || generatingTitle}
                onClick={handleGenerateTitle}
                className="h-6 px-2 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 disabled:opacity-30"
              >
                <Sparkles className="w-3 h-3" />
                {generatingTitle ? "Gerando..." : "Gerar com IA"}
              </Button>
            </div>
            <Input
              id="title"
              placeholder="Título do post..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-xs uppercase tracking-wider text-muted-foreground">
              Conteúdo
            </Label>
            <Textarea
              id="content"
              placeholder="Escreva o conteúdo do post para LinkedIn..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[200px] bg-background border-border focus:border-primary resize-y leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-muted-foreground">
                Tags
              </Label>
              <Input
                id="tags"
                placeholder="tech, coding, linkedin"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="bg-background border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="ready">Pronto para Postar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Imagem do Post
            </Label>
            {form.image_url ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {uploadingImage ? (
                  <span className="text-xs text-muted-foreground">Enviando...</span>
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Clique para adicionar imagem</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.title || !form.content}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}