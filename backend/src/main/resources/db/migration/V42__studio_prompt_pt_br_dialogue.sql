-- V42__studio_prompt_pt_br_dialogue.sql
UPDATE studio_prompt_config
SET prompt_instruction = REPLACE(
    prompt_instruction,
    ' Script (spoken line, keep EXACTLY in Brazilian Portuguese, do not translate): "{{script}}"',
    ' Script (the exact spoken line for the character, in Brazilian Portuguese): "{{script}}"

 Language rule: write the entire video prompt in English, but any dialogue, voiceover or spoken line performed by the character in the video must remain in Brazilian Portuguese (pt-BR), exactly as given in the Script above — never translate it into English. Explicitly state in the prompt that the character speaks in Brazilian Portuguese (pt-BR), quoting the Script line as-is, so the video model does not default to English audio.'
),
    updated_at = now()
WHERE prompt_instruction LIKE '%Script (spoken line, keep EXACTLY in Brazilian Portuguese, do not translate)%';
