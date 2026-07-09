package com.venyx.tiktokshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configurações gerais da aplicação.
 * Define beans globais como o codificador de senhas e habilita o
 * agendamento (@Scheduled) usado pelo LiveSalesScheduler.
 */
@Configuration
@EnableScheduling
public class AppConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
