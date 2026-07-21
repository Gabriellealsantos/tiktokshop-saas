package com.venyx.tiktokshop.services.generation;

/**
 * @param instruction prompt completo já composto (instrução do template + contrato de saída)
 * @param jsonOutput  true quando o provider deve retornar JSON estruturado (lista de roteiros)
 */
public record TextProviderRequest(String instruction, boolean jsonOutput) {
}
