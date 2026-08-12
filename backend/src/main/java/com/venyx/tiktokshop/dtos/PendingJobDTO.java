package com.venyx.tiktokshop.dtos;

/**
 * Resposta imediata (HTTP 202) para gerações assíncronas.
 * O frontend usa o {@code jobId} para aguardar o resultado via WebSocket.
 */
public record PendingJobDTO(String jobId, String status) {

    public PendingJobDTO(String jobId) {
        this(jobId, "PENDING");
    }

    public PendingJobDTO(Long id) {
        this(id.toString(), "PENDING");
    }
}
