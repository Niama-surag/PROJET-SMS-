import pandas as pd
import io
from typing import List, Dict, Any
from schemas import ContactCreate, FileImportResult
from sqlalchemy.orm import Session
import crud
import re

def validate_phone_number(phone: str) -> str:
    """Valide et formate un numéro de téléphone"""
    if not phone:
        raise ValueError("Numéro de téléphone requis")
    
    # Supprimer les espaces et caractères spéciaux
    cleaned_phone = re.sub(r'[^\d+]', '', str(phone))
    
    # Vérifier le format (exemple pour numéros français/internationaux)
    if not re.match(r'^(\+33|0)[1-9][\d]{8}$|^\+\d{10,15}$', cleaned_phone):
        # Format plus flexible pour autres pays
        if len(cleaned_phone) < 8 or len(cleaned_phone) > 15:
            raise ValueError(f"Numéro de téléphone invalide: {phone}")
    
    return cleaned_phone

def validate_email(email: str) -> str:
    """Valide un email"""
    if email and not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        raise ValueError(f"Email invalide: {email}")
    return email

def clean_and_validate_contact_data(row_data: Dict[str, Any]) -> ContactCreate:
    """Nettoie et valide les données d'un contact"""
    
    # Mapping des colonnes possibles
    column_mapping = {
        'nom': ['nom', 'last_name', 'lastname', 'family_name', 'surname'],
        'prenom': ['prenom', 'first_name', 'firstname', 'given_name', 'prenom'],
        'numero_telephone': ['numero_telephone', 'telephone', 'phone', 'mobile', 'tel', 'numero'],
        'email': ['email', 'e-mail', 'mail', 'adresse_email'],
        'ville': ['ville', 'city', 'town'],
        'region': ['region', 'state', 'province', 'departement'],
        'code_postal': ['code_postal', 'postal_code', 'zip', 'cp'],
        'type_client': ['type_client', 'customer_type', 'client_type', 'type'],
        'age': ['age', 'years', 'ans'],
        'genre': ['genre', 'gender', 'sex', 'sexe']
    }
    
    # Normaliser les clés (minuscules, sans espaces)
    normalized_data = {}
    for key, value in row_data.items():
        if pd.notna(value):  # Ignorer les valeurs NaN
            normalized_key = str(key).lower().strip().replace(' ', '_')
            normalized_data[normalized_key] = str(value).strip()
    
    # Extraire les données en utilisant le mapping
    extracted_data = {}
    for target_field, possible_columns in column_mapping.items():
        for col in possible_columns:
            if col in normalized_data:
                extracted_data[target_field] = normalized_data[col]
                break
    
    # Validation et nettoyage
    try:
        nom = extracted_data.get('nom', '').title()
        prenom = extracted_data.get('prenom', '').title()
        
        if not nom or not prenom:
            raise ValueError("Nom et prénom requis")
        
        numero_telephone = validate_phone_number(extracted_data.get('numero_telephone', ''))
        
        email = extracted_data.get('email')
        if email:
            email = validate_email(email.lower())
        
        # Traitement de l'âge
        age = None
        if 'age' in extracted_data:
            try:
                age = int(float(extracted_data['age']))
                if age < 0 or age > 120:
                    age = None
            except (ValueError, TypeError):
                age = None
        
        # Traitement du genre
        genre = None
        if 'genre' in extracted_data:
            genre_lower = extracted_data['genre'].lower()
            if genre_lower in ['m', 'male', 'masculin', 'homme']:
                genre = 'M'
            elif genre_lower in ['f', 'female', 'feminin', 'femme']:
                genre = 'F'
            else:
                genre = 'Other'
        
        return ContactCreate(
            nom=nom,
            prenom=prenom,
            numero_telephone=numero_telephone,
            email=email,
            ville=extracted_data.get('ville', '').title() if extracted_data.get('ville') else None,
            region=extracted_data.get('region', '').title() if extracted_data.get('region') else None,
            code_postal=extracted_data.get('code_postal'),
            type_client=extracted_data.get('type_client', 'Regular').title(),
            age=age,
            genre=genre,
            statut_opt_in=True,
            source="Import"
        )
        
    except Exception as e:
        raise ValueError(f"Erreur de validation: {str(e)}")

def process_csv_file(file_content: bytes, delimiter: str = ',') -> FileImportResult:
    """Traite un fichier CSV et retourne les résultats d'import"""
    try:
        # Lire le CSV
        df = pd.read_csv(io.BytesIO(file_content), delimiter=delimiter, encoding='utf-8')
        
        # Si l'encoding utf-8 échoue, essayer latin-1
        if df.empty:
            df = pd.read_csv(io.BytesIO(file_content), delimiter=delimiter, encoding='latin-1')
        
    except Exception as e:
        try:
            # Essayer avec un délimiteur différent
            df = pd.read_csv(io.BytesIO(file_content), delimiter=';', encoding='utf-8')
        except Exception as e2:
            return FileImportResult(
                total_rows=0,
                successful_imports=0,
                failed_imports=0,
                errors=[f"Impossible de lire le fichier CSV: {str(e)}"],
                imported_contacts=[]
            )
    
    contacts_to_create = []
    errors = []
    
    for index, row in df.iterrows():
        try:
            contact = clean_and_validate_contact_data(row.to_dict())
            contacts_to_create.append(contact)
        except Exception as e:
            errors.append(f"Ligne {index + 2}: {str(e)}")  # +2 car index commence à 0 et il y a l'en-tête
    
    return FileImportResult(
        total_rows=len(df),
        successful_imports=len(contacts_to_create),
        failed_imports=len(errors),
        errors=errors,
        imported_contacts=contacts_to_create
    )

def process_excel_file(file_content: bytes, sheet_name: str = None) -> FileImportResult:
    """Traite un fichier Excel et retourne les résultats d'import"""
    try:
        # Lire le fichier Excel
        if sheet_name:
            df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet_name)
        else:
            df = pd.read_excel(io.BytesIO(file_content))
        
    except Exception as e:
        return FileImportResult(
            total_rows=0,
            successful_imports=0,
            failed_imports=0,
            errors=[f"Impossible de lire le fichier Excel: {str(e)}"],
            imported_contacts=[]
        )
    
    contacts_to_create = []
    errors = []
    
    for index, row in df.iterrows():
        try:
            contact = clean_and_validate_contact_data(row.to_dict())
            contacts_to_create.append(contact)
        except Exception as e:
            errors.append(f"Ligne {index + 2}: {str(e)}")
    
    return FileImportResult(
        total_rows=len(df),
        successful_imports=len(contacts_to_create),
        failed_imports=len(errors),
        errors=errors,
        imported_contacts=contacts_to_create
    )

def import_contacts_to_database(db: Session, contacts: List[ContactCreate]) -> dict:
    """Importe les contacts dans la base de données"""
    return crud.bulk_create_contacts(db, contacts, source="File_Import")

def generate_import_template() -> bytes:
    """Génère un template Excel pour l'import de contacts"""
    template_data = {
        'nom': ['Dupont', 'Martin', 'Bernard'],
        'prenom': ['Jean', 'Marie', 'Pierre'],
        'numero_telephone': ['+33123456789', '0234567890', '+33345678901'],
        'email': ['jean.dupont@email.com', 'marie.martin@email.com', 'pierre.bernard@email.com'],
        'ville': ['Paris', 'Lyon', 'Marseille'],
        'region': ['Ile-de-France', 'Rhône-Alpes', 'PACA'],
        'code_postal': ['75001', '69001', '13001'],
        'type_client': ['VIP', 'Regular', 'New'],
        'age': [30, 25, 45],
        'genre': ['M', 'F', 'M']
    }
    
    df = pd.DataFrame(template_data)
    
    # Créer le fichier Excel en mémoire
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Contacts', index=False)
        
        # Ajouter une feuille d'instructions
        instructions = pd.DataFrame({
            'Champ': ['nom', 'prenom', 'numero_telephone', 'email', 'ville', 'region', 'code_postal', 'type_client', 'age', 'genre'],
            'Obligatoire': ['Oui', 'Oui', 'Oui', 'Non', 'Non', 'Non', 'Non', 'Non', 'Non', 'Non'],
            'Format': ['Texte', 'Texte', '+33123456789 ou 0123456789', 'email@domaine.com', 'Texte', 'Texte', 'Code postal', 'VIP/Regular/New', 'Nombre (18-120)', 'M/F/Other'],
            'Description': [
                'Nom de famille',
                'Prénom',
                'Numéro de téléphone avec indicatif',
                'Adresse email (optionnel)',
                'Ville de résidence',
                'Région/Département',
                'Code postal',
                'Type de client',
                'Âge en années',
                'Genre: M (Masculin), F (Féminin), Other'
            ]
        })
        instructions.to_excel(writer, sheet_name='Instructions', index=False)
    
    output.seek(0)
    return output.getvalue()
