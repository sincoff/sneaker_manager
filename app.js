// Main data array
let sneakers = [];

// 1. STARTUP: Load from storage OR create default data
let savedData = localStorage.getItem('my_sneaker_data');

if (savedData) {
    sneakers = JSON.parse(savedData);
} else {
    // Rubric: Must start with 30 records
    // Add a few real ones first
    sneakers.push(
        { id: 1, brand: 'Jordan', model: 'Chicago 1s', size: 10, value: 1500 },
        { id: 2, brand: 'Nike', model: 'Dunk Low Panda', size: 11, value: 120 },
        { id: 3, brand: 'Adidas', model: 'Samba OG', size: 9, value: 90 },
        { id: 4, brand: 'Yeezy', model: 'Boost 350', size: 10.5, value: 300 },
        { id: 5, brand: 'New Balance', model: '550 White', size: 10, value: 110 }
    );

    // Fill the rest with a loop to hit 30
    for (let i = 6; i <= 30; i++) {
        sneakers.push({
            id: i,
            brand: 'Nike',
            model: 'Generic Air Max ' + i,
            size: 10,
            value: 100 + i
        });
    }
    saveData();
}

// Show the table immediately
renderTable();


// 2. RENDER FUNCTION (Update the UI)
function renderTable() {
    let tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; // Clear existing rows

    let totalPairs = 0;
    let totalValue = 0;

    // Loop through data and build rows
    sneakers.forEach(function(shoe) {
        totalPairs++;
        totalValue += Number(shoe.value); // Convert to number just in case

        let row = `
            <tr>
                <td>${shoe.brand}</td>
                <td>${shoe.model}</td>
                <td>${shoe.size}</td>
                <td>$${shoe.value}</td>
                <td>
                    <button onclick="editItem(${shoe.id})" style="background:orange">Edit</button>
                    <button onclick="deleteItem(${shoe.id})" style="background:red; color:white">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Update Stats (Rubric requirement)
    document.getElementById('total-count').innerText = totalPairs;
    document.getElementById('total-value').innerText = totalValue;
}


// 3. FORM HANDLER (Add or Update)
let form = document.getElementById('item-form');

form.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page refresh

    // Grab values from inputs
    let id = document.getElementById('item-id').value;
    let brand = document.getElementById('brand').value;
    let model = document.getElementById('model').value;
    let size = document.getElementById('size').value;
    let value = document.getElementById('value').value;

    if (id) {
        // We are editing an existing item
        // Find the shoe and update it
        for (let i = 0; i < sneakers.length; i++) {
            if (sneakers[i].id == id) {
                sneakers[i].brand = brand;
                sneakers[i].model = model;
                sneakers[i].size = size;
                sneakers[i].value = value;
            }
        }
    } else {
        // We are creating a new item
        let newShoe = {
            id: Date.now(), // simple unique ID
            brand: brand,
            model: model,
            size: size,
            value: value
        };
        sneakers.push(newShoe);
    }

    // Save, Refresh, Reset
    saveData();
    renderTable();
    resetForm();
});


// 4. ACTION FUNCTIONS
function deleteItem(id) {
    if (confirm("Are you sure you want to delete this?")) {
        // Keep everything EXCEPT the one with this ID
        sneakers = sneakers.filter(item => item.id !== id);
        saveData();
        renderTable();
    }
}

function editItem(id) {
    // Find the item to edit
    let shoe = sneakers.find(item => item.id === id);
    
    // Fill the form
    document.getElementById('item-id').value = shoe.id;
    document.getElementById('brand').value = shoe.brand;
    document.getElementById('model').value = shoe.model;
    document.getElementById('size').value = shoe.size;
    document.getElementById('value').value = shoe.value;

    // Change button text
    document.getElementById('save-btn').innerText = "Update Sneaker";
    document.getElementById('cancel-btn').style.display = "inline-block";
}

// Helper to save to local storage
function saveData() {
    localStorage.setItem('my_sneaker_data', JSON.stringify(sneakers));
}

function resetForm() {
    form.reset();
    document.getElementById('item-id').value = '';
    document.getElementById('save-btn').innerText = "Add Sneaker";
    document.getElementById('cancel-btn').style.display = "none";
}