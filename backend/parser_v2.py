import os
import json
import mysql.connector
from mysql.connector import Error
import geoip2.database
from geoip2.errors import AddressNotFoundError
from dotenv imort load_dotenv
load_dotenv()

# 1. Configuration file paths
LOG_FILE = os.path.expanduser("~/honey_logs/cowrie/cowrie.json")
# Assuming GeoLite2-City.mmdb is in the same directory as this Python script
GEO_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'GeoLite2-City.mmdb')

def get_geo_info(reader, ip_address):
    """
    Core GeoIP Engine: 
    Converts an IP address into geographic coordinates (latitude/longitude) and location data.
    """
    if not ip_address:
        return {'country': 'Unknown', 'city': 'Unknown', 'latitude': None, 'longitude': None}
        
    try:
        response = reader.city(ip_address)
        return {
            'country': response.country.name or 'Unknown',
            'city': response.city.name or 'Unknown',
            'latitude': response.location.latitude,
            'longitude': response.location.longitude
        }
    except AddressNotFoundError:
        # Handles internal LAN IPs or IPs not present in the database
        return {'country': 'Unknown', 'city': 'Unknown', 'latitude': None, 'longitude': None}
    except Exception as e:
        return {'country': 'Unknown', 'city': 'Unknown', 'latitude': None, 'longitude': None}

def analyze_and_store_logs():
    print("="*60)
    print("[*] EdgeGuard Threat Intelligence Extraction & GeoIP Engine Starting...")
    print("="*60)
    
    inserted_count = 0
    geo_reader = None
    connection = None
    
    # Attempt to load the offline GeoIP database
    try:
        geo_reader = geoip2.database.Reader(GEO_DB_PATH)
        print("[+] GeoLite2 Database loaded successfully.")
    except Exception as e:
        print(f"[-] Failed to load GeoLite2 database: {e}")
        print("    Please ensure 'GeoLite2-City.mmdb' is in the same directory.")
        return

    # 1. Try connecting to the MySQL database
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', '127.0.0.1'),
            port=int(os.getenv('DB_PORT', 3306)),
            database=os.getenv('DB_NAME', 'edgeguard'),
            user=os.getenv('DB_USER','root'),
            password=os.getenv('DB_PASS', ''),
            ssl_disabled=True
        )
        if connection.is_connected():
            print("[+] Successfully connected to local MySQL database: edgeguard")
            cursor = connection.cursor()
            
            # 2. Parse logs, extract GeoIP, and insert into the database
            print("[*] Parsing logs, extracting GeoIP data, and inserting into database...")
            with open(LOG_FILE, 'r') as f:
                for line in f:
                    try:
                        data = json.loads(line.strip())
                        event = data.get("eventid")
                        
                        # Predefined event types to capture
                        valid_events = [
                            "cowrie.session.connect",
                            "cowrie.login.failed",
                            "cowrie.login.success",
                            "cowrie.command.input"
                        ]
                        
                        if event in valid_events:
                            src_ip = data.get("src_ip", "")
                            username = data.get("username", "")
                            password = data.get("password", "")
                            command = data.get("input", "")
                            
                            # 🔥 Core Upgrade: Call GeoIP engine to resolve coordinates
                            geo = get_geo_info(geo_reader, src_ip)
                            
                            # 🔥 Core Upgrade: SQL statement with 4 new geolocation fields
                            insert_query = """
                            INSERT INTO attacks 
                            (event_type, src_ip, username, password, command, country, city, latitude, longitude) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """
                            
                            record = (
                                event, src_ip, username, password, command, 
                                geo['country'], geo['city'], geo['latitude'], geo['longitude']
                            )
                            
                            cursor.execute(insert_query, record)
                            inserted_count += 1
                            
                    except json.JSONDecodeError:
                        continue
            
            # Commit the transaction to save changes
            connection.commit()
            print(f"\n[+] Success! Inserted {inserted_count} enriched attack records into the database.")
            
    except Error as e:
        print(f"[-] Database connection failed: {e}")
    except FileNotFoundError:
        print(f"\n[!] Error: Log file not found at {LOG_FILE}")
    finally:
        # 3. Safely close database and file connections
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("[*] Database connection closed safely.")
        if geo_reader:
            geo_reader.close()

if __name__ == "__main__":
    analyze_and_store_logs()
