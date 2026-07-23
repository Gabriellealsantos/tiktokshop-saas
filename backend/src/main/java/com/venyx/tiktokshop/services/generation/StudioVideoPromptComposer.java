package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.*;
import com.venyx.tiktokshop.repositories.StudioPromptConfigRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StudioVideoPromptComposer {

    private final StudioPromptConfigRepository configRepository;
    private final PromptSanitizer sanitizer;

    public StudioVideoPromptComposer(StudioPromptConfigRepository configRepository,
                                     PromptSanitizer sanitizer) {
        this.configRepository = configRepository;
        this.sanitizer = sanitizer;
    }

    public String compose(String productName, String productDescription,
                          Map<String, Object> sessionConfig,
                          String script, NarratorVoice voice) {
        String instruction = configRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new BusinessException("Configuração de prompt do estúdio não encontrada."))
                .getPromptInstruction();

        String sceneDescription = buildSceneDescription(sessionConfig);
        String pointOfView = pov(sessionConfig).getDescription();
        String pose = nvl(sanitizer.clean(asString(sessionConfig.get("pose"))));
        String cleanScript = nvl(sanitizer.clean(script));

        return instruction
                .replace("{{productName}}", nvl(productName))
                .replace("{{productDescription}}", nvl(productDescription))
                .replace("{{sceneDescription}}", sceneDescription)
                .replace("{{pointOfView}}", pointOfView)
                .replace("{{pose}}", pose)
                .replace("{{voiceDescription}}", voice.getDescription())
                .replace("{{script}}", cleanScript);
    }

    private String buildSceneDescription(Map<String, Object> c) {
        SceneLocation location = SceneLocation.valueOf(asString(c.get("location")));
        TimeOfDay time = TimeOfDay.valueOf(asString(c.get("timeOfDay")));
        SceneLighting lighting = SceneLighting.valueOf(asString(c.get("lighting")));
        SceneAtmosphere atmosphere = SceneAtmosphere.valueOf(asString(c.get("atmosphere")));
        return location.getDescription() + ", " + time.getDescription() + ", "
                + lighting.getDescription() + ", " + atmosphere.getDescription();
    }

    private PointOfView pov(Map<String, Object> c) {
        return PointOfView.valueOf(asString(c.get("pointOfView")));
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private String nvl(String value) {
        return value == null ? "" : value;
    }
}