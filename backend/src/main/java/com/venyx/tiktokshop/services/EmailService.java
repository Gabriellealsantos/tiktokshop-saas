package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.services.exceptions.EmailException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String emailFrom;

    @Value("${email.confirmation.uri}")
    private String confirmationUri;

    @Value("${spring.application.name:Bar João de Deus}")
    private String appName;

    private final JavaMailSender emailSender;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            emailSender.send(message);
        } catch (MailException e) {
            logger.error("Falha ao enviar email para {}: {}", to, e.getMessage(), e);
            throw new EmailException("Failed to send email");
        }
    }

    public void sendConfirmationEmail(String recipientEmail, String token) {
        String subject = "Confirmação de Cadastro - " + appName;
        String link = confirmationUri + token;

        String body = "Bem-vindo ao " + appName + "!\n\n"
                + "Por favor, clique no link a seguir para ativar sua conta. Este link é válido por 24 horas:\n\n"
                + link + "\n\n"
                + "Se você não se cadastrou em nosso site, por favor, ignore este e-mail.";

        sendEmail(recipientEmail, subject, body);
    }
}
