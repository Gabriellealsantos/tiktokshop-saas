package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.MfaActivationDTO;
import com.venyx.tiktokshop.dtos.MfaSetupDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserRecoveryCode;
import com.venyx.tiktokshop.repositories.UserRecoveryCodeRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MfaService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;
    private final RecoveryCodeGenerator recoveryCodeGenerator;
    private final UserRecoveryCodeRepository recoveryCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final TextEncryptor textEncryptor;

    @Value("${spring.application.name:Bar João de Deus}")
    private String appName;

    public MfaService(UserRepository userRepository,
            AuthService authService,
            SecretGenerator secretGenerator,
            CodeVerifier codeVerifier,
            RecoveryCodeGenerator recoveryCodeGenerator,
            UserRecoveryCodeRepository recoveryCodeRepository,
            PasswordEncoder passwordEncoder,
            TextEncryptor textEncryptor) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.secretGenerator = secretGenerator;
        this.codeVerifier = codeVerifier;
        this.recoveryCodeGenerator = recoveryCodeGenerator;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.textEncryptor = textEncryptor;
    }

    @Transactional
    public MfaSetupDTO setupMfa() {
        User user = authService.authenticated();

        String plainTextSecret = secretGenerator.generate();

        QrData qrData = new QrData.Builder()
                .label(user.getEmail())
                .secret(plainTextSecret)
                .issuer(appName)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        String encryptedSecret = textEncryptor.encrypt(plainTextSecret);
        user.setMfaSecret(encryptedSecret);
        userRepository.save(user);

        return new MfaSetupDTO(plainTextSecret, qrData.getUri());
    }

    @Transactional
    public MfaActivationDTO verifyMfa(String code) {
        User user = authService.authenticated();

        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new IllegalStateException("MFA já está ativado para este usuário.");
        }

        try {
            String encryptedSecret = user.getMfaSecret();
            String plainTextSecret = textEncryptor.decrypt(encryptedSecret);

            if (!codeVerifier.isValidCode(plainTextSecret, code)) {
                throw new IllegalArgumentException("Código de verificação inválido.");
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Código de verificação inválido ou falha na decifragem.", e);
        }

        user.setMfaEnabled(true);
        userRepository.save(user);

        return generateAndSaveRecoveryCodes(user);
    }

    private MfaActivationDTO generateAndSaveRecoveryCodes(User user) {
        recoveryCodeRepository.deleteByUser(user);

        String[] plainTextCodes = recoveryCodeGenerator.generateCodes(10);

        List<UserRecoveryCode> codesToSave = Arrays.stream(plainTextCodes)
                .map(code -> {
                    String hashedCode = passwordEncoder.encode(code);
                    return new UserRecoveryCode(hashedCode, user);
                })
                .collect(Collectors.toList());

        recoveryCodeRepository.saveAll(codesToSave);

        return new MfaActivationDTO(Arrays.asList(plainTextCodes));
    }

    @Transactional
    public boolean validateRecoveryCode(User user, String recoveryCode) {
        List<UserRecoveryCode> userCodes = recoveryCodeRepository.findByUser(user);

        for (UserRecoveryCode storedCode : userCodes) {
            if (passwordEncoder.matches(recoveryCode, storedCode.getHashedCode())) {
                recoveryCodeRepository.delete(storedCode);
                return true;
            }
        }

        return false;
    }

    @Transactional
    public void disableMfa() {
        User user = authService.authenticated();

        if (!Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new IllegalStateException("MFA não está ativado para este usuário.");
        }

        recoveryCodeRepository.deleteByUser(user);

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
    }

    @Transactional
    public MfaActivationDTO regenerateRecoveryCodes() {
        User user = authService.authenticated();

        if (!Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new IllegalStateException("MFA não está ativado para este usuário.");
        }

        return generateAndSaveRecoveryCodes(user);
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public User verifyLoginMfa(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (!Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new IllegalStateException("MFA não está ativado para este usuário.");
        }

        try {
            String plainTextSecret = textEncryptor.decrypt(user.getMfaSecret());
            if (codeVerifier.isValidCode(plainTextSecret, code)) {
                return user;
            }
        } catch (Exception e) {
            // Falha na decifragem, tenta código de recuperação
        }

        if (validateRecoveryCode(user, code)) {
            return user;
        }

        throw new IllegalArgumentException("Código de verificação ou recuperação inválido.");
    }
}