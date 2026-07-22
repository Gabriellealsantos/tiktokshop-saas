# Exemplo Beleza: Lumière Radiant Glow Serum

Este é um exemplo completo de uso do **Prompt Engine** para o nicho de beleza (skincare). Ele contém as imagens de referência geradas, as variáveis inseridas e o prompt final resultante pronto para ser enviado ao **Google Veo3**.

---

## 1. Imagens de Referência (Assets)

Para este exemplo, foram geradas três imagens de referência correspondentes aos requisitos do Veo3. O usuário deve baixar/copiar estas três imagens para anexá-las junto ao prompt final:

*   **Imagem 1 (Avatar):** [avatar_reference.png](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/examples/assets/avatar_reference.png)
    *   *Descrição:* Uma criadora de conteúdo jovem, com expressão simpática e pele natural.
*   **Imagem 2 (Produto):** [product_reference.png](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/examples/assets/product_reference.png)
    *   *Descrição:* Um frasco conta-gotas de vidro âmbar premium com óleo facial dourado.
*   **Imagem 3 (Cenário):** [environment_reference.png](file:///c:/Users/lucas/Downloads/prompt-engine-template/prompt-engine/examples/assets/environment_reference.png)
    *   *Descrição:* Uma bancada de mármore de um banheiro luxuoso e moderno com espelho iluminado.

---

## 2. Variáveis de Entrada (Input Variables)

As seguintes variáveis foram injetadas no `master-prompt.md`:

```yaml
PRODUCT_NAME: "Lumière Radiant Glow Serum"
CATEGORY: "Skincare"
DESCRIPTION: "A premium organic facial oil containing rosehip and golden jojoba oil, designed to hydrate and give a radiant complexion."
BRAND: "Lumière Organics"
MAIN_BENEFIT: "Deep hydration and natural glass skin glow."
SECONDARY_BENEFITS: "Reduces redness, smooths skin texture, and absorbs quickly."
PROBLEM: "Dry, dull, and lifeless skin."
USP: "100% cold-pressed organic oils with no synthetic additives."
TARGET_AUDIENCE: "Young adults aged 20-35 interested in natural beauty and clean skincare."
AVATAR_GENDER: "Female"
AVATAR_AGE: "25"
AVATAR_STYLE: "Casual chic, friendly TikTok creator vibe"
PERSONALITY: "Authentic, energetic, friendly, and trustworthy"
ENVIRONMENT: "Modern luxury bathroom with a marble countertop and a round vanity mirror"
LIGHTING: "Soft natural morning light from a side window"
MOOD: "Clean, relaxing, aesthetic, and premium"
VIDEO_STYLE: "UGC"
OBJECTIVE: "Conversion"
DURATION: "15 seconds"
TONE: "Authentic and enthusiastic"
ENERGY: "High retention, dynamic pacing"
```

---

## 3. Prompt Final Gerado para o Google Veo3

Este é o prompt textual final em inglês, livre de marcações, títulos e formatações, pronto para ser copiado e colado diretamente no Google Veo3:

```text
UGC-style commercial for TikTok Shop, filmed vertically in 9:16 aspect ratio. The scene is shot with a handheld smartphone camera, capturing natural, subtle camera shake at eye-level to maintain absolute authenticity. The video takes place in the modern luxury bathroom from Image 3, with soft morning daylight flowing from a side window, highlighting the marble countertop and casting soft, realistic shadows.

The commercial stars the female content creator from Image 1, wearing the exact same casual clothing and hairstyle. She stands in front of the vanity mirror, looking directly into the camera with a friendly, authentic smile. In the opening 3 seconds, she holds up the premium amber glass dropper bottle from Image 2 close to the lens. The camera performs a quick autofocus pull to capture a macro detail of the bottle's clean minimal label, showcasing the text 'SERUM' and the branding of Lumière Organics, before pulling back slightly to show her face.

With a natural, conversational gesture, she unscrews the dropper lid. The camera pushes in slightly to a medium close-up as she holds the dropper, demonstrating the golden oil inside. She gently squeezes one drop of the golden oil onto the back of her hand. The camera focuses on the fluid dynamics of the oil drop as it sits on her skin. She rubs the serum into her skin with a gentle, circular motion. The camera captures the texture of her skin transforming from dry to deeply hydrated, displaying a natural, luminous glass skin glow. Her facial expression shows genuine satisfaction and relief.

The camera pulls back to a medium shot as she holds the product bottle from Image 2 next to her cheek, smiling confidently and looking at the camera. The video concludes with her pointing naturally toward the screen in a friendly manner, presenting the product on the marble vanity table. The lighting remains soft and consistent, and the visual style is clean, organic, and realistic, avoiding any artificial camera movements or CGI-looking elements. The final frame shows the amber glass bottle placed neatly on the marble surface.
```
