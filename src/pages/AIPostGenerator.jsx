import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import MistralApiKeySettings from "@/components/MistralApiKeySettings";
import { callMistralAI } from "@/services/mistralService";
import { Sparkles, Copy, Save, BookOpen, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export default function AIPostGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState("");
  const [sources, setSources] = useState([{ id: Date.now(), text: "" }]);
  const [generatedPost, setGeneratedPost] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Count lines in generated post
  const lineCount = generatedPost
    ? generatedPost.split("\n").filter((l) => l.trim() !== "").length
    : 0;

  const addSource = () => {
    setSources((prev) => [...prev, { id: Date.now(), text: "" }]);
  };

  const removeSource = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSource = (id, value) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, text: value } : s)));
  };

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    setGenerating(true);
    setGeneratedPost("");

    const sourcesText = sources
      .filter((s) => s.text.trim())
      .map((s, i) => `Fonte ${i + 1}:\n${s.text.trim()}`)
      .join("\n\n");

    const prompt = `Você é um especialista em comunicação científica e médica no LinkedIn. Sua tarefa é criar um post profissional e envolvente para LinkedIn voltado para MÉDICOS, ESTUDANTES DE MEDICINA e PROFESSORES da área da saúde.

ASSUNTO DO POST: ${subject}

${sourcesText ? `FONTES E REFERÊNCIAS (use estas informações como base do conteúdo):\n${sourcesText}\n` : ""}

REGRAS OBRIGATÓRIAS:
1. O post deve ter EXATAMENTE entre 30 e 40 linhas NÃO VAZIAS
2. Comece com um gancho forte (primeira linha impactante que prenda a atenção)
3. Use linguagem profissional mas acessível, sem jargões desnecessários
4. Inclua emojis médicos/científicos relevantes (🩺 🔬 💊 🧠 📊 etc.)
5. Estruture em parágrafos curtos (máximo 3 linhas cada) para facilitar leitura mobile
6. Inclua pelo menos 3 insights práticos ou dados relevantes sobre o assunto
7. Se houver fontes fornecidas, cite-as naturalmente no texto
8. Termine com uma chamada para ação engajante (pergunta ou reflexão)
9. Adicione de 5 a 8 hashtags relevantes na última linha
10. NÃO use bullet points com hífen — prefira ✅ ou 🔹 se quiser listar

FORMATO DE SAÍDA: Apenas o texto do post, pronto para copiar e colar no LinkedIn. Sem introduções ou explicações.`;

    try {
      const apiKey = localStorage.getItem("mistral_api_key");
      let result = "";

      if (apiKey) {
        // Usa a Mistral se a chave estiver configurada
        result = await callMistralAI(prompt);
      } else {
        // Fallback para o modelo local / mock (base44)
        toast({
          description: "Chave Mistral não encontrada. Usando modelo local de fallback.",
          variant: "default",
        });
        result = await base44.integrations.Core.InvokeLLM({
          prompt,
          model: "claude_sonnet_4_6",
        });
      }

      setGeneratedPost(result);
    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: error.message || "Ocorreu um erro ao gerar o post.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost).then(() => {
      setCopied(true);
      toast({ description: "Post copiado para a área de transferência!" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const posts = JSON.parse(localStorage.getItem("local_posts") || "[]");
      const newPost = { ...data, id: Date.now().toString(), created_date: new Date().toISOString() };
      posts.push(newPost);
      localStorage.setItem("local_posts", JSON.stringify(posts));
      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ description: "Post salvo nos seus rascunhos!" });
    },
  });

  const handleSave = () => {
    if (!generatedPost) return;
    const firstLine = generatedPost.split("\n").find((l) => l.trim()) || subject;
    saveMutation.mutate({
      title: firstLine.slice(0, 80).replace(/[#*_]/g, "").trim(),
      content: generatedPost,
      tags: "ia-gerado, medicina",
      status: "draft",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-outfit font-bold text-foreground">
            Gerador de Posts com IA
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-13">
          Crie posts médicos profissionais para LinkedIn em segundos, com base em um assunto e suas fontes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Input panel */}
        <div className="space-y-5">
          {/* Subject */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Assunto do Post
            </Label>
            <Textarea
              placeholder="Ex: Benefícios da inteligência artificial no diagnóstico precoce do câncer de mama..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="min-h-[100px] bg-background border-border focus:border-primary resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Mistral API Key Settings Panel */}
          <MistralApiKeySettings />

          {/* Sources */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Fontes / Relatórios NotebookLM
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSource}
                className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
              >
                <Plus className="w-3 h-3" />
                Adicionar
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cole aqui trechos de artigos, resumos do NotebookLM ou qualquer referência que deseja incluir no post.
            </p>
            <div className="space-y-3">
              <AnimatePresence>
                {sources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="relative group"
                  >
                    <Textarea
                      placeholder={`Fonte ${index + 1}: Cole aqui o trecho ou resumo...`}
                      value={source.text}
                      onChange={(e) => updateSource(source.id, e.target.value)}
                      className="min-h-[80px] bg-background border-border focus:border-primary resize-none text-xs leading-relaxed pr-10"
                    />
                    {sources.length > 1 && (
                      <button
                        onClick={() => removeSource(source.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-md bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!subject.trim() || generating}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2 text-sm rounded-xl"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando post médico...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Post com IA
              </>
            )}
          </Button>
        </div>

        {/* RIGHT — Output panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Post Gerado
              </Label>
              {generatedPost && (
                <Badge
                  className={`text-[10px] border-0 ${
                    lineCount >= 30 && lineCount <= 40
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {lineCount} linhas
                </Badge>
              )}
            </div>

            {generating && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">A IA está criando seu post médico...</p>
                <p className="text-xs opacity-60">Isso pode levar alguns segundos</p>
              </div>
            )}

            {!generating && !generatedPost && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary/40" />
                </div>
                <p className="text-sm text-center max-w-[200px]">
                  Preencha o assunto e clique em Gerar para criar seu post
                </p>
              </div>
            )}

            {!generating && generatedPost && (
              <div className="flex-1 min-h-[340px] overflow-y-auto prose prose-invert prose-sm max-w-none text-foreground
                prose-headings:text-primary prose-headings:font-outfit
                prose-strong:text-foreground
                prose-a:text-primary
                prose-p:leading-relaxed prose-p:my-2
                prose-li:my-0.5
                prose-ul:my-2 prose-ol:my-2
                prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
                prose-hr:border-border">
                <ReactMarkdown>{generatedPost}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {generatedPost && !generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Post
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Salvando..." : "Salvar Rascunho"}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}