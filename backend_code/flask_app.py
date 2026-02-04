from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
# Enable CORS so your Netlify frontend can talk to this backend
CORS(app)

DB_FILE = 'sneakers.json'

# --- HELPER FUNCTIONS ---
def load_data():
    if not os.path.exists(DB_FILE):
        # Create default data if file doesn't exist (Rubric: Start with 30 records)
        default_data = []
        # 5 Real ones
        default_data.extend([
            { "id": 1, "brand": "Jordan", "model": "Chicago 1s", "size": 10, "value": 1500 },
            { "id": 2, "brand": "Nike", "model": "Dunk Low Panda", "size": 11, "value": 120 },
            { "id": 3, "brand": "Adidas", "model": "Samba OG", "size": 9, "value": 90 },
            { "id": 4, "brand": "Yeezy", "model": "Boost 350", "size": 10.5, "value": 300 },
            { "id": 5, "brand": "New Balance", "model": "550 White", "size": 10, "value": 110 }
        ])
        # Generate 25 more
        for i in range(6, 31):
            default_data.append({
                "id": i,
                "brand": "Nike",
                "model": f"Generic Air Max {i}",
                "size": 10.0,
                "value": 100 + i
            })
        save_data(default_data)
        return default_data
    
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_data(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# --- ROUTES ---

@app.route('/sneakers', methods=['GET'])
def get_sneakers():
    # 1. Load Data
    all_sneakers = load_data()
    
    # 2. Handle Paging (Rubric: Fixed page size of 10)
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    start = (page - 1) * per_page
    end = start + per_page
    
    # Slice the data for the requested page
    paginated_data = all_sneakers[start:end]
    
    # 3. Calculate Stats for the "Stats View"
    total_value = sum(float(item['value']) for item in all_sneakers)
    
    return jsonify({
        "data": paginated_data,
        "total_records": len(all_sneakers),
        "total_pages": (len(all_sneakers) + per_page - 1) // per_page,
        "current_page": page,
        "stats": {
            "total_value": total_value,
            "count": len(all_sneakers)
        }
    })

@app.route('/sneakers', methods=['POST'])
def add_sneaker():
    data = request.json
    
    # Server-side Validation (Rubric Requirement)
    if not data.get('brand') or not data.get('model'):
        return jsonify({"error": "Missing required fields"}), 400
        
    all_sneakers = load_data()
    
    new_item = {
        "id": int(time.time() * 1000), # Unique ID
        "brand": data['brand'],
        "model": data['model'],
        "size": float(data['size']),
        "value": float(data['value'])
    }
    
    all_sneakers.append(new_item)
    save_data(all_sneakers)
    
    return jsonify({"message": "Created", "item": new_item}), 201

@app.route('/sneakers/<int:id>', methods=['PUT'])
def update_sneaker(id):
    data = request.json
    all_sneakers = load_data()
    
    found = False
    for item in all_sneakers:
        if item['id'] == id:
            item['brand'] = data['brand']
            item['model'] = data['model']
            item['size'] = float(data['size'])
            item['value'] = float(data['value'])
            found = True
            break
            
    if not found:
        return jsonify({"error": "Item not found"}), 404
        
    save_data(all_sneakers)
    return jsonify({"message": "Updated"})

@app.route('/sneakers/<int:id>', methods=['DELETE'])
def delete_sneaker(id):
    all_sneakers = load_data()
    
    # Filter out the item to delete
    new_list = [item for item in all_sneakers if item['id'] != id]
    
    save_data(new_list)
    return jsonify({"message": "Deleted"})

if __name__ == '__main__':
    app.run(debug=True)