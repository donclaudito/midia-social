import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simula o visual de um post no feed do LinkedIn
export default function LinkedInPreviewModal({ open, onOpenChange, post }) {
  const [liked, setLiked] = useState(false);

  if (!post) return null;

  // Formata o conteúdo: quebras de linha viram <br> e hashtags ficam em azul
  const formatContent = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/(\s+)/).map((word, j) =>
          word.startsWith("#") ? (
            <span key={j} className="text-[#0a66c2] font-medium hover:underline cursor-pointer">
              {word}
            </span>
          ) : (
            word
          )
        )}
        <br />
      </span>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 bg-[#1b1f23] border-[#38434f] overflow-hidden rounded-2xl">
        {/* Barra superior do modal */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#38434f]">
          <span className="text-sm text-[#b0b7bf] font-medium">Prévia — LinkedIn Post</span>
          <button
            onClick={() => onOpenChange(false)}
            className="text-[#b0b7bf] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feed container simulando o LinkedIn */}
        <div className="bg-[#1d2226] min-h-[300px] p-4 overflow-y-auto max-h-[80vh]">
          {/* Card do post */}
          <div className="bg-[#1b1f23] border border-[#38434f] rounded-lg overflow-hidden max-w-[560px] mx-auto shadow-lg">

            {/* Cabeçalho do autor */}
            <div className="flex items-start justify-between px-4 pt-4 pb-2">
              <div className="flex items-start gap-3">
                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  M
                </div>
                <div>
                  <p className="text-[#e7e9ea] font-semibold text-sm leading-tight hover:underline cursor-pointer">
                    Médico LinkedIn
                  </p>
                  <p className="text-[#b0b7bf] text-xs leading-tight mt-0.5">
                    Especialista em Medicina • LinkedIn
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#b0b7bf] text-[11px]">agora</span>
                    <span className="text-[#b0b7bf] text-[11px]">•</span>
                    <Globe className="w-3 h-3 text-[#b0b7bf]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0a66c2] border border-[#0a66c2] hover:bg-[#0a66c2]/10 h-8 px-3 text-xs font-semibold rounded-full"
                >
                  + Seguir
                </Button>
                <button className="text-[#b0b7bf] hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do post */}
            <div className="px-4 pb-3">
              <p className="text-[#e7e9ea] text-sm leading-relaxed">
                {formatContent(post.content)}
              </p>
            </div>

            {/* Imagem (se houver) */}
            {post.image_url && (
              <div className="w-full">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full object-cover max-h-[350px]"
                />
              </div>
            )}

            {/* Linha de reações simuladas */}
            <div className="px-4 py-2 flex items-center justify-between border-t border-[#38434f] mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#b0b7bf]">
                  {liked ? "Você e 241 pessoas" : "241 pessoas"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#b0b7bf]">
                <span>18 comentários</span>
                <span>•</span>
                <span>7 repostagens</span>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="px-2 py-1 flex items-center justify-around border-t border-[#38434f]">
              <button
                onClick={() => setLiked((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-[#38434f] ${
                  liked ? "text-[#378fe9]" : "text-[#b0b7bf]"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? "fill-[#378fe9]" : ""}`} />
                Gostei
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#b0b7bf] hover:bg-[#38434f] transition-colors">
                <MessageSquare className="w-4 h-4" />
                Comentar
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#b0b7bf] hover:bg-[#38434f] transition-colors">
                <Repeat2 className="w-4 h-4" />
                Repostar
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#b0b7bf] hover:bg-[#38434f] transition-colors">
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}