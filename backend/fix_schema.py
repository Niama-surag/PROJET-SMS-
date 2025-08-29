import psycopg2

try:
    # Database connection
    conn = psycopg2.connect(
        host="localhost",
        database="APP-SMS",
        user="postgres",
        password="Kxsd2882"
    )
    cur = conn.cursor()
    
    print("🔧 Updating Database Schema...")
    print("=" * 40)
    
    # Add missing columns to contacts table
    missing_columns = [
        ("email", "VARCHAR(255)"),
        ("ville", "VARCHAR(100)"),
        ("region", "VARCHAR(100)"),
        ("code_postal", "VARCHAR(10)"),
        ("type_client", "VARCHAR(50)"),
        ("age", "INTEGER"),
        ("genre", "VARCHAR(1)"),
        ("date_inscription", "TIMESTAMP DEFAULT NOW()"),
        ("derniere_activite", "TIMESTAMP"),
        ("source", "VARCHAR(100)"),
        ("notes", "TEXT")
    ]
    
    for column_name, column_type in missing_columns:
        try:
            # Check if column exists
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'contacts' AND column_name = %s;
            """, (column_name,))
            
            if not cur.fetchone():
                # Add the column if it doesn't exist
                alter_query = f"ALTER TABLE contacts ADD COLUMN {column_name} {column_type};"
                cur.execute(alter_query)
                print(f"✅ Added column: {column_name}")
            else:
                print(f"⚠️  Column already exists: {column_name}")
                
        except Exception as e:
            print(f"❌ Error adding {column_name}: {e}")
    
    # Commit changes
    conn.commit()
    
    # Verify the updated structure
    print("\n📋 Updated Table Structure:")
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'contacts'
        ORDER BY ordinal_position;
    """)
    
    columns = cur.fetchall()
    for col in columns:
        print(f"  {col[0]:<25} | {col[1]}")
    
    cur.close()
    conn.close()
    
    print("\n🎉 Database schema updated successfully!")
    
except Exception as e:
    print(f"❌ Database error: {e}")
