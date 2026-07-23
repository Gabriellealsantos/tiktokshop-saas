package com.venyx.tiktokshop.services.generation;

import java.util.List;

public record ImageProviderRequest(String prompt, List<String> referenceImageUrls) {

    public ImageProviderRequest(String prompt, String referenceImageUrl) {
        this(prompt, referenceImageUrl == null || referenceImageUrl.isBlank()
                ? List.of()
                : List.of(referenceImageUrl));
    }
}
