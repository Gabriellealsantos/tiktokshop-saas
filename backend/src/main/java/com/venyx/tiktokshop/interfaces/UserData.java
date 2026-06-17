package com.venyx.tiktokshop.interfaces;

/**
 * Contrato comum dos DTOs de entrada de usuário (insert/update).
 * Permite que o service copie os dados para a entidade sem depender do tipo concreto.
 */
public interface UserData {

    String name();

    String cpf();

    String phoneNumber();

    String email();
}
