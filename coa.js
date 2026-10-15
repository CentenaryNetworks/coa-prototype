/* Chiefs of Angels prototype: shared catalogue logic, header/footer, search, bag, wishlist, account.
   Catalogue data lives in coa-data.js (generated from the live WooCommerce store, 14 Oct 2026).
   In the real theme this is replaced by WooCommerce templates and the Store API. */
(function(){
const SIZES=["XS","S","M","L","XL"];
const P=(window.COA_DATA||[]).map(p=>{
  if(p.type==="headgear"){ p.one=1; p.sizes=["One size"] }
  if(p.one) p.sizes=["One size"];
  if(p.was){ p.tag=`Sale −${Math.round((1-p.p/p.was)*100)}%`; p.sale=1 }
  else if(p.o<4) p.tag="Just landed";
  if(!p.l) p.l=p.d.split(". ")[0];
  return p;
});
const BY=Object.fromEntries(P.map(p=>[p.id,p]));

const TYPES={jackets:"Jackets",sweaters:"Sweaters",tees:"Tees & tanks",shirts:"Shirts",tops:"Tops",skirts:"Skirts",dresses:"Dresses",bottoms:"Pants & shorts",denim:"Denim",headgear:"Headgear"};
const C={
 "shop":{t:"Shop all",k:"Everything",img:"cat-newin",d:"Every Chiefs of Angels piece in one place. Classic clothing, always with a twist, made to complement the timeless leather jacket.",f:()=>true},
 "new-in":{t:"New In",k:"Latest pieces",img:"cat-newin",d:"Everything new from the studio, newest first. Most pieces are made to order.",f:p=>p.isNew},
 "sale":{t:"Winter Sale ’26",k:"Sale",img:"cat-logothreads",pos:"center 25%",d:"Logo Threads essentials at 30% off while the sale runs.",f:p=>p.cols.includes("sale"),q:"Style starts with the basics."},
 "loungewear":{t:"Loungewear",k:"Category",img:"cat-loungewear",d:"Tees, tanks, shirts, skirts and sweats, hand distressed and finished one at a time.",f:p=>["tees","tops","shirts","skirts","bottoms","dresses"].includes(p.type)},
 "outerwear":{t:"Outerwear",k:"Category",img:"cat-jackets",d:"Designed to be more than just outerwear. This is the final layer, built to be worn, lived in, and shaped by the journey of the wearer.",f:p=>["jackets","sweaters"].includes(p.type)},
 "jackets":{t:"Jackets",k:"Outerwear",img:"cat-jackets",d:"The leather jacket is the label’s core style. The final layer, built to be worn, lived in, and shaped by the journey of the wearer.",f:p=>p.type==="jackets",parent:"outerwear"},
 "accessories":{t:"Accessories",k:"Category",img:"cat-skirts",pos:"center 15%",d:"Rooted in spirituality and shaped by the DIY spirit of rock ’n’ roll, our accessories are symbols of individuality and self-expression.",f:p=>p.type==="headgear"},
 "skool-of-rock":{t:"Skool of Rock",k:"Collection",img:"sor-look-2",pos:"center 35%",d:"Our latest summer collection looks at youth as a practice. An ongoing experiment in identity, expression and figuring things out as you go.",f:p=>p.cols.includes("skool-of-rock"),q:"Youth is an experiment. Try something new. Get it wrong. Try again.",story:"skool-of-rock"},
 "new-jozi":{t:"New Jozi",k:"Collection",word:"New Jozi City",d:"The New Jozi collection brings together expression and identity. A tribute to the city that never sleeps.",f:p=>p.cols.includes("new-jozi"),q:"Designed for the disruptors."},
 "heart-supplies":{t:"Heart Supplies",k:"Collection",img:"cat-heart",d:"The heart symbolises the expression of the things that move us from within, expressed outwardly.",f:p=>p.cols.includes("heart-supplies"),q:"The things that move us from within, expressed outwardly."},
 "logo-threads":{t:"Logo Threads",k:"Collection",img:"cat-logothreads",pos:"center 25%",d:"Designed for those who believe that style starts with the basics. Clean, versatile garments that carry the symbol that defines the brand.",f:p=>p.cols.includes("logo-threads"),q:"Style starts with the basics."},
 "denim-edit":{t:"Denim Edit",k:"Collection",word:"Denim Edit",d:"Classic denim reworked with patches, embroidery, leather panelling and stars. No two finishes are quite the same.",f:p=>p.cols.includes("denim-edit"),q:"Each patch contributes to the story of the garment."},
 "regenerated-vintage":{t:"Regenerated Vintage",k:"Collection",word:"Regenerated",d:"Up-cycled, recycled and repurposed pieces, given a second life with a rock ’n’ roll sensibility.",f:p=>p.cols.includes("regenerated-vintage")}
};
const SWITCH=["shop","new-in","skool-of-rock","new-jozi","heart-supplies","denim-edit","logo-threads","sale","outerwear","loungewear","accessories"];

/* Diaries entries come from the live site's COA Diaries pages */
const DIARIES=[
 {id:"skool-of-rock",t:"Skool of Rock",k:"Lookbook · October 2026",cover:"sor-look-1",col:"skool-of-rock",
  dek:"Our latest summer collection looks at youth as a practice. An ongoing experiment in identity, expression and figuring things out as you go."},
 {id:"story-beneath-the-sound",t:"The Story Beneath the Sound",k:"Diaries Vol. 1 · Roots",cover:"diary-01",col:"shop",
  prods:["rock-stars-never-die-tee","thunderstruck-tee","bowie-tee","rolling-stones-us-tour-tee","stones-love-coa-tee","rock-stars-never-die-sweater","rolling-stones-flannel","multi-band-denim-shirt"],
  dek:"Six chapters on where rock ’n’ roll came from: gospel, the blues, the guitar, and the feeling underneath it all."}
];
const PAGES=[
 {t:"About us",u:"about.html",k:"Rock ’n’ roll history, spirituality, sustainability"},
 {t:"Services",u:"about.html#services",k:"What we make and how"},
 {t:"Contact us",u:"contact.html",k:"Victoria Yards showroom, phone and email"},
 {t:"FAQ",u:"faq.html",k:"Orders, sizing, made to order"},
 {t:"COA Diaries",u:"diaries.html",k:"Stories and lookbooks"},
 {t:"My account",u:"account.html",k:"Orders, addresses, details"},
 {t:"Wishlist",u:"wishlist.html",k:"Pieces you saved"}
];

const R=n=>"R"+Math.round(n).toLocaleString("en-ZA").replace(/[\s  ]/g,",");
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const purl=id=>"product.html#"+id, curl=s=>"collection.html#"+s;
const img=(n)=>`img/${n}.jpg`;
const priceHTML=p=>p.was?`<span class="price"><s style="color:var(--smoke);font-weight:400;margin-right:6px">${R(p.was)}</s><span style="color:var(--heart)">${R(p.p)}</span></span>`:`<span class="price">${R(p.p)}</span>`;

/* ---------- product card ---------- */
const wish=new Set(store.get("coa-wish",[]).filter(id=>BY[id]));
function card(id,opt={}){
  const p=BY[id]; if(!p) return "";
  const alt=p.imgs[1]?`<img class="alt" src="${img(p.imgs[1])}" alt="" loading="lazy">`:"";
  return `<article class="card" data-id="${p.id}">
    <div class="ph">
      <a class="ph-link" href="${purl(p.id)}" aria-label="${esc(p.n)}"></a>
      ${p.tag?`<span class="tag${p.sale?" sale":""}">${p.tag}</span>`:""}
      <button class="wish${wish.has(p.id)?" on":""}" aria-label="Save ${esc(p.n)}" aria-pressed="${wish.has(p.id)}"><svg><use href="#i-heart"/></svg></button>
      <img class="${p.imgs[1]?"has-alt":""}" src="${img(p.imgs[0])}" alt="${esc(p.n)}" loading="${opt.eager?"eager":"lazy"}">${alt}
      <div class="quick"><p>Quick add · ${p.one?"one size":"choose size"}</p><div class="sizes" style="grid-template-columns:repeat(${p.sizes.length},1fr)">${p.sizes.map(s=>`<button data-size="${s}" aria-label="Add ${esc(p.n)} size ${s}">${s}</button>`).join("")}</div></div>
    </div>
    <div class="meta"><div><h3><a href="${purl(p.id)}">${esc(p.n)}</a></h3><p class="line">${esc(p.l)}</p></div>${priceHTML(p)}</div>
  </article>`;
}

/* ---------- chrome ---------- */
const sprite=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24"><path d="M20 12H5M11 6l-6 6 6 6"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 12.5H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3.5 7h17M3.5 12h17M3.5 17h11"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2.5l2.6 6.6 7 .5-5.4 4.5 1.7 6.9L12 17.2 6.1 21l1.7-6.9L2.4 9.6l7-.5z"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></symbol>
  <symbol id="i-needle" viewBox="0 0 24 24"><path d="M19.5 4.5L6 18M15 4l5 5M4 20l2-2"/><circle cx="18.5" cy="5.5" r="1"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-11"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24"><path d="M14.2 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H8.5v3h2.6V21z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13"/><path d="M3.5 6l8.5 7 8.5-7"/></symbol>
</svg>`;
const social=(cls="")=>`<div class="social ${cls}"><a href="https://www.instagram.com/chiefsofangels/" target="_blank" rel="noopener" aria-label="Chiefs of Angels on Instagram (opens in a new tab)"><svg><use href="#i-ig"/></svg><span>Instagram</span></a><a href="https://www.facebook.com/share/1EuqLNiwb1/" target="_blank" rel="noopener" aria-label="Chiefs of Angels on Facebook (opens in a new tab)"><svg><use href="#i-fb"/></svg><span>Facebook</span></a></div>`;
const ar=`<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:1.8;flex:none"><use href="#i-arrow"/></svg>`;
function header(active){
  const a=k=>active===k?' class="on" aria-current="page"':"";
  const cnt=c=>P.filter(C[c].f).length;
  return `<a class="skip" href="#top">Skip to content</a>
<div class="announce" role="note"><div class="wrap"><span><b>Made to order</b> <span class="dot">●</span> <span class="hide-s">most pieces are cut and finished for you in </span>5–7 working days</span><span class="hide-s"><a href="${curl("sale")}" style="text-decoration:underline;text-underline-offset:3px">Winter Sale ’26: Logo Threads 30% off</a></span></div></div>
<header class="hdr" id="hdr"><div class="wrap">
  <ul class="nav" aria-label="Shop">
    <li><a href="${curl("new-in")}"${a("new-in")}>New In</a></li>
    <li><button aria-haspopup="true"${active==="shop"?' class="on"':""}>Shop</button>
      <div class="mega"><div class="wrap">
        <div><h4>Clothing</h4><ul><li><a href="${curl("shop")}">Shop all · ${P.length}</a></li><li><a href="${curl("jackets")}">Jackets · ${cnt("jackets")}</a></li><li><a href="${curl("outerwear")}">Outerwear</a></li><li><a href="${curl("loungewear")}">Loungewear</a></li></ul></div>
        <div><h4>Accessories</h4><ul><li><a href="${curl("accessories")}">Caps · ${cnt("accessories")}</a></li></ul><h4 style="margin-top:28px">Offers</h4><ul><li><a href="${curl("sale")}">Winter Sale ’26</a></li></ul></div>
        <div><h4>Collections</h4><ul><li><a href="${curl("skool-of-rock")}">Skool of Rock</a></li><li><a href="${curl("new-jozi")}">New Jozi</a></li><li><a href="${curl("heart-supplies")}">Heart Supplies</a></li><li><a href="${curl("denim-edit")}">Denim Edit</a></li><li><a href="${curl("logo-threads")}">Logo Threads</a></li></ul></div>
        <figure><img src="img/cat-jackets.jpg" alt="Model in a black leather jacket" loading="lazy"><figcaption>Jackets · the final layer</figcaption></figure>
      </div></div></li>
    <li><a href="diaries.html"${a("diaries")}>COA Diaries</a></li>
    <li><a href="about.html"${a("about")}>About</a></li>
  </ul>
  <button class="icon-btn burger" id="burger" aria-label="Open menu"><svg><use href="#i-menu"/></svg></button>
  <a class="logo" href="index.html" aria-label="Chiefs of Angels home"><img src="img/logo.png" alt="Chiefs of Angels"></a>
  <div class="tools">
    <button class="icon-btn" id="searchBtn" aria-label="Search"><svg><use href="#i-search"/></svg></button>
    <a class="icon-btn hide-s" href="wishlist.html" aria-label="Wishlist"><svg><use href="#i-heart"/></svg></a>
    <a class="icon-btn" href="account.html" aria-label="My account"><svg><use href="#i-user"/></svg></a>
    <button class="icon-btn bag" id="bagBtn" aria-label="Open bag"><svg><use href="#i-bag"/></svg><span class="count" id="bagCount">0</span></button>
  </div>
</div></header>`;
}
const footer=`<section class="join" id="join"><div class="wrap join-grid">
  <div><h2 class="display">Join the <em>chiefs</em></h2><p>First access to new drops, the next Diaries entry, and collection launches. One email when it matters.</p></div>
  <form id="joinForm" novalidate><label class="sr" for="email">Email address</label><div class="field"><input id="email" type="email" placeholder="Your email address" autocomplete="email"><button type="submit">Sign up</button></div><div class="form-note" id="joinNote" aria-live="polite"></div></form>
</div></section>
<footer><div class="wrap">
  <div class="foot-grid">
    <div><img class="foot-logo" src="img/logo.png" alt="Chiefs of Angels"><p style="max-width:34ch;margin-top:18px">Spiritual, rebellious and timeless. Up-cycled, recycled, repurposed and newly made clothing with a rock ’n’ roll sensibility.</p><p style="margin-top:14px">16 Victoria Yards, Viljoen Street, Lorentzville, Johannesburg</p>${social("foot-social")}</div>
    <div><h4>Shop</h4><ul><li><a href="${curl("new-in")}">New In</a></li><li><a href="${curl("shop")}">Shop all</a></li><li><a href="${curl("jackets")}">Jackets</a></li><li><a href="${curl("accessories")}">Accessories</a></li><li><a href="${curl("sale")}">Sale</a></li></ul></div>
    <div><h4>Help</h4><ul><li><a href="faq.html">FAQ</a></li><li><a href="faq.html#delivery">Delivery &amp; returns</a></li><li><a href="contact.html">Contact us</a></li><li><a href="account.html">My account</a></li><li><a href="cart.html">Your bag</a></li></ul></div>
    <div><h4>Brand</h4><ul><li><a href="about.html">About us</a></li><li><a href="about.html#services">Services</a></li><li><a href="diaries.html">COA Diaries</a></li><li><a href="contact.html#showroom">Showroom</a></li></ul></div>
  </div>
  <div class="legal"><span>© Chiefs of Angels 2026</span><span>Prototype v4 for team review · payments, accounts and emails are simulated · not the live store</span></div>
</div></footer>
<div class="review-wrap"><button class="review" id="reviewBtn" aria-expanded="false" aria-controls="reviewPanel"><span class="hide-m">Prototype v4 · </span>All pages</button>
<nav class="review-panel" id="reviewPanel" hidden aria-label="All prototype pages"><b>Pages to review</b>
<a href="index.html">Home</a><a href="collection.html#shop">Collection · Shop all</a><a href="collection.html#skool-of-rock">Collection · Skool of Rock</a><a href="product.html#flatground-bomber-jacket">Product</a><a href="diaries.html">COA Diaries</a><a href="diary.html#story-beneath-the-sound">Diary · Story Beneath the Sound</a><a href="diary.html#skool-of-rock">Diary · Skool of Rock lookbook</a><a href="about.html">About &amp; Services</a><a href="contact.html">Contact</a><a href="faq.html">FAQ</a><a href="cart.html">Cart</a><a href="checkout.html">Checkout</a><a href="account.html">My account</a><a href="wishlist.html">Wishlist</a><a href="404.html">404 page</a><button id="resetDemo">Reset prototype data</button></nav></div>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Shopping bag" aria-hidden="true">
  <header><h2>Your bag</h2><button class="icon-btn" id="closeBag" aria-label="Close bag"><svg><use href="#i-x"/></svg></button></header>
  <div class="items" id="items"></div>
  <footer class="sum">
    <small id="shipMsg"></small><div class="ship"><i id="shipBar" style="width:0"></i></div>
    <div class="row"><span>Subtotal</span><span class="price" id="subtotal">R0</span></div>
    <small>Delivery is worked out at checkout. Made-to-order pieces ship within 5–7 working days.</small>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><a class="btn" href="cart.html" style="justify-content:center">View bag</a><a class="btn dark" href="checkout.html" style="justify-content:center">Checkout</a></div>
  </footer>
</aside>
<nav class="mnav" id="mnav" aria-label="Menu" aria-hidden="true">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><img src="img/logo.png" alt="Chiefs of Angels" style="height:24px;width:auto"><button class="icon-btn" id="closeNav" aria-label="Close menu"><svg><use href="#i-x"/></svg></button></div>
  <a href="${curl("new-in")}">New In</a>
  <details><summary>Shop</summary><ul><li><a href="${curl("shop")}">Shop all</a></li><li><a href="${curl("jackets")}">Jackets</a></li><li><a href="${curl("outerwear")}">Outerwear</a></li><li><a href="${curl("loungewear")}">Loungewear</a></li><li><a href="${curl("accessories")}">Caps</a></li><li><a href="${curl("sale")}">Sale</a></li></ul></details>
  <details><summary>Collections</summary><ul><li><a href="${curl("skool-of-rock")}">Skool of Rock</a></li><li><a href="${curl("new-jozi")}">New Jozi</a></li><li><a href="${curl("heart-supplies")}">Heart Supplies</a></li><li><a href="${curl("denim-edit")}">Denim Edit</a></li><li><a href="${curl("logo-threads")}">Logo Threads</a></li></ul></details>
  <a href="diaries.html">COA Diaries</a>
  <a href="about.html">About</a>
  <a href="wishlist.html">Wishlist</a>
  <a href="account.html">My account</a>
  <a href="contact.html">Contact</a>
  ${social("menu-social")}
</nav>
<div class="search" id="search" role="dialog" aria-label="Search" aria-hidden="true">
  <div class="wrap">
    <div class="s-bar"><svg><use href="#i-search"/></svg><label class="sr" for="q">Search the store</label><input id="q" type="search" placeholder="Search jackets, Skool of Rock, caps…" autocomplete="off"><button class="icon-btn" id="closeSearch" aria-label="Close search"><svg><use href="#i-x"/></svg></button></div>
    <div class="s-res" id="sres"></div>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"><span id="toastMsg">Added to bag</span><button id="toastView">View bag</button></div>`;

/* ---------- bag ---------- */
let cart=store.get("coa-bag",[]).filter(c=>BY[c.id]);
const FREE=2500; // example threshold, to confirm with Oscar
const bagTotals=()=>({count:cart.reduce((a,c)=>a+c.q,0),sub:cart.reduce((a,c)=>a+c.q*BY[c.id].p,0)});
const listeners=[];
function saveCart(){ store.set("coa-bag",cart); render(); listeners.forEach(f=>f()) }
function render(){
  const {count,sub}=bagTotals();
  const b=$("#bagCount"); if(!b) return;
  b.textContent=count; b.classList.toggle("on",count>0);
  $("#subtotal").textContent=R(sub);
  $("#shipBar").style.width=Math.min(100,sub/FREE*100)+"%";
  $("#shipMsg").textContent=!count?"Add a few pieces to see delivery options.":sub>=FREE?"Free delivery unlocked (example threshold, to confirm with Oscar).":`${R(FREE-sub)} away from free delivery (example threshold).`;
  $("#items").innerHTML=!cart.length?`<div class="empty"><span class="story">Your bag is empty.</span><a href="${curl("new-in")}" style="text-decoration:underline;text-underline-offset:3px">Start with something new in.</a></div>`:
    cart.map((c,i)=>{const p=BY[c.id];return `<div class="item"><a href="${purl(p.id)}"><img src="${img(p.imgs[0])}" alt=""></a><div><h4><a href="${purl(p.id)}">${esc(p.n)}</a></h4><small>Size ${c.s}${p.mto?" · made to order":""}</small><div class="qty"><button data-q="-1" data-i="${i}" aria-label="Decrease quantity">−</button><span>${c.q}</span><button data-q="1" data-i="${i}" aria-label="Increase quantity">+</button></div><button class="rm" data-rm="${i}">Remove</button></div><span class="price">${R(p.p*c.q)}</span></div>`}).join("");
}
let tt;
function toast(msg,btn=true){ $("#toastMsg").textContent=msg; $("#toastView").hidden=!btn; $("#toast").classList.add("on"); clearTimeout(tt); tt=setTimeout(()=>$("#toast").classList.remove("on"),3200) }
function add(id,s,q=1){
  const f=cart.find(c=>c.id===id&&c.s===s); f?f.q+=q:cart.push({id,s,q});
  saveCart();
  const bag=$("#bagBtn"); bag.classList.remove("bump"); void bag.offsetWidth; bag.classList.add("bump");
  toast(`${BY[id].n} · ${s} added to bag`);
}
function openBag(){ $("#drawer").classList.add("on"); $("#scrim").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#toast").classList.remove("on") }
function closeAll(){ document.querySelectorAll(".drawer,.scrim,.mnav,.sheet,.search").forEach(el=>{el.classList.remove("on");el.setAttribute("aria-hidden","true")}); document.body.style.overflow="" }
function toggleWish(id){ const on=!wish.has(id); on?wish.add(id):wish.delete(id); store.set("coa-wish",[...wish]);
  document.querySelectorAll(`.card[data-id="${id}"] .wish, .wish[data-wid="${id}"]`).forEach(x=>{x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
  toast(on?`Saved ${BY[id].n} to your wishlist`:`Removed ${BY[id].n} from your wishlist`,false); listeners.forEach(f=>f()); return on }

/* ---------- search ---------- */
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’']/g,"");
function searchAll(q){
  const t=norm(q).trim().split(/\s+/).filter(Boolean); if(!t.length) return null;
  const hit=s=>t.every(w=>norm(s).includes(w));
  const prods=P.filter(p=>hit([p.n,p.l,TYPES[p.type],p.cols.map(c=>C[c]?.t).join(" "),p.det.join(" ")].join(" ")))
    .sort((a,b)=>(norm(b.n).includes(t[0])?1:0)-(norm(a.n).includes(t[0])?1:0)||a.o-b.o);
  const cols=Object.entries(C).filter(([k,c])=>hit(c.t+" "+c.k)).map(([k,c])=>({t:c.t,u:curl(k),k:`${P.filter(c.f).length} pieces`}));
  const pages=[...PAGES,...DIARIES.map(d=>({t:d.t,u:"diary.html#"+d.id,k:d.k}))].filter(p=>hit(p.t+" "+p.k));
  return {prods,cols,pages};
}
function drawSearch(){
  const q=$("#q").value, r=searchAll(q), box=$("#sres");
  if(!r){ box.innerHTML=`<div class="s-sug"><span class="eyebrow">Popular</span>${["Leather jacket","Skool of Rock","Denim","Caps","Rock Stars Never Die","Heart"].map(s=>`<button class="chip" data-s="${s}">${s}</button>`).join("")}</div>`; return }
  const n=r.prods.length+r.cols.length+r.pages.length;
  if(!n){ box.innerHTML=`<p class="s-none"><span class="story">Nothing matches “${esc(q)}”.</span> Try a type like “jacket” or a collection like “New Jozi”.</p>`; return }
  box.innerHTML=`${r.cols.length||r.pages.length?`<div class="s-links">${r.cols.map(c=>`<a href="${c.u}"><b>${esc(c.t)}</b><span>${c.k}</span></a>`).join("")}${r.pages.map(c=>`<a href="${c.u}"><b>${esc(c.t)}</b><span>${esc(c.k)}</span></a>`).join("")}</div>`:""}
  ${r.prods.length?`<div class="s-head"><span class="eyebrow">${r.prods.length} product${r.prods.length===1?"":"s"}</span>${r.prods.length>8?`<span class="tb-count">Showing 8</span>`:""}</div><div class="s-grid">${r.prods.slice(0,8).map(p=>`<a class="s-item" href="${purl(p.id)}"><img src="${img(p.imgs[0])}" alt=""><span><b>${esc(p.n)}</b>${priceHTML(p)}</span></a>`).join("")}</div>`:""}`;
}
function openSearch(){ const s=$("#search"); s.classList.add("on"); s.setAttribute("aria-hidden","false"); $("#scrim").classList.add("on"); drawSearch(); setTimeout(()=>$("#q").focus(),60) }

function mount(active){
  document.body.insertAdjacentHTML("afterbegin",sprite+header(active));
  document.body.insertAdjacentHTML("beforeend",footer);
  $("#bagBtn").onclick=openBag; $("#toastView").onclick=openBag; $("#closeBag").onclick=closeAll; $("#scrim").onclick=closeAll;
  $("#burger").onclick=()=>{ $("#mnav").classList.add("on"); $("#scrim").classList.add("on"); $("#mnav").setAttribute("aria-hidden","false") };
  $("#closeNav").onclick=closeAll;
  $("#searchBtn").onclick=openSearch; $("#closeSearch").onclick=closeAll;
  $("#q").addEventListener("input",drawSearch);
  $("#q").addEventListener("keydown",e=>{ if(e.key==="Enter"){ const a=$("#sres a"); if(a) location.href=a.getAttribute("href") } });
  $("#sres").addEventListener("click",e=>{ const c=e.target.closest("[data-s]"); if(c){ $("#q").value=c.dataset.s; drawSearch(); $("#q").focus() } else if(e.target.closest("a")) closeAll() });
  $("#mnav").addEventListener("click",e=>{ if(e.target.closest("a")) closeAll() });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeAll(); if(e.key==="/" && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); openSearch() } });
  $("#items").addEventListener("click",e=>{
    const q=e.target.closest("[data-q]"), r=e.target.closest("[data-rm]");
    if(q){ const c=cart[+q.dataset.i]; c.q+= +q.dataset.q; if(c.q<1) cart.splice(+q.dataset.i,1) }
    if(r) cart.splice(+r.dataset.rm,1);
    if(q||r) saveCart();
  });
  document.addEventListener("click",e=>{
    const s=e.target.closest(".card .sizes button"); if(s){ add(s.closest(".card").dataset.id,s.dataset.size); return }
    const w=e.target.closest(".wish[data-wid], .card .wish");
    if(w){ toggleWish(w.dataset.wid||w.closest(".card").dataset.id) }
  });
  // Remember the target of page links, in case a viewer strips the #hash on navigation.
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href*=".html#"]'); if(!a) return;
    const [f,h]=a.getAttribute("href").split("#");
    try{ sessionStorage.setItem("coa-hash:"+f,h) }catch(_){}
  },true);
  const hdr=$("#hdr"); addEventListener("scroll",()=>hdr.classList.toggle("scrolled",scrollY>8),{passive:true});
  $("#joinForm").addEventListener("submit",e=>{
    e.preventDefault(); const v=$("#email").value.trim(), n=$("#joinNote");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ n.className="form-note"; n.textContent="Enter an email address like name@example.com."; return }
    n.className="form-note ok"; n.textContent="You’re on the list. (Prototype: nothing was sent.)"; $("#email").value="";
  });
  // --chrome = height of the announcement bar + header, so heroes can fill exactly the first screen
  const setChrome=()=>{ const a=document.querySelector(".announce"), h=$("#hdr"); document.documentElement.style.setProperty("--chrome",((a?a.offsetHeight:0)+(h?h.offsetHeight:0))+"px") };
  setChrome(); addEventListener("resize",setChrome); if(document.fonts) document.fonts.ready.then(setChrome);
  const rb=$("#reviewBtn"), rp=$("#reviewPanel");
  rb.onclick=()=>{ rp.hidden=!rp.hidden; rb.setAttribute("aria-expanded",!rp.hidden) };
  $("#resetDemo").onclick=()=>{ ["coa-bag","coa-wish","coa-user","coa-orders","coa-address","coa-recent","coa-note"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}}); location.reload() };
  render();
}
/* the #hash of this page, falling back to the last link clicked to it */
function hashFor(file){
  const h=(location.hash||"").replace("#","");
  if(h) return h;
  try{ return sessionStorage.getItem("coa-hash:"+file)||"" }catch(e){ return "" }
}

/* ---------- working-day dispatch estimate (SA public holidays 2026–27) ---------- */
const HOL=new Set(["2026-01-01","2026-03-21","2026-04-03","2026-04-06","2026-04-27","2026-05-01","2026-06-16","2026-08-10","2026-09-24","2026-12-16","2026-12-25","2026-12-26",
 "2027-01-01","2027-03-22","2027-03-26","2027-03-29","2027-04-27","2027-05-01","2027-06-16","2027-08-09","2027-09-24","2027-12-16","2027-12-25","2027-12-27"]);
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function addWorkingDays(from,n){ const d=new Date(from); let k=0; while(k<n){ d.setDate(d.getDate()+1); const w=d.getDay(); if(w!==0&&w!==6&&!HOL.has(iso(d))) k++ } return d }
const fmt=d=>new Date(d).toLocaleDateString("en-ZA",{weekday:"short",day:"numeric",month:"short"});

/* ---------- shared page bits ---------- */
const crumbs=(list)=>`<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${list.map((x,i)=>`<span aria-hidden="true">/</span>${i===list.length-1?`<span aria-current="page">${esc(x[0])}</span>`:`<a href="${x[1]}">${esc(x[0])}</a>`}`).join("")}</nav>`;

window.COA={P,BY,C,SWITCH,TYPES,SIZES,DIARIES,PAGES,R,$,esc,img,priceHTML,card,add,openBag,closeAll,mount,store,wish,toggleWish,purl,curl,addWorkingDays,fmt,ar,crumbs,hashFor,toast,
  get cart(){return cart}, setCart(c){cart=c;saveCart()}, saveCart, bagTotals, onChange(f){listeners.push(f)}, FREE};
})();
