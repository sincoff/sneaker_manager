import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_

app = Flask(__name__)
CORS(app)

# --- 1. CONFIGURATION (Environment Variables) ---
# We get the database URL from the environment so we don't hardcode secrets.
database_url = os.environ.get('DATABASE_URL')

# SQLAlchemy requires 'postgresql://', but Neon sometimes provides 'postgres://'
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- 2. DATABASE MODEL (Schema) ---
class Sneaker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    size = db.Column(db.Float, nullable=False)
    value = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True) # Required for Part 3

# --- 3. HELPER: SEED DATA ---
def seed_database():
    if Sneaker.query.count() < 30:
        base_sneakers = [
            {"brand": "Jordan", "model": "Chicago 1s", "size": 10, "value": 1500, "image_url": "https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-2015-Product.jpg"},
            {"brand": "Nike", "model": "Dunk Low Panda", "size": 11, "value": 120, "image_url": "https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021-Product.jpg"},
            {"brand": "Adidas", "model": "Samba OG", "size": 9, "value": 90, "image_url": "https://images.stockx.com/images/adidas-Samba-OG-Cloud-White-Core-Black-Product.jpg"},
            {"brand": "Yeezy", "model": "Boost 350", "size": 10.5, "value": 300, "image_url": "https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Core-Black-Red-2017-Product.jpg"},
            {"brand": "New Balance", "model": "550 White", "size": 10, "value": 110, "image_url": "https://images.stockx.com/images/New-Balance-550-White-Grey-Product.jpg"}
        ]
        
        for s in base_sneakers:
            db.session.add(Sneaker(**s))
        
        # Add dummy records to hit the 30 minimum
        for i in range(6, 31):
            db.session.add(Sneaker(
                brand="Nike",
                model=f"Generic Air Max {i}",
                size=10.0,
                value=100 + (i * 5),
                image_url="" # Empty URL to test placeholder logic
            ))
        db.session.commit()
        print("Database seeded with 30 records!")

# Create tables and seed when the app starts
with app.app_context():
    db.create_all()
    seed_database()

# --- 4. ROUTES ---
@app.route('/sneakers', methods=['GET'])
def get_sneakers():
    # Paging Parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int) 
    
    # Search & Filter Parameters
    search_query = request.args.get('q', '', type=str)
    sort_by = request.args.get('sort', 'id', type=str) 
    
    query = Sneaker.query

    # Search Logic (Brand or Model)
    if search_query:
        search = f"%{search_query}%"
        query = query.filter(or_(Sneaker.brand.ilike(search), Sneaker.model.ilike(search)))

    # Sorting Logic
    if sort_by == 'price_asc':
        query = query.order_by(Sneaker.value.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(Sneaker.value.desc())
    elif sort_by == 'brand':
        query = query.order_by(Sneaker.brand.asc())
    else:
        query = query.order_by(Sneaker.id.desc())

    # Execute Paging
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Calculate Total Value (Domain-specific stat)
    total_value = db.session.query(db.func.sum(Sneaker.value)).scalar() or 0

    return jsonify({
        "data": [{
            "id": s.id, "brand": s.brand, "model": s.model, 
            "size": s.size, "value": s.value, "image_url": s.image_url
        } for s in pagination.items],
        "total_records": pagination.total,
        "total_pages": pagination.pages,
        "current_page": page,
        "stats": {
            "total_value": total_value,
            "count": pagination.total
        }
    })

@app.route('/sneakers', methods=['POST'])
def add_sneaker():
    data = request.json
    new_item = Sneaker(
        brand=data['brand'],
        model=data['model'],
        size=data['size'],
        value=data['value'],
        image_url=data.get('image_url', '')
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Created"}), 201

@app.route('/sneakers/<int:id>', methods=['PUT'])
def update_sneaker(id):
    item = Sneaker.query.get_or_404(id)
    data = request.json
    item.brand = data['brand']
    item.model = data['model']
    item.size = data['size']
    item.value = data['value']
    item.image_url = data.get('image_url', '')
    db.session.commit()
    return jsonify({"message": "Updated"})

@app.route('/sneakers/<int:id>', methods=['DELETE'])
def delete_sneaker(id):
    item = Sneaker.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Deleted"})

if __name__ == '__main__':
    app.run(debug=True)