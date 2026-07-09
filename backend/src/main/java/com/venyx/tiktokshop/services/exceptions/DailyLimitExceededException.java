package com.venyx.tiktokshop.services.exceptions;

public class DailyLimitExceededException extends RuntimeException {
    public DailyLimitExceededException(String msg) {
        super(msg);
    }
}
