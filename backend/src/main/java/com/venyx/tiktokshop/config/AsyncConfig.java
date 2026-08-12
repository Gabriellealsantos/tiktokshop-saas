package com.venyx.tiktokshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Habilita @Async e define o executor usado pelas gerações de IA (Gemini).
 * Cada geração é delegada a este pool, liberando a thread do Tomcat imediatamente.
 * CallerRunsPolicy: em pico extremo, degrada para síncrono na thread do Tomcat
 * em vez de lançar TaskRejectedException.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("generationExecutor")
    public Executor generationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("gen-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
