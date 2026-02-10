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
# Reliable image URLs (Unsplash allows hotlinking; Picsum as backup for variety)
SNEAKER_IMAGES = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",  # Nike
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",  # Jordan
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400",  # Adidas
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400",  # Nike
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",  # Nike Air
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400",  # Sneakers
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",  # Nike
    "https://images.unsplash.com/photo-1549289524-e30e5f2a6a22?w=400",  # Shoes
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400",  # Sneakers
    "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400",  # Jordans
    "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=400",  # Nike
    "https://images.unsplash.com/photo-1584735175097-719d848f8449?w=400",  # Running
    "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=400",  # Nike
    "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400",  # Sneakers
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400",  # Nike
    "https://picsum.photos/seed/sneaker16/400/400",  # Variety
    "https://picsum.photos/seed/sneaker17/400/400",
    "https://picsum.photos/seed/sneaker18/400/400",
    "https://picsum.photos/seed/sneaker19/400/400",
    "https://picsum.photos/seed/sneaker20/400/400",
    "https://picsum.photos/seed/sneaker21/400/400",
    "https://picsum.photos/seed/sneaker22/400/400",
    "https://picsum.photos/seed/sneaker23/400/400",
    "https://picsum.photos/seed/sneaker24/400/400",
    "https://picsum.photos/seed/sneaker25/400/400",
    "https://picsum.photos/seed/sneaker26/400/400",
    "https://picsum.photos/seed/sneaker27/400/400",
    "https://picsum.photos/seed/sneaker28/400/400",
    "https://picsum.photos/seed/sneaker29/400/400",
    "https://picsum.photos/seed/sneaker30/400/400",
]

def seed_database():
    if Sneaker.query.count() < 30:
        base_sneakers = [
            {"brand": "Jordan", "model": "Chicago 1s", "size": 10, "value": 1500, "image_url": SNEAKER_IMAGES[1]},
            {"brand": "Nike", "model": "Dunk Low Panda", "size": 11, "value": 120, "image_url": SNEAKER_IMAGES[0]},
            {"brand": "Adidas", "model": "Samba OG", "size": 9, "value": 90, "image_url": SNEAKER_IMAGES[2]},
            {"brand": "Yeezy", "model": "Boost 350", "size": 10.5, "value": 300, "image_url": SNEAKER_IMAGES[3]},
            {"brand": "New Balance", "model": "550 White", "size": 10, "value": 110, "image_url": SNEAKER_IMAGES[4]}
        ]

        for s in base_sneakers:
            db.session.add(Sneaker(**s))

        for i in range(6, 31):
            db.session.add(Sneaker(
                brand="Nike",
                model=f"Generic Air Max {i}",
                size=10.0,
                value=100 + (i * 5),
                image_url=SNEAKER_IMAGES[(i - 1) % len(SNEAKER_IMAGES)]
            ))
        db.session.commit()
        print("Database seeded with 30 records!")

    # Repair existing records with broken/empty StockX URLs
    broken = Sneaker.query.filter(
        or_(Sneaker.image_url.is_(None), Sneaker.image_url == "", Sneaker.image_url.like("%stockx%"))
    ).all()
    if broken:
        for i, s in enumerate(broken):
            s.image_url = SNEAKER_IMAGES[i % len(SNEAKER_IMAGES)]
        db.session.commit()
        print(f"Repaired {len(broken)} records with broken/missing image URLs.")

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