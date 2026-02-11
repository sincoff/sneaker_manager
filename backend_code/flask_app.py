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
# All Unsplash sneaker/shoe images (no Picsum - those show random content)
SNEAKER_IMAGES = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",  # Red Nike runner
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",  # White Nike high-top
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400",  # Nike pair on dark bg
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400",  # Green Nike pair
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",  # White Nike AF1
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400",  # Running shoe close-up
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",  # Orange Nike shoe
    "https://images.unsplash.com/photo-1549289524-e30e5f2a6a22?w=400",  # Sneaker shelf
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400",  # Jordan colorway
    "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400",  # Jordans hanging
    "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=400",  # Nike sneaker profile
    "https://images.unsplash.com/photo-1584735175097-719d848f8449?w=400",  # Running shoes
    "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=400",  # Nike React
    "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400",  # Sneaker on concrete
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400",  # Nike Dunk
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",  # Sneaker collection
    "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400",  # Jordan 1 pair
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",  # Orange Nike runner
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400",  # Colorful Nike
    "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400",  # Nike AF1 white
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400",  # Jordan 1 bred
    "https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=400",  # Adidas sneaker
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400",  # Nike running shoe
    "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400",  # Sneaker on yellow
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400",  # Colorful sneakers
    "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400",  # Converse pair
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",  # Vans classic
    "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=400",  # Running shoes
    "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400",  # Stacked sneakers
    "https://images.unsplash.com/photo-1612902456551-404b9a18b1e8?w=400",  # White sneaker pair
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

    # Repair existing records with broken/empty/non-sneaker image URLs
    broken = Sneaker.query.filter(
        or_(Sneaker.image_url.is_(None), Sneaker.image_url == "",
            Sneaker.image_url.like("%stockx%"), Sneaker.image_url.like("%picsum%"))
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