/* ===== HELPERS ===== */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const load = k => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

/* ===== DATA ===== */
let products = load("mp_products");
let orders   = load("mp_orders");
let bookings = load("mp_bookings");
let gallery  = load("mp_gallery");
let settings = load("mp_settings") || {
  whatsapp:"0751327051",
  call:"0771365511"
};

const role = localStorage.getItem("mp_admin_role");
const isAssistant = role === "assistant";

/* ===== ROLE ===== */
$("#roleBadge").textContent = role === "admin" ? "Admin" : "Assistant";
if(isAssistant){
  $$("[data-role-only='admin']").forEach(el=>el.style.display="none");
}

/* ===== LOGOUT ===== */
$("#logoutBtn").onclick = ()=>{
  localStorage.clear();
  location.href = "admin-login.html";
};

/* ===== AUTO STOCK REDUCTION ===== */
function processStockReduction(){
  let updated = false;
  orders.forEach(order=>{
    if(order.stockProcessed) return;
    order.items.forEach(item=>{
      const p = products.find(x=>x.id===item.id);
      if(!p) return;
      if(p.stock === undefined) p.stock = 9999;
      p.stock -= item.qty;
      if(p.stock < 0) p.stock = 0;
    });
    order.stockProcessed = true;
    updated = true;
  });
  if(updated){
    save("mp_products", products);
    save("mp_orders", orders);
  }
}

/* ===== INVENTORY ===== */
function renderProducts(){
  const tb = $("#productsTable");
  tb.innerHTML = "";
  products.forEach(p=>{
    if(p.stock === undefined) p.stock = 9999;
    if(p.lowStock === undefined) p.lowStock = 3;
    let status = "OK";
    if(p.stock <= 0) status = "OUT";
    else if(p.stock <= p.lowStock) status = "LOW";

    tb.innerHTML += `
      <tr>
        <td>${p.title}</td>
        <td>UGX ${p.price.toLocaleString()}</td>
        <td>${isAssistant ? p.stock : `<input type="number" data-id="${p.id}" class="stock" value="${p.stock}">`}</td>
        <td>${isAssistant ? p.lowStock : `<input type="number" data-id="${p.id}" class="low" value="${p.lowStock}">`}</td>
        <td><b>${status}</b></td>
      </tr>
    `;
  });
  save("mp_products", products);
}

$("#productsTable").addEventListener("change", e=>{
  if(isAssistant) return;
  const p = products.find(x=>x.id===e.target.dataset.id);
  if(!p) return;
  if(e.target.classList.contains("stock")) p.stock = +e.target.value;
  if(e.target.classList.contains("low")) p.lowStock = +e.target.value;
  save("mp_products", products);
  renderProducts();
});

/* ===== ORDERS ===== */
function renderOrders(){
  const filter = $("#orderFilter") ? $("#orderFilter").value : "all";
  const box = $("#ordersList");
  box.innerHTML = "";

  orders.forEach(o=>{
    if(!o.status) o.status = "Pending";
    if(filter !== "all" && o.status !== filter) return;

    box.innerHTML += `
      <div class="order-row">
        <div>
          <b>${o.customer}</b><br>
          <small>${o.phone} | ${o.date}</small><br>
          <span class="status-badge ${o.status.toLowerCase().replace(" ","-")}">${o.status}</span>
        </div>
        <div>
          <select data-id="${o.id}" class="order-status">
            ${["Pending","Confirmed","In Progress","Delivered","Cancelled"]
              .map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
          </select>
          ${isAssistant ? "" : `
            <button class="invoice-btn" data-id="${o.id}">Invoice</button>
            <button class="del-order" data-id="${o.id}">Delete</button>
          `}
        </div>
      </div>
    `;
  });
  save("mp_orders", orders);
}

$("#ordersList").addEventListener("change", e=>{
  if(e.target.classList.contains("order-status")){
    const o = orders.find(x=>x.id===e.target.dataset.id);
    o.status = e.target.value;
    save("mp_orders", orders);
    renderOrders();
  }
});

$("#ordersList").addEventListener("click", e=>{
  if(e.target.classList.contains("del-order") && !isAssistant){
    orders = orders.filter(o=>o.id!==e.target.dataset.id);
    save("mp_orders", orders);
    renderOrders();
  }
});

/* ===== PDF INVOICE (BRANDED) ===== */
const pdfScript = document.createElement("script");
pdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(pdfScript);

document.addEventListener("click", async e=>{
  if(!e.target.classList.contains("invoice-btn")) return;

  const order = orders.find(o=>o.id===e.target.dataset.id);
  if(!order) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const brand = "#c75a7a";
  let y = 20;

  // HEADER
  pdf.setTextColor(199,90,122);
  pdf.setFontSize(22);
  pdf.text("MissPetals & Events", 20, y);
  y+=8;

  pdf.setFontSize(11);
  pdf.setTextColor(80);
  pdf.text("Elegant Flowers & Event Styling", 20, y);
  y+=10;

  // LINE
  pdf.setDrawColor(199,90,122);
  pdf.line(20, y, 190, y);
  y+=8;

  // INFO
  pdf.setFontSize(11);
  pdf.text(`Invoice #: MP-${order.id}`, 20, y); y+=6;
  pdf.text(`Date: ${order.date}`, 20, y); y+=6;
  pdf.text(`Customer: ${order.customer}`, 20, y); y+=6;
  pdf.text(`Phone: ${order.phone}`, 20, y); y+=10;

  // ITEMS
  pdf.setFontSize(13);
  pdf.text("Order Details", 20, y);
  y+=8;

  pdf.setFontSize(11);
  order.items.forEach(i=>{
    pdf.text(`• ${i.title}  x${i.qty}`, 25, y);
    y+=6;
  });

  y+=6;
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text(`TOTAL: UGX ${order.total.toLocaleString()}`, 20, y);

  // FOOTER
  y+=15;
  pdf.setDrawColor(220);
  pdf.line(20, y, 190, y);
  y+=8;

  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`WhatsApp: ${settings.whatsapp}`, 20, y); y+=5;
  pdf.text(`Call: ${settings.call}`, 20, y); y+=5;
  pdf.text("Thank you for choosing MissPetals & Events 🌸", 20, y);

  pdf.save(`MissPetals-Invoice-${order.id}.pdf`);
});

/* ===== BOOKINGS ===== */
function renderBookings(){
  $("#bookingsList").innerHTML = bookings.length
    ? bookings.map(b=>`<div>${b.name} - ${b.date}</div>`).join("")
    : "No bookings";
}

/* ===== GALLERY ===== */
$("#addGalleryImg").onclick = ()=>{
  const v = $("#galleryImgInput").value;
  if(v){
    gallery.push(v);
    save("mp_gallery", gallery);
    renderGallery();
  }
};

function renderGallery(){
  $("#galleryList").innerHTML = gallery.map(g=>`<img src="${g}" width="80">`).join("");
}

/* ===== SETTINGS ===== */
$("#saveSettings").onclick = ()=>{
  settings.whatsapp = $("#setting_wa").value;
  settings.call = $("#setting_call").value;
  save("mp_settings", settings);
};

$("#savePass").onclick = ()=>{
  const p = $("#setting_pass").value;
  if(p.length>=4){
    localStorage.setItem("mp_admin_pass", btoa(p));
    alert("Password changed");
  }
};

/* ===== TABS ===== */
$$(".tab-btn").forEach(b=>{
  b.onclick = ()=>{
    $$(".tab-panel").forEach(p=>p.style.display="none");
    $("#"+b.dataset.tab).style.display="block";
  };
});

/* ===== INIT ===== */
processStockReduction();
renderProducts();
renderOrders();
renderBookings();
renderGallery();


