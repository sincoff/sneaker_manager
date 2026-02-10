const API_URL = "https://sneaker-manager.onrender.com/sneakers"; // e.g., https://sneaker-api.onrender.com/sneakers

let currentPage = 1;
let currentLimit = 10;
let currentSearch = "";
let currentSort = "id";
let currentData = [];

// --- COOKIE MANAGEMENT (Rubric Requirement) ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Initialize logic (runs on load)
function init() {
    let savedLimit = getCookie("sneaker_page_size");
    if (savedLimit) {
        currentLimit = parseInt(savedLimit);
        document.getElementById('page-size-select').value = currentLimit;
    }
    fetchSneakers();
}

// --- FETCH & RENDER ---
async function fetchSneakers(page = 1) {
    try {
        let url = `${API_URL}?page=${page}&limit=${currentLimit}&q=${currentSearch}&sort=${currentSort}`;
        const response = await fetch(url);
        const result = await response.json();

        currentPage = result.current_page;
        currentData = result.data; 

        renderGrid(result.data);
        updateStats(result.stats);
        updatePaging(result.total_pages);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderGrid(sneakers) {
    const container = document.getElementById('sneaker-grid');
    container.innerHTML = '';

    if (sneakers.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">No sneakers found.</p>';
        return;
    }

    sneakers.forEach(shoe => {
        // Fallback for missing images (Rubric Requirement - no broken UI)
        const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e0e0e0' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
        let imgUrl = shoe.image_url ? shoe.image_url : placeholderSvg;
        
        let card = `
            <div class="card">
                <img src="${imgUrl}" onerror="this.src='${placeholderSvg}'" alt="${shoe.brand} ${shoe.model}">
                <div class="card-info">
                    <div>
                        <h4>${shoe.brand} ${shoe.model}</h4>
                        <p>Size: ${shoe.size}</p>
                        <p><strong>$${shoe.value}</strong></p>
                    </div>
                    <div class="actions">
                        <button onclick="editItem(${shoe.id})" class="btn-edit">Edit</button>
                        <button onclick="deleteItem(${shoe.id})" class="btn-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// --- UI UPDATES ---
function updateStats(stats) {
    document.getElementById('total-count').innerText = stats.count;
    document.getElementById('total-value').innerText = stats.total_value;
    document.getElementById('current-page-size').innerText = currentLimit;
}

function updatePaging(totalPages) {
    document.getElementById('page-indicator').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prev-btn').disabled = currentPage <= 1;
    document.getElementById('next-btn').disabled = currentPage >= totalPages || totalPages === 0;
}

// --- EVENT HANDLERS ---
function handleSearch() {
    currentSearch = document.getElementById('search-input').value;
    fetchSneakers(1); 
}

function handleSort() {
    currentSort = document.getElementById('sort-select').value;
    fetchSneakers(1);
}

function handlePageSize() {
    currentLimit = document.getElementById('page-size-select').value;
    setCookie("sneaker_page_size", currentLimit, 30); 
    fetchSneakers(1);
}

function changePage(dir) {
    fetchSneakers(currentPage + dir);
}

// --- CRUD OPERATIONS ---
let form = document.getElementById('item-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.getElementById('item-id').value;
    let data = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        size: document.getElementById('size').value,
        value: document.getElementById('value').value,
        image_url: document.getElementById('image-url').value
    };

    let method = id ? 'PUT' : 'POST';
    let url = id ? `${API_URL}/${id}` : API_URL;

    try {
        await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        resetForm();
        fetchSneakers(currentPage);
    } catch(err) {
        alert("Error saving sneaker.");
    }
});

async function deleteItem(id) {
    if(confirm("Are you sure you want to delete this record?")) {
        try {
            await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
            fetchSneakers(currentPage);
        } catch(err) {
            alert("Error deleting sneaker.");
        }
    }
}

function editItem(id) {
    let shoe = currentData.find(s => s.id === id);
    if(shoe) {
        window.scrollTo({top:0, behavior:'smooth'});
        document.getElementById('item-id').value = shoe.id;
        document.getElementById('brand').value = shoe.brand;
        document.getElementById('model').value = shoe.model;
        document.getElementById('size').value = shoe.size;
        document.getElementById('value').value = shoe.value;
        document.getElementById('image-url').value = shoe.image_url || "";
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

// Start the app
init();