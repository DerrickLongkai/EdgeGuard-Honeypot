from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASS', ''),
    'database': os.getenv('DB_NAME', 'edgeguard')
}

app = Flask(__name__)
# Allow all cross‑origin requests to make frontend debugging easier
CORS(app)

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# API route: fetch global attack source coordinates
@app.route('/api/map-data', methods=['GET'])
def get_map_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # Dictionary cursor returns rows as JSON‑friendly dicts
        
        # Query attack records that contain valid latitude and longitude
        query = """
            SELECT src_ip, country, city, latitude, longitude 
            FROM attacks 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """
        cursor.execute(query)
        data = cursor.fetchall()
        
        return jsonify({
            "status": "success",
            "count": len(data),
            "data": data
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

#API route: fetch top 10 attack source IPs
@app.route('/api/top-ips', methods=['GET'])
def get_top_ips():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        #SQL Logic: Group by IP, count occurrences, sort descending, limit to 10
        query = """
            SELECT src_ip, COUNT(*) as attack_count, country
            FROM attacks
            GROUP BY src_ip, country
            ORDER BY attack_count DESC
            LIMIT 10
        """
        cursor.execute(query)
        data = cursor.fetchall()

        return jsonify({
            "status": "success",
            "data": data
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close();
            conn.close();

# API route: fetch top passwords for word cloud
@app.route('/api/passwords', methods=['GET'])
def get_passwords():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # fetch non-empty passwords, in descading order, up to 30
        query = """
            SELECT password, COUNT(*) as count 
            FROM attacks
            WHERE password IS NOT NULL AND password != ''
            GROUP BY password
            ORDER BY count DESC
            LIMIT 30
        """
        cursor.execute(query)
        data = cursor.fetchall()

        return jsonify({
            "status": "success",
            "data": data
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == '__main__':
    # Enable debug mode and listen on 0.0.0.0 so the host machine can access it
    app.run(host='0.0.0.0', port=5000, debug=True)
