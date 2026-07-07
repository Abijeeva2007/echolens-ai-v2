from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.helpers import hash_password
from app.utils.helpers import verify_password
from app.utils.jwt_handler import create_access_token

def create_user(db: Session, user: UserCreate):

    existing = db.query(User).filter(User.email == user.email).first()

    if existing:
        return None

    new_user = User(
    username=user.username,
    email=user.email,
    hashed_password=hash_password(user.password)   # ✅ correct
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
def login_user(db, user):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user is None:
        return None

    if not verify_password(user.password, existing_user.hashed_password):
        return None

    token = create_access_token(
        {
            "sub": existing_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }