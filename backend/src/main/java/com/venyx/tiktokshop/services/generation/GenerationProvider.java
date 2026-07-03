package com.venyx.tiktokshop.services.generation;

/**
 * Contrato do provider de IA. O provider real é [A DEFINIR] pelo dono;
 * até lá, {@link FakeGenerationProvider} mantém o fluxo completo funcionando
 * (job + débito + estorno + polling).
 */
public interface GenerationProvider {

    GenerationResult generate(GenerationRequest request);
}
