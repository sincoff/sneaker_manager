const API_URL = "https://sneaker-manager.onrender.com/sneakers"; // e.g., https://sneaker-api.onrender.com/sneakers
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
const PLACEHOLDER_SVG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e0e0e0" width="200" height="200"/><text fill="#999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">No Image</text></svg>');

// Global image error handler (Rubric - no broken UI)
function handleImageError(img) {
    // #region agent log
    console.log('[DEBUG handleImageError]', {failedSrc: img.src, alt: img.alt});
    fetch('http://127.0.0.1:7242/ingest/82debc80-21ea-48af-b2cc-560ea784de40',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:handleImageError',message:'Image failed to load',data:{failedSrc:img.src,alt:img.alt},timestamp:Date.now(),hypothesisId:'A,D'})}).catch(()=>{});
    // #endregion
    img.onerror = null; // prevent infinite loop
    img.src = PLACEHOLDER_SVG;
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
        let imgUrl = (shoe.image_url && shoe.image_url.trim()) ? shoe.image_url : DEFAULT_IMAGE;
        // #region agent log
        console.log('[DEBUG renderGrid]', {rawImageUrl: shoe.image_url, resolvedImgUrl: imgUrl, brand: shoe.brand, model: shoe.model});
        fetch('http://127.0.0.1:7242/ingest/82debc80-21ea-48af-b2cc-560ea784de40',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:renderGrid',message:'Image URL resolved',data:{rawImageUrl:shoe.image_url,resolvedImgUrl:imgUrl,defaultImage:DEFAULT_IMAGE,brand:shoe.brand,model:shoe.model},timestamp:Date.now(),hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        
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
    // #region agent log
    console.log('[DEBUG formSubmit]', {imageUrl: imageUrl, sentToBackend: data.image_url});
    fetch('http://127.0.0.1:7242/ingest/82debc80-21ea-48af-b2cc-560ea784de40',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:formSubmit',message:'Submitting sneaker data',data:{imageUrl:imageUrl,sentToBackend:data.image_url},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion

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