import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MistralApiKeySettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("mistral_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        description: "Por favor, insira uma chave de API válida.",
      });
      return;
    }

    localStorage.setItem("mistral_api_key", apiKey.trim());
    setIsSaved(true);
    toast({
      description: "Chave da Mistral salva com sucesso no seu navegador!",
    });
  };

  const handleRemove = () => {
    localStorage.removeItem("mistral_api_key");
    setApiKey("");
    setIsSaved(false);
    toast({
      description: "Chave removida do navegador.",
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
          <Key className="w-3.5 h-3.5 text-primary" />
          Configuração da IA (Mistral)
        </Label>
        <p className="text-[11px] text-muted-foreground mb-3">
          Sua chave é armazenada de forma segura apenas no seu navegador local (localStorage). 
          Sem ela, o sistema pode usar o modelo fallback (base44).
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="password"
              placeholder="Insira sua Mistral API Key (ex: ms_...)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
              }}
              className="bg-background border-border pr-10 focus-visible:ring-primary h-10"
            />
            {isSaved && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
          </div>
          
          <Button 
            onClick={isSaved ? handleRemove : handleSave}
            variant={isSaved ? "destructive" : "default"}
            className="h-10"
          >
            {isSaved ? <Trash2 className="w-4 h-4" /> : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
