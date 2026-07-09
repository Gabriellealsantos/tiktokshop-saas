package com.venyx.tiktokshop.config;

import com.venyx.tiktokshop.entities.CreditWallet;
import com.venyx.tiktokshop.entities.Notification;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.MiningWindow;
import com.venyx.tiktokshop.entities.enums.NotificationAudience;
import com.venyx.tiktokshop.entities.enums.NotificationType;
import com.venyx.tiktokshop.entities.enums.ProductCategory;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.repositories.CreditWalletRepository;
import com.venyx.tiktokshop.repositories.NotificationRepository;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Semeia usuários de teste em desenvolvimento (idempotente). As roles e os planos
 * vêm das migrations Flyway.
 */
@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEV_PASSWORD = "123456";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CreditWalletRepository creditWalletRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CreditWalletRepository creditWalletRepository,
                           ProductRepository productRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.creditWalletRepository = creditWalletRepository;
        this.productRepository = productRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUser("admin@venyx.com", "Administrador (ADM)",
                List.of(RoleConstants.ROLE_ADMIN), false);
        seedUser("afiliado@venyx.com", "Afiliado Teste",
                List.of(RoleConstants.ROLE_AFFILIATE), false);
        seedUser("client@venyx.com", "Cliente Teste",
                List.of(RoleConstants.ROLE_CLIENT), true);
        seedProducts();
        seedWelcomeNotification();
    }

    /**
     * Aviso ANNOUNCEMENT/ALL de boas-vindas (idempotente) para o sino não nascer vazio.
     * audience=ALL não faz fan-out: uma linha só, vista por todos os usuários.
     */
    private void seedWelcomeNotification() {
        if (notificationRepository.count() > 0) {
            return;
        }
        Notification welcome = new Notification();
        welcome.setType(NotificationType.ANNOUNCEMENT);
        welcome.setAudience(NotificationAudience.ALL);
        welcome.setTitle("Bem-vindo à Venyx 🎉");
        welcome.setBody("Explore os produtos virais e acompanhe as vendas ao vivo em tempo real.");
        notificationRepository.save(welcome);
        logger.info("✅ Notificação de boas-vindas semeada (dev).");
    }

    /**
     * Pool de produtos "minerados" para a vitrine e para as vendas ao vivo
     * sortearem enquanto a integração real com a API do TikTok Shop não existe.
     */
    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }

        seedProduct("Umidificador Portátil USB", ProductCategory.CASA_MAIS,
                "49.90", "20", "1200", 1);
        seedProduct("Fone Bluetooth TWS Pro", ProductCategory.TECNOLOGIA,
                "89.90", "25", "3400", 2);
        seedProduct("Kit Skincare Coreano 5 Passos", ProductCategory.BELEZA_CUIDADOS,
                "119.90", "18", "2100", 3);
        seedProduct("Escova Alisadora Elétrica", ProductCategory.BELEZA_CUIDADOS,
                "79.90", "22", "1800", 4);
        seedProduct("Suporte de Celular Magnético Veicular", ProductCategory.TECNOLOGIA,
                "34.90", "30", "2600", 5);
        seedProduct("Massageador de Pescoço e Ombros", ProductCategory.SAUDE_FITNESS,
                "129.90", "20", "1500", 6);
        seedProduct("Tapete Antiderrapante para Pets", ProductCategory.CASA_MAIS,
                "44.90", "15", "900", 7);
        seedProduct("Luminária LED RGB com Controle", ProductCategory.CASA_MAIS,
                "59.90", "20", "2000", 8);
        seedProduct("Garrafa Térmica Inteligente com Display", ProductCategory.SAUDE_FITNESS,
                "69.90", "18", "1300", 9);
        seedProduct("Faixa Elástica de Resistência Kit", ProductCategory.SAUDE_FITNESS,
                "39.90", "25", "1100", 10);

        logger.info("✅ {} produtos de dev semeados para mineração/vendas ao vivo.", productRepository.count());
    }

    private void seedProduct(String name, ProductCategory category, String price,
                             String commissionPct, String estimatedRevenue, int rankPosition) {
        Product product = new Product();
        product.setName(name);
        product.setDescription("Produto de exemplo cadastrado manualmente para demonstração (dev).");
        product.setCategory(category);
        product.setPrice(new BigDecimal(price));
        product.setCommissionPct(new BigDecimal(commissionPct));
        product.setEstimatedRevenue(new BigDecimal(estimatedRevenue));
        product.setConversionRate(new BigDecimal("3.5"));
        product.setSalesPerDay(new BigDecimal("12"));
        product.setDelta7d(new BigDecimal("8.2"));
        product.setHistory7d(List.of(10, 12, 9, 14, 18, 15, 20));
        // Varia a janela entre as 4 faixas para a demo do filtro por horário ter resultados distintos.
        product.setMiningWindow(MiningWindow.values()[(rankPosition - 1) % MiningWindow.values().length]);
        product.setTrendLabel("Em alta");
        product.setRankPosition(rankPosition);
        product.setSales(rankPosition * 37);
        product.setViews(rankPosition * 512);
        product.setCreatedByAdmin(true);
        productRepository.save(product);
    }

    private void seedUser(String email, String name, List<String> authorities, boolean withWallet) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEV_PASSWORD));
        user.setUserStatus(UserStatus.ACTIVE);

        for (String authority : authorities) {
            Role role = roleRepository.findByAuthority(authority).orElse(null);
            if (role == null) {
                logger.warn("Role {} não encontrada — pulei o seed de {}.", authority, email);
                return;
            }
            user.addRole(role);
        }

        user = userRepository.save(user);

        if (withWallet) {
            CreditWallet wallet = new CreditWallet(user, 100);
            creditWalletRepository.save(wallet);
        }

        logger.info("✅ Usuário de dev criado: {} (senha {})", email, DEV_PASSWORD);
    }
}
