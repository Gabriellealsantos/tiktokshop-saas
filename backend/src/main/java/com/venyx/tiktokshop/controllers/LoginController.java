package com.venyx.tiktokshop.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    // Domínio da SPA (para o link "Criar conta" apontar ao /register do front).
    @Value("${security.app-domain:http://localhost:5173}")
    private String appDomain;

    @GetMapping("/login")
    public String customLogin(Model model) {
        model.addAttribute("appDomain", appDomain);
        return "login";
    }
}
