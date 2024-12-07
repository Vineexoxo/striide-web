import psycopg2
from psycopg2 import sql

# Connection details
connection_string = "postgresql://cb2s42:xau_1d9LHuNg9qIh0dpuA14x1URryIQ5soOr3@us-east-1.sql.xata.sh/striide:main?sslmode=require"

# Connect to the PostgreSQL database
conn = psycopg2.connect(connection_string)
cur = conn.cursor()

# Show all databases
cur.execute("SELECT datname FROM pg_database;")
databases = cur.fetchall()
print("Databases:")
for db in databases:
    print(db[0])

# Show all tables in the current database
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
""")
tables = cur.fetchall()
print("\nTables in the current database:")
for table in tables:
    print(table[0])

# Close the cursor and connection
cur.close()
conn.close()