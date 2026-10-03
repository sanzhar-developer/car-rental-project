package com.example.carrentalbackend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        boolean isValid = password.matches(PASSWORD_PATTERN);

        if (!isValid) {
            context.disableDefaultConstraintViolation();

            StringBuilder message = new StringBuilder("Password must contain: ");
            boolean first = true;

            if (!password.matches(".*[a-z].*")) {
                message.append("at least one lowercase letter");
                first = false;
            }
            if (!password.matches(".*[A-Z].*")) {
                if (!first) message.append(", ");
                message.append("at least one uppercase letter");
                first = false;
            }
            if (!password.matches(".*\\d.*")) {
                if (!first) message.append(", ");
                message.append("at least one digit");
                first = false;
            }
            if (!password.matches(".*[@$!%*?&#].*")) {
                if (!first) message.append(", ");
                message.append("at least one special character (@$!%*?&#)");
                first = false;
            }
            if (password.length() < 8) {
                if (!first) message.append(", ");
                message.append("minimum 8 characters");
            }

            context.buildConstraintViolationWithTemplate(message.toString())
                   .addConstraintViolation();
        }

        return isValid;
    }
}
