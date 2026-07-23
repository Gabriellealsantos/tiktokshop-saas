-- V24__studio_prompt_output_rule.sql
UPDATE studio_prompt_config
SET prompt_instruction = prompt_instruction || '

Return ONLY the raw video prompt text, ready to paste directly into Google Flow. Do not add any preamble, introduction, explanation, markdown, headings, asterisks, bold, or horizontal rules. Output plain text only.',
    updated_at = now();