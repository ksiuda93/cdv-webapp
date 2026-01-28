"""Marshmallow schemas for input validation."""

from marshmallow import Schema, ValidationError, fields, validate, validates


class RegisterSchema(Schema):
    """Schema for user registration validation."""

    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100),
        error_messages={"required": "First name is required"},
    )
    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100),
        error_messages={"required": "Last name is required"},
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required"},
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        error_messages={
            "required": "Password is required",
            "invalid": "Password must be at least 8 characters long",
        },
    )
    account_balance = fields.Decimal(
        places=2,
        required=False,
        validate=validate.Range(min=0),
        load_default="0.00",
    )

    @validates("email")
    def validate_email(self, value: str) -> None:
        """Validate email format and length.

        Args:
            value: Email address to validate

        Raises:
            ValidationError: If email is invalid
        """
        if len(value) > 120:
            raise ValidationError("Email must not exceed 120 characters")


class LoginSchema(Schema):
    """Schema for user login validation."""

    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required"},
    )
    password = fields.Str(
        required=True,
        error_messages={"required": "Password is required"},
    )


class UpdateUserSchema(Schema):
    """Schema for updating user profile."""

    first_name = fields.Str(
        required=False,
        validate=validate.Length(min=1, max=100),
    )
    last_name = fields.Str(
        required=False,
        validate=validate.Length(min=1, max=100),
    )
    email = fields.Email(required=False)

    @validates("email")
    def validate_email(self, value: str) -> None:
        """Validate email format and length.

        Args:
            value: Email address to validate

        Raises:
            ValidationError: If email is invalid
        """
        if len(value) > 120:
            raise ValidationError("Email must not exceed 120 characters")
