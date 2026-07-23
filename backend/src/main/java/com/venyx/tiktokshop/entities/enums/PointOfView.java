package com.venyx.tiktokshop.entities.enums;

public enum PointOfView {
    SELFIE("ponto de vista de selfie, como se o próprio avatar segurasse o celular"),
    FRONTAL("câmera frontal em terceira pessoa, à altura dos olhos"),
    CLOSE_UP("close-up aproximado no rosto e no produto"),
    WIDE("plano aberto mostrando o ambiente ao redor");

    private final String description;
    PointOfView(String description) { this.description = description; }
    public String getDescription() { return description; }
}