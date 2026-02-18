const API_URL = "https://sneaker-manager.onrender.com/sneakers"; // e.g., https://sneaker-api.onrender.com/sneakers
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
const PLACEHOLDER_SVG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e0e0e0" width="200" height="200"/><text fill="#999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">No Image</text></svg>');

// Global image error handler (Rubric - no broken UI)
function handleImageError(img) {
    if (!img.dataset.fallback) {
        // First failure: try the default sneaker image
        img.dataset.fallback = "1";
        img.src = DEFAULT_IMAGE;
    } else {
        // Default also failed: use SVG placeholder as last resort
        img.onerror = null;
        img.src = PLACEHOLDER_SVG;
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

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
    }
    let savedSort = getCookie("sneaker_sort");
    if (savedSort) {
        currentSort = savedSort;
    }
    // Always sync the dropdowns with the actual values
    document.getElementById('page-size-select').value = currentLimit;
    document.getElementById('sort-select').value = currentSort;
    fetchSneakers();
}

// --- CLIENT-SIDE SORTING ---
function sortData(data, sortType) {
    let sorted = [...data];
    switch (sortType) {
        case "brand":
            sorted.sort((a, b) => {
                let nameA = `${a.brand} ${a.model}`.toLowerCase();
                let nameB = `${b.brand} ${b.model}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
        case "price_asc":
            sorted.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
            break;
        case "price_desc":
            sorted.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
            break;
        case "id":
        default:
            sorted.sort((a, b) => b.id - a.id);
            break;
    }
    return sorted;
}

// --- FETCH & RENDER ---
function showLoading(message = "Loading sneakers...", sub = "") {
    const container = document.getElementById('sneaker-grid');
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>${message}</p>
            ${sub ? `<p class="loading-sub">${sub}</p>` : ""}
        </div>`;
}

async function fetchWithRetry(url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            let response = await fetch(url);
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            return await response.json();
        } catch (error) {
            if (attempt === retries) throw error;
            showLoading("Connecting to server...", `Retry ${attempt} of ${retries - 1}...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function fetchSneakers(page = 1) {
    showLoading();
    try {
        let url = `${API_URL}?page=1&limit=1000`;
        const result = await fetchWithRetry(url);

        let data = result.data;

        // Client-side filtering: match search term against both brand and model
        let isSearching = currentSearch.trim().length > 0;
        if (isSearching) {
            let term = currentSearch.trim().toLowerCase();
            data = data.filter(shoe =>
                shoe.brand.toLowerCase().includes(term) ||
                shoe.model.toLowerCase().includes(term) ||
                `${shoe.brand} ${shoe.model}`.toLowerCase().includes(term)
            );
        }

        // Client-side sorting
        data = sortData(data, currentSort);

        // Client-side pagination
        let totalItems = data.length;
        let totalPages = Math.ceil(totalItems / currentLimit) || 1;
        currentPage = Math.min(page, totalPages);
        let start = (currentPage - 1) * currentLimit;
        let paginatedData = data.slice(start, start + parseInt(currentLimit));

        currentData = paginatedData;
        renderGrid(paginatedData);
        updateStats({ count: totalItems, total_value: data.reduce((sum, s) => sum + parseFloat(s.value || 0), 0) });
        updatePaging(totalPages);

    } catch (error) {
        console.error("Error fetching data:", error);
        const container = document.getElementById('sneaker-grid');
        container.innerHTML = `
            <p style="grid-column: 1 / -1; text-align:center; color: #e74c3c;">
                Failed to load sneakers. <a href="#" onclick="fetchSneakers(1); return false;" style="color: #007bff;">Try again</a>
            </p>`;
        showToast("Could not connect to server. Please try again.", true);
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
        let imgUrl = (shoe.image_url && shoe.image_url.trim()) ? shoe.image_url : DEFAULT_IMAGE;
        
        let card = `
            <div class="card">
                <img src="${imgUrl}" onerror="handleImageError(this)" alt="${shoe.brand} ${shoe.model}">
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
    setCookie("sneaker_sort", currentSort, 30);
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
    let imageUrl = document.getElementById('image-url').value.trim();
    let data = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        size: document.getElementById('size').value,
        value: document.getElementById('value').value,
        image_url: imageUrl
    };

    let method = id ? 'PUT' : 'POST';
    let url = id ? `${API_URL}/${id}` : API_URL;

    try {
        let res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            let msg = "Error saving sneaker.";
            try {
                let err = await res.json();
                if (err.error) msg += " " + err.error;
                else msg += " Server returned: " + res.status;
            } catch (_) {
                msg += " Server returned: " + res.status;
            }
            showToast(msg, true);
            return;
        }
        showToast(id ? "Sneaker updated successfully!" : "Sneaker added successfully!");
        resetForm();
        fetchSneakers(currentPage);
    } catch(err) {
        showToast("Error saving sneaker. Please try again.", true);
    }
});

async function deleteItem(id) {
    if(confirm("Are you sure you want to delete this record?")) {
        try {
            let res = await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
            if (!res.ok) {
                let msg = "Error deleting sneaker.";
                try {
                    let err = await res.json();
                    if (err.error) msg += " " + err.error;
                    else msg += " Server returned: " + res.status;
                } catch (_) {
                    msg += " Server returned: " + res.status;
                }
                showToast(msg, true);
                return;
            }
            showToast("Sneaker deleted successfully!");
            fetchSneakers(currentPage);
        } catch(err) {
            showToast("Error deleting sneaker. Please try again.", true);
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