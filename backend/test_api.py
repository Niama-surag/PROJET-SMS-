import psycopg2

try:
    # Establish a connection to the database
    conn = psycopg2.connect(
        host="localhost",
        database="Project",
        user="root",
        password="ayoub25"
    )

    # Create a cursor object to execute SQL queries
    cur = conn.cursor()

    print("Connection to PostgreSQL established successfully!")

    # Close the cursor and connection when you're done
    cur.close()
    conn.close()

except (Exception, psycopg2.Error) as error:
    print("Error while connecting to PostgreSQL:", error)