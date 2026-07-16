package com.venyx.tiktokshop.config.security.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;

/**
 * Redireciona para a tela de login correta (admin ou delivery) após falha de autenticação.
 * Primeiro tenta ler o parâmetro "login_context" enviado pelo formulário (mais confiável),
 * depois consulta o atributo de sessão salvo pelo ContextAwareAuthenticationEntryPoint.
 */
public class ContextAwareAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception)
            throws IOException, ServletException {

        // 1. Tenta o parâmetro do form (campo hidden login_context=delivery)
        String loginContext = request.getParameter("login_context");

        // 2. Fallback: atributo de sessão definido pelo EntryPoint
        if (loginContext == null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                loginContext = (String) session.getAttribute("login_context");
            }
        }

        String redirectUrl = "delivery".equals(loginContext)
                ? "/delivery/login?error"
                : "/login?error";

        if (exception instanceof LockedException) {
            redirectUrl += "=locked";
        } else if (exception instanceof DisabledException) {
            redirectUrl += "=disabled";
        }

        response.sendRedirect(redirectUrl);
    }
}
