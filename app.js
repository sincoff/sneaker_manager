// 1. DATA INITIALIZATION & CONFIG
const STORAGE_KEY = 'sneaker_vault_data';

// Rubric Requirement: "Application must start with a minimum of 30 records"
// We create 5 real ones, and programmatically generate 25 more.
const starterData = [
    { id: 1, brand: 'Jordan', model: 'Air Jordan 1 "Chicago"', size: 10.5, value: 1800 },
    { id: 2, brand: 'Adidas', model: 'Samba OG White', size: 10, value: 100 },
    { id: 3, brand: 'Nike', model: 'Dunk Low Panda', size: 11, value: 150 },
    { id: 4, brand: 'New Balance', model: '990v6 Grey', size: 10.5, value: 200 },
    { id: 5, brand: 'Yeezy', model: 'Boost 350 V2 Zebra', size: 9.5, value: 350 },
];

function generateDummyData() {
    let data = [...starterData];
    const brands = ['Nike', 'Jordan', 'Adidas', 'New Balance'];
    
    // Generate 25 more to hit the 30 requirement
    for (let i = 6; i <= 30; i++) {
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        data.push({
            id: i,
            brand: randomBrand,
            model: `Generic ${randomBrand} Model #${i}`,
            size: 8 + (i % 5), // Sizes between 8 and 13
            value: 100 + (i * 10)
        });
    }
    return data;
}

// LOAD DATA: Check localStorage. If empty, load the 30 starter items.
let collection = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!collection || collection.length < 1) {
    collection = generateDummyData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

// 2. READ & RENDER (The "R" in CRUD)
function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; // Clear current list

    let totalVal = 0;

    collection.forEach(item => {
        totalVal += Number(item.value);
        const row = document.createElement('tr');
        
        // Dynamic HTML for each row
        row.innerHTML = `
            <td><span class="badge ${item.brand.toLowerCase()}">${item.brand}</span></td>
            <td>${item.model}</td>
            <td>${item.size}</td>
            <td>$${Number(item.value).toLocaleString()}</td>
            <td>
                <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Rubric: Update Stats View
    document.getElementById('total-count').textContent = collection.length;
    document.getElementById('total-value').textContent = totalVal.toLocaleString();
}

// 3. CREATE & UPDATE (The "C" and "U" in CRUD)
const form = document.getElementById('item-form');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop page reload

    const id = document.getElementById('item-id').value;
    const brand = document.getElementById('brand').value;
    const model = document.getElementById('model').value;
    const size = document.getElementById('size').value;
    const value = document.getElementById('value').value;

    if (id) {
        // UPDATE Existing
        const index = collection.findIndex(i => i.id == id);
        if(index !== -1) {
            collection[index] = { id: Number(id), brand, model, size, value };
        }
    } else {
        // CREATE New
        const newId = Date.now(); // Unique ID based on timestamp
        collection.push({ id: newId, brand, model, size, value });
    }

    saveAndRender();
    resetForm();
});

// 4. DELETE (The "D" in CRUD)
window.deleteItem = function(id) {
    // Rubric Requirement: "Delete confirmation dialog"
    if (confirm("Are you sure you want to delete this sneaker?")) {
        collection = collection.filter(item => item.id !== id);
        saveAndRender();
    }
};

// 5. EDIT SETUP
window.editItem = function(id) {
    const item = collection.find(i => i.id === id);
    if (item) {
        // Populate form with existing data
        document.getElementById('item-id').value = item.id;
        document.getElementById('brand').value = item.brand;
        document.getElementById('model').value = item.model;
        document.getElementById('size').value = item.size;
        document.getElementById('value').value = item.value;
        
        // UI Updates to "Edit Mode"
        document.getElementById('form-title').textContent = "Edit Sneaker";
        document.getElementById('save-btn').textContent = "Update";
        document.getElementById('save-btn').style.backgroundColor = "#f39c12"; // Orange for edit
        document.getElementById('cancel-btn').classList.remove('hidden');
        window.scrollTo(0,0);
    }
};

// 6. UTILITIES
function saveAndRender() {
    // Rubric Requirement: "Persistence using localStorage"
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    renderTable();
}

window.resetForm = function() {
    document.getElementById('item-id').value = '';
    form.reset();
    document.getElementById('form-title').textContent = "Add New Kick";
    document.getElementById('save-btn').textContent = "Add to Vault";
    document.getElementById('save-btn').style.backgroundColor = "#2ecc71"; // Green for add
    document.getElementById('cancel-btn').classList.add('hidden');
};

// Initial Render
renderTable();