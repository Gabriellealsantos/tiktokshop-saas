# IMAGE GENERATION RULES

## Purpose

This document defines the rules for generating the three reference image prompts (Avatar, Product, and Environment) during Step 1 of the generation flow.

The objective is to produce highly detailed, stable, and visually compatible prompts for an image generation model (e.g., DALL-E 3, Midjourney, Imagen 3).

These generated images will later serve as the input references for Google Veo3.

---

# Two-Step Generation Flow

The SaaS platform operates in a two-step API flow:

### Step 1: Image Prompt Generation
*   **Input:** User selected niche and input variables.
*   **Rules Applied:** `14-image-generation.md`.
*   **Output:** Exactly three image prompts formatted in JSON (Avatar, Product, Environment).

### Step 2: Veo3 Video Prompt Generation
*   **Input:** User input variables + The three generated image assets.
*   **Rules Applied:** `01-system-role.md` through `13-platform.md`.
*   **Output:** The final cinematic Veo3 video prompt.

---

# 1. Avatar Image Prompt Guidelines

The goal is to generate a clean, clear portrait of the main character (actor) that will be animated by Veo3.

### Core Principles
*   **Neutral Pose:** The avatar must be looking directly at the camera with a simple, friendly, natural smile.
*   **No Product or Hand Interactions:** The avatar must NOT be holding anything. The face and shoulders should be clean and uncluttered.
*   **Solid/Plain Background:** Use a clean, solid, or softly blurred background to make the avatar easy for Veo3 to isolate and preserve.
*   **Anatomical Accuracy:** Always specify natural human features, photorealistic skin textures, and balanced facial proportions.

### Prompt Template Structure
*   **Subject:** A high-quality studio portrait photograph of a [AVATAR_AGE]-year-old [AVATAR_GENDER] content creator.
*   **Style/Clothing:** Wearing [AVATAR_STYLE], looking directly at the camera, authentic skin texture.
*   **Lighting:** Soft studio lighting or natural morning window light.
*   **Composition:** Head-and-shoulders portrait shot, centered composition.
*   **Background:** Clean, solid plain pastel color background.

---

# 2. Product Image Prompt Guidelines

The goal is to create a clean, high-end commercial asset of the product, showcasing branding, labels, and shape without distractions.

### Core Principles
*   **Isolation:** The product must stand alone. No hands holding it, no people in the frame.
*   **Neutral Studio Background:** Always place the product on a solid white, light gray, or neutral tabletop surface.
*   **Logo & Branding Visibility:** Instruct the model to depict a clean, legible label and packaging, avoiding chaotic details.
*   **Realistic Proportions:** Specify clean geometry, realistic materials (glass, matte plastic, aluminum), and sharp focus.

### Prompt Template Structure
*   **Subject:** High-end commercial product photography of [PRODUCT_NAME], a [CATEGORY] product.
*   **Details:** Clear visibility of the label, branding, [MATERIAL] texture, and [COLOR] color.
*   **Lighting:** Clean studio softbox lighting, soft highlights, realistic reflections.
*   **Composition:** Centered shot, eye-level, sharp focus, shallow depth of field.
*   **Background:** Clean, solid white studio background, sitting on a flat neutral surface.

---

# 3. Environment Image Prompt Guidelines

The goal is to generate a realistic, aesthetic background location that matches the product use case and provides cohesive lighting.

### Core Principles
*   **Clean and Empty:** The location must NOT contain any people, avatars, or products. It should be a clean background plate.
*   **Niche Relevancy:** The environment must fit the product (e.g., modern kitchen for kitchenware, aesthetic bathroom for cosmetics).
*   **Consistent Lighting Direction:** Establish a clear light source (e.g., soft natural light from a window) which will match the lighting specified in the final Veo3 prompt.
*   **No Clutter:** Avoid complex background decorations that could distract from the product.

### Prompt Template Structure
*   **Subject:** Realistic interior photography of a modern, aesthetic [ENVIRONMENT].
*   **Mood:** Designed in [MOOD] style, cozy and clean composition.
*   **Lighting:** [LIGHTING] direction, casting soft natural shadows.
*   **Details:** Architectural digest quality, rich texture on surfaces (marble, polished wood, stone).
*   **Composition:** Wide angle establishing shot, empty room, no people, no products.

---

# Output Format (Step 1)

When instructed to perform **Step 1 (Image Prompt Generation)**, the output must be returned strictly in the following JSON format:

```json
{
  "avatar_prompt": "[Your generated prompt for the Avatar image]",
  "product_prompt": "[Your generated prompt for the Product image]",
  "environment_prompt": "[Your generated prompt for the Environment image]"
}
```

Do not output any markdown code blocks, intro text, explanation, or notes. Return only the raw JSON string.
