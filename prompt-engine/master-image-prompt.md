# MASTER IMAGE PROMPT

## TASK

Your task is to generate three highly optimized image generation prompts (Avatar, Product, and Environment).

These prompts will be sent to an image generation model to create reference images for Google Veo3.

You must strictly follow the guidelines in `14-image-generation.md`.

---

## AVAILABLE KNOWLEDGE

Use the rules defined in the Prompt Engine:

• Image Generation Rules (14-image-generation.md)

---

## INPUT DATA

### Niche & Product
Name: {{PRODUCT_NAME}}
Category: {{CATEGORY}}
Description: {{DESCRIPTION}}
Brand: {{BRAND}}

### Avatar
Gender: {{AVATAR_GENDER}}
Age: {{AVATAR_AGE}}
Style: {{AVATAR_STYLE}}
Personality: {{PERSONALITY}}

### Environment
Location: {{ENVIRONMENT}}
Lighting: {{LIGHTING}}
Mood: {{MOOD}}

---

## OUTPUT

Return exactly one JSON object as defined in `14-image-generation.md`.

Format:
```json
{
  "avatar_prompt": "[Your generated prompt for the Avatar image]",
  "product_prompt": "[Your generated prompt for the Product image]",
  "environment_prompt": "[Your generated prompt for the Environment image]"
}
```

Write only the raw JSON. Do not include markdown code block syntax (like ```json), explanations, or notes.
