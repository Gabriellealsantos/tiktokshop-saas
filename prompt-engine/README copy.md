# Prompt Engine (TikTok SaaS)

Este repositório contém o motor de prompts modular projetado para estruturar dados e gerar os prompts e assets necessários para a criação de vídeos de conversão no **Google Veo3**.

---

## 1. Fluxo de Geração em Duas Etapas (Two-Step Flow)

Para otimizar a consistência e automatizar a criação do vídeo, o SaaS executa o fluxo em duas etapas sequenciais com o ChatGPT:

### **Etapa 1: Geração das Imagens de Referência**
1. O usuário escolhe o nicho e insere os dados do produto/avatar/cenário.
2. O backend envia os dados ao ChatGPT utilizando o template **[master-image-prompt.md](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/master-image-prompt.md)** e as regras de **[14-image-generation.md](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/14-image-generation.md)**.
3. O ChatGPT retorna um objeto JSON contendo os prompts otimizados para gerar o Avatar, o Produto e o Cenário.
4. O backend envia estes prompts à API de geração de imagem (ex: DALL-E 3, Midjourney) e armazena os assets gerados.

### **Etapa 2: Geração do Prompt de Vídeo Final**
1. O backend recebe as três imagens geradas na Etapa 1.
2. O backend junta as variáveis de entrada e as imagens de referência e envia ao ChatGPT utilizando o template **[master-prompt.md](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/master-prompt.md)** e os módulos de regras de **01 a 13**.
3. O ChatGPT gera o prompt de direção cinematográfica final (em inglês cru).
4. O usuário ou o backend envia o prompt final + os três assets de imagem gerados para a API do **Google Veo3** para produzir o vídeo comercial de alta conversão.

---

## 2. Estrutura de Arquivos

*   **Regras do Vídeo (01 a 13):** Módulos que cobrem direção cinematográfica, estilo (UGC, POV, Cinematic), roteirização (storytelling), plataforma (TikTok Shop) e restrições de IA.
*   **Regras de Imagem (14):** Diretrizes para a criação dos prompts das imagens de referência estáveis.
*   **Templates Master:**
    *   **[master-image-prompt.md](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/master-image-prompt.md):** Ponto de partida da Etapa 1.
    *   **[master-prompt.md](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/master-prompt.md):** Ponto de partida da Etapa 2.
