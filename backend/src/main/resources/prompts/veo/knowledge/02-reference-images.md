# REFERENCE IMAGES

## Purpose

This document defines how reference images must be interpreted when generating prompts for Google Veo 3.

The generated prompt must always assume that three reference images will be attached during video generation.

The reference images are the foundation of the entire generation.

Every cinematic decision must respect these references.

---

# Reference Structure

Every request contains exactly three reference images.

Image 1

Avatar Reference

Image 2

Product Reference

Image 3

Environment Reference

These references are mandatory.

The prompt must be written assuming these images already exist.

Never describe them as hypothetical.

Treat them as fixed visual assets.

---

# General Principles

Reference images always have higher priority than text descriptions.

Whenever there is a conflict between textual information and reference images, prioritize the visual reference.

The AI should never reinterpret the references.

Instead, it should build the video around them.

---

# Avatar Reference

The first image defines the main actor.

The avatar reference is the absolute source of truth.

Never generate another actor.

Never replace the avatar.

Never create multiple actors unless explicitly requested.

The prompt must instruct Veo3 to preserve:

• Facial identity

• Facial proportions

• Skin tone

• Hair style

• Hair color

• Eye color

• Clothing

• Accessories

• Body proportions

• Age appearance

The avatar must remain visually identical throughout the entire video.

No scene should introduce identity drift.

---

# Avatar Consistency

The same person must appear in every scene.

The avatar cannot suddenly change:

- hairstyle

- clothing

- face

- age

- ethnicity

- makeup

- accessories

- body shape

Consistency is mandatory.

---

# Product Reference

The second image defines the product.

The product reference must be preserved exactly.

Never redesign it.

Never replace it.

Never simplify it.

Maintain:

• Shape

• Materials

• Colors

• Texture

• Packaging

• Brand

• Logo

• Buttons

• Labels

• Size proportions

The product should always look identical to the reference image.

---

# Product Visibility

The product must remain clearly visible whenever it is being demonstrated.

Avoid:

hidden product

cropped product

blurry product

occluded product

incorrect scale

The audience must instantly recognize the product.

---

# Product Interaction

The avatar should naturally interact with the product.

Examples:

Holding

Using

Opening

Rotating

Showing details

Pointing

Demonstrating features

The interaction should always look realistic.

---

# Environment Reference

The third image defines the filming location.

Treat this image as the real location.

Maintain:

Architecture

Furniture

Decoration

Wall colors

Lighting direction

Spatial organization

General atmosphere

Do not redesign the location.

---

# Environment Consistency

The environment should remain visually coherent.

Do not suddenly change:

Room size

Furniture

Wall colors

Lighting direction

Objects

Layout

Time of day

Unless explicitly requested.

---

# Visual Hierarchy

The hierarchy must always be:

1. Avatar

2. Product

3. Environment

The viewer's attention should naturally move from the avatar to the product.

The environment supports the scene.

It should never distract from the product.

---

# Camera Behavior

Camera movement must respect the references.

Never create impossible transitions that change:

Avatar identity

Product appearance

Environment layout

Camera movement should reveal the references instead of replacing them.

---

# Lighting Consistency

Lighting should enhance realism while respecting the environment reference.

If natural light exists in the reference image, preserve its direction.

Avoid inconsistent lighting changes.

---

# Realism Rules

Do not create:

floating products

teleportation

instant transformations

physics violations

body distortions

identity changes

The video should feel naturally filmed.

---

# Reference Priority

Whenever a decision needs to be made, follow this priority.

1. Preserve Avatar

2. Preserve Product

3. Preserve Environment

4. Cinematic Quality

5. Storytelling

Nothing is more important than maintaining visual consistency.

---

# Reference Integrity

Never modify any reference element without explicit user instructions.

The objective is not to recreate the references.

The objective is to animate the references naturally.

---

# Final Instruction

Always write prompts assuming the three reference images will be attached to Google Veo 3.

The prompt should direct the model on how to use those references, not how to recreate them.

Every generated video must preserve identity, product accuracy and environmental consistency from the first frame to the last.
