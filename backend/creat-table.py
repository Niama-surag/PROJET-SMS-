from database import Base, engine
from models import (
    User, Message, MailingList, Contact, Campagne, 
    CampaignReport, MessageTemplate, mailinglist_contact
)
import psycopg2
from sqlalchemy import text

def test_connection():
    """Test the database connection"""
    try:
        # Test basic connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Connexion à PostgreSQL réussie!")
            return True
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def create_tables():
    """Create all database tables"""
    try:
        print("🔄 Création des tables en cours...")
        Base.metadata.create_all(bind=engine)
        print("✅ Toutes les tables ont été créées avec succès!")
        
        # List created tables
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            print("\n📋 Tables créées:")
            for table in tables:
                print(f"   - {table[0]}")
                
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables: {e}")

if __name__ == "__main__":
    print("🚀 Initialisation de la base de données SMS Campaign Platform")
    print("=" * 60)
    
    if test_connection():
        create_tables()
        print("\n✅ Initialisation terminée avec succès!")
    else:
        print("\n❌ Échec de l'initialisation - vérifiez votre configuration PostgreSQL")
