package com.venyx.tiktokshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Habilita @Async e define os executores usados pelas gerações assíncronas.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("generationExecutor")
    public Executor generationExecutor(
            @Value("${generation.async.core-pool:4}") int corePool,
            @Value("${generation.async.max-pool:4}") int maxPool,
            @Value("${generation.async.queue-capacity:100}") int queueCapacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // core == max de proposito: com queueCapacity alto o ThreadPoolExecutor so cria
        // threads acima do core depois que a fila enche — entao um max maior nunca era
        // alcancado e o pool ficava travado no core, escondendo o dimensionamento real.
        executor.setCorePoolSize(corePool);
        executor.setMaxPoolSize(maxPool);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("gen-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "avatarTaskExecutor")
    Executor avatarTaskExecutor(
            @Value("${avatar.async.core-pool:4}") int corePool,
            @Value("${avatar.async.max-pool:4}") int maxPool,
            @Value("${avatar.async.queue-capacity:100}") int queueCapacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePool);
        executor.setMaxPoolSize(maxPool);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("avatar-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "studioTaskExecutor")
    Executor studioTaskExecutor(
            @Value("${studio.async.core-pool:4}") int corePool,
            @Value("${studio.async.max-pool:4}") int maxPool,
            @Value("${studio.async.queue-capacity:100}") int queueCapacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePool);
        executor.setMaxPoolSize(maxPool);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("studio-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
