"""Database models for the bank application."""

from datetime import datetime, timezone
from decimal import Decimal

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model representing bank customers.

    Attributes:
        id: Primary key
        first_name: User's first name (imię)
        last_name: User's last name (nazwisko)
        email: Unique email address
        password_hash: Hashed password
        account_balance: Bank account balance (stan konta)
        created_at: Timestamp of account creation
        updated_at: Timestamp of last update
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    account_balance = db.Column(
        db.Numeric(precision=15, scale=2),
        nullable=False,
        default=Decimal("0.00")
    )
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def set_password(self, password: str) -> None:
        """Hash and set the user's password.

        Args:
            password: Plain text password to hash
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify a password against the stored hash.

        Args:
            password: Plain text password to verify

        Returns:
            True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_balance: bool = False) -> dict:
        """Convert user object to dictionary.

        Args:
            include_balance: Whether to include account balance in output

        Returns:
            Dictionary representation of user (without sensitive data)
        """
        data = {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

        if include_balance:
            data["account_balance"] = str(self.account_balance)

        return data

    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User {self.email}>"
