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
    
    # Check contacts table structure
    print("📋 CONTACTS TABLE STRUCTURE:")
    print("=" * 40)
    cur.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'contacts'
        ORDER BY ordinal_position;
    """)
    
    columns = cur.fetchall()
    for col in columns:
        print(f"Column: {col[0]:<25} | Type: {col[1]:<20} | Nullable: {col[2]}")
    
    print("\n🔍 CHECKING FOR EMAIL COLUMN:")
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'email';")
    email_exists = cur.fetchone()
    
    if email_exists:
        print("✅ Email column exists")
    else:
        print("❌ Email column missing!")
    
    print("\n📊 TABLE ROW COUNT:")
    cur.execute("SELECT COUNT(*) FROM contacts;")
    count = cur.fetchone()[0]
    print(f"Total contacts: {count}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Database error: {e}")
