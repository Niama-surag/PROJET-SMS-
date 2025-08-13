from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Database URL - update with your PostgreSQL credentials
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:your_password@localhost/your_database"

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()
# Création des tables dans la base
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès")

from models import user


# Dependency to get DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
