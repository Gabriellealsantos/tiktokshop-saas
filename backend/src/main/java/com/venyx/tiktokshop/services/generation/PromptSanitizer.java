package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PromptSanitizer {

    private static final Pattern INJECTION = Pattern.compile(
            "(?i)(ignore|ignorar|desconsidere|esqueça|forget|disregard|override)\\s+" +
                    "(as |the |todas |all |previous |anteriores |acima |above |instruções|instructions|prompt)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\p{Cntrl}&&[^\r\n\t]]");

    public String clean(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }

        String value = CONTROL_CHARS.matcher(input).replaceAll("").trim();

        if (INJECTION.matcher(value).find()) {
            throw new BusinessException("Os detalhes contêm instruções não permitidas.");
        }

        return value.replace("\"", "").replace("\n", " ");
    }
}
