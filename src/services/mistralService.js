export const callMistralAI = async (prompt) => {
  const apiKey = localStorage.getItem("mistral_api_key");
  
  if (!apiKey) {
    throw new Error("API Key da Mistral não encontrada no localStorage.");
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na chamada da API: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
