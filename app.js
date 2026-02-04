// CONFIGURATION
const API_URL = "https://sincoff.pythonanywhere.com/sneakers";

let currentPage = 1;
let totalPages = 1;
let currentData = []; 

// 1. READ (Load Data from Server)
async function fetchSneakers(page = 1) {
    try {
        const response = await fetch(`${API_URL}?page=${page}`);
        const result = await response.json();

        currentPage = result.current_page;
        totalPages = result.total_pages;
        currentData = result.data; 

        renderTable(result.data);
        updateStats(result.stats);
        updatePagingControls();

    } catch (error) {
        console.error("Error loading data:", error);
        alert("Could not connect to backend. Is the server running?");
    }
}

// 2. RENDER TABLE (Now with Numbers 1-10)
function renderTable(sneakers) {
    let tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; 

    sneakers.forEach((shoe, index) => {
        let row = `
            <tr>
                <td style="font-weight:bold; color:#888;">${index + 1}</td>
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
}

function updateStats(stats) {
    document.getElementById('total-count').innerText = stats.count;
    document.getElementById('total-value').innerText = stats.total_value;
}

function updatePagingControls() {
    document.getElementById('page-indicator').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-btn').disabled = (currentPage === 1);
    document.getElementById('next-btn').disabled = (currentPage === totalPages);
}

// 3. PAGING NAVIGATION
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
        fetchSneakers(newPage);
    }
}

// 4. CREATE / UPDATE
let form = document.getElementById('item-form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    let id = document.getElementById('item-id').value;
    let data = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        size: document.getElementById('size').value,
        value: document.getElementById('value').value
    };

    try {
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        resetForm();
        fetchSneakers(currentPage); 

    } catch (error) {
        alert("Error saving data.");
    }
});

// 5. DELETE
async function deleteItem(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchSneakers(currentPage); 
        } catch (error) {
            alert("Error deleting item.");
        }
    }
}

// 6. EDIT SETUP
function editItem(id) {
    const shoe = currentData.find(item => item.id === id);
    
    if (shoe) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('item-id').value = shoe.id;
        document.getElementById('brand').value = shoe.brand;
        document.getElementById('model').value = shoe.model;
        document.getElementById('size').value = shoe.size;
        document.getElementById('value').value = shoe.value;
        document.getElementById('save-btn').innerText = "Update Sneaker";
        document.getElementById('cancel-btn').style.display = "inline-block";
    }
}

function resetForm() {
    form.reset();
    document.getElementById('item-id').value = '';
    document.getElementById('save-btn').innerText = "Add Sneaker";
    document.getElementById('cancel-btn').style.display = "none";
}

// Initial Load
fetchSneakers();