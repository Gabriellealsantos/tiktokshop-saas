# RESTRICTIONS

## Purpose

This document defines the mandatory restrictions that the Prompt Engine must enforce when generating prompts for Google Veo3.

The primary objective is to maximize realism, maintain visual consistency, preserve all reference images and avoid common AI-generated artifacts.

These rules have higher priority than creative decisions.

---

# Core Principle

The Prompt Engine must never sacrifice realism for creativity.

Whenever there is a conflict between artistic style and realism:

Always choose realism.

---

# Reference Integrity

The attached reference images are absolute.

Never modify:

Avatar

Product

Environment

The prompt should direct how these references behave.

Never recreate them.

Never redesign them.

Never reinterpret them.

---

# Avatar Restrictions

Never change:

Face

Identity

Age

Gender

Ethnicity

Hair

Hair color

Hairstyle

Facial proportions

Skin tone

Body proportions

Clothing

Accessories

Eye color

Facial structure

The avatar must remain recognizable in every frame.

---

# Product Restrictions

Never modify:

Logo

Brand

Packaging

Color

Material

Shape

Texture

Dimensions

Buttons

Labels

Accessories

The product must always match the attached reference image.

---

# Environment Restrictions

Never change:

Architecture

Furniture

Decoration

Layout

Lighting direction

Wall colors

Floor

Ceiling

Objects

Room proportions

The environment must remain visually consistent.

---

# Cinematic Restrictions

Avoid:

Impossible camera movement

Floating cameras

Teleportation

Instant scene changes

Random zooms

Inconsistent framing

Artificial transitions

Camera clipping

Unmotivated movement

Every camera movement must feel physically possible.

---

# Realism Restrictions

Never generate:

Floating objects

Impossible physics

Gravity violations

Body distortion

Extra limbs

Extra fingers

Missing fingers

Incorrect anatomy

Broken joints

Plastic skin

Wax-like faces

CGI appearance

Robotic movement

Everything should resemble real-world filming.

---

# Product Usage Restrictions

Never use the product incorrectly.

Never demonstrate impossible functionality.

Never invent features.

Never exaggerate capabilities.

Always demonstrate realistic usage.

---

# Environment Restrictions

Do not create:

Floating furniture

Moving walls

Changing room layouts

Teleporting objects

Inconsistent shadows

Inconsistent reflections

Incorrect perspective

Impossible geometry

The location should remain physically believable.

---

# Lighting Restrictions

Avoid:

Overexposure

Underexposure

Extreme saturation

Artificial colors

Multiple conflicting light sources

Incorrect shadow direction

Flat lighting

Lighting should always feel natural.

---

# Composition Restrictions

Avoid:

Visual clutter

Crowded framing

Hidden product

Product outside frame

Avatar cropped incorrectly

Competing visual elements

Unbalanced framing

The viewer should immediately understand where to look.

---

# Storytelling Restrictions

Never:

Start without a hook.

Delay the product excessively.

Introduce unrelated scenes.

Change the narrative abruptly.

Repeat identical scenes.

Create confusing storytelling.

Force the CTA.

Every story should flow naturally.

---

# TikTok Restrictions

Avoid:

Television commercial style.

Corporate presentations.

Artificial spokesperson behavior.

Overly scripted dialogue.

Slow pacing.

Static scenes.

The video should always feel native to TikTok.

---

# Emotion Restrictions

Avoid:

Overacting.

Artificial excitement.

Forced reactions.

Fake smiles.

Emotionless expressions.

Robotic facial movement.

Emotion should always feel authentic.

---

# Product Priority Restrictions

Never allow:

The environment to dominate the frame.

The avatar to overshadow the product.

Background objects to distract attention.

The product should remain the commercial hero.

---

# AI Artifact Prevention

The Prompt Engine should actively prevent:

Identity drift

Object morphing

Face swapping

Texture instability

Clothing changes

Logo changes

Environment mutations

Product mutations

Frame inconsistency

Visual flickering

Temporal inconsistency

Every frame should maintain visual continuity.

---

# Commercial Restrictions

Never:

Hide the product.

Delay the value proposition.

Confuse the audience.

Use misleading demonstrations.

Generate unrealistic expectations.

Reduce product credibility.

The commercial should always reinforce trust.

---

# Output Restrictions

Never return:

Markdown

Lists

Explanations

Comments

JSON

Formatting

Only return the final Veo3 prompt.

---

# Priority Rules

When conflicts occur, follow this order:

1. Preserve Avatar
2. Preserve Product
3. Preserve Environment
4. Preserve Realism
5. Preserve Story
6. Preserve Cinematic Quality
7. Preserve Marketing Objective

This priority order must never be violated.

---

# Absolute Rules

Never sacrifice consistency for creativity.

Never sacrifice realism for visual effects.

Never sacrifice product accuracy for aesthetics.

Never sacrifice reference integrity for storytelling.

The generated video should feel like it was filmed in the real world.

---

# Final Rule

If there is any uncertainty, always choose the option that produces the most realistic, believable and visually consistent result.

The audience should never suspect that the video was generated by artificial intelligence.

The final output should look like genuine footage captured by a professional content creator.