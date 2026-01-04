/* ================= HELPERS ================= */
const load = k => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

/* ================= LOAD DATA ================= */
let products = load("mp_products");
let cart = load("mp_cart") || [];

/* ================= RENDER PRODUCTS ================= */
function renderProducts(){
  const grid = document.getElementById("shopGrid");
  if(!grid) return;

  grid.innerHTML = "";

  products.forEach(p=>{
    if(p.stock === undefined) p.stock = 9999;

    const out = p.stock <= 0;

    grid.innerHTML += `
      <div class="product-card ${out ? "out" : ""}">
        ${out ? `<div class="stock-badge">OUT OF STOCK</div>` : ""}
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>UGX ${p.price.toLocaleString()}</p>

        <button 
          onclick="addToCart('${p.id}')" 
          ${out ? "disabled" : ""}
        >
          ${out ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    `;
  });
}

/* ================= ADD TO CART ================= */
function addToCart(id){
  const product = products.find(p=>p.id===id);
  if(!product || product.stock <= 0){
    alert("This product is out of stock.");
    return;
  }

  const item = cart.find(i=>i.id===id);
  if(item){
    if(item.qty + 1 > product.stock){
      alert("Not enough stock available.");
      return;
    }
    item.qty++;
  } else {
    cart.push({ id, title:product.title, price:product.price, qty:1 });
  }

  save("mp_cart", cart);
  renderCart();
}

/* ================= RENDER CART ================= */
function renderCart(){
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if(!box) return;

  let total = 0;
  box.innerHTML = "";

  cart.forEach(i=>{
    const product = products.find(p=>p.id===i.id);
    if(!product || product.stock <= 0){
      i.invalid = true;
    } else {
      i.invalid = false;
    }

    total += i.price * i.qty;

    box.innerHTML += `
      <div class="cart-row ${i.invalid ? "invalid" : ""}">
        ${i.title} x${i.qty}
        <span>UGX ${(i.price*i.qty).toLocaleString()}</span>
      </div>
    `;
  });

  totalEl.textContent = `UGX ${total.toLocaleString()}`;
}

/* ================= CHECKOUT ================= */
function checkout(){
  const invalid = cart.find(i=>i.invalid);
  if(invalid){
    alert("Some items in your cart are out of stock. Remove them to continue.");
    return;
  }

  if(!cart.length){
    alert("Cart is empty.");
    return;
  }

  // continue to your existing order logic
  alert("Checkout allowed ✔");
}

/* ================= INIT ================= */
renderProducts();
renderCart();


