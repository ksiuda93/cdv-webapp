"""Business logic services."""

from decimal import Decimal
from typing import Optional

from sqlalchemy.exc import IntegrityError

from app.models import User, db


class UserService:
    """Service class for user-related operations."""

    @staticmethod
    def create_user(
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        account_balance: Decimal = Decimal("0.00"),
    ) -> tuple[Optional[User], Optional[str]]:
        """Create a new user.

        Args:
            first_name: User's first name
            last_name: User's last name
            email: User's email address
            password: Plain text password (will be hashed)
            account_balance: Initial account balance

        Returns:
            Tuple of (User object, error message). If successful, error is None.
            If failed, User is None and error contains the message.
        """
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return None, "User with this email already exists"

        try:
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                account_balance=account_balance,
            )
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            return user, None

        except IntegrityError:
            db.session.rollback()
            return None, "User with this email already exists"
        except Exception as e:
            db.session.rollback()
            return None, f"An error occurred: {str(e)}"

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        """Get user by ID.

        Args:
            user_id: User's ID

        Returns:
            User object if found, None otherwise
        """
        return User.query.get(user_id)

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """Get user by email.

        Args:
            email: User's email address

        Returns:
            User object if found, None otherwise
        """
        return User.query.filter_by(email=email).first()

    @staticmethod
    def authenticate(email: str, password: str) -> Optional[User]:
        """Authenticate a user.

        Args:
            email: User's email address
            password: Plain text password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = UserService.get_by_email(email)
        if user and user.check_password(password):
            return user
        return None

    @staticmethod
    def update_user(
        user_id: int,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> tuple[Optional[User], Optional[str]]:
        """Update user profile.

        Args:
            user_id: User's ID
            first_name: New first name (optional)
            last_name: New last name (optional)
            email: New email address (optional)

        Returns:
            Tuple of (User object, error message). If successful, error is None.
            If failed, User is None and error contains the message.
        """
        user = UserService.get_by_id(user_id)
        if not user:
            return None, "User not found"

        try:
            # Check if email is being changed and if it's already taken
            if email and email != user.email:
                existing_user = User.query.filter_by(email=email).first()
                if existing_user:
                    return None, "Email already in use"
                user.email = email

            if first_name:
                user.first_name = first_name

            if last_name:
                user.last_name = last_name

            db.session.commit()
            return user, None

        except IntegrityError:
            db.session.rollback()
            return None, "Email already in use"
        except Exception as e:
            db.session.rollback()
            return None, f"An error occurred: {str(e)}"

    @staticmethod
    def get_balance(user_id: int) -> tuple[Optional[Decimal], Optional[str]]:
        """Get user's account balance.

        Args:
            user_id: User's ID

        Returns:
            Tuple of (balance, error message). If successful, error is None.
            If failed, balance is None and error contains the message.
        """
        user = UserService.get_by_id(user_id)
        if not user:
            return None, "User not found"

        return user.account_balance, None
