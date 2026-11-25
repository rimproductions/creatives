const C=window.RIM_CONFIG,$=s=>document.querySelector(s);let S=window.RIM_SERVICES,SAMPLES=window.RIM_SAMPLES||[];
const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function render(){// Services accordion
$("#services-list").innerHTML=S.map(g=>`<div class="svc" id="${g.id}">
<button aria-expanded="false" aria-controls="p-${g.id}"><span><h3>${esc(g.title)}</h3><small>${esc(g.blurb)}</small></span><span class="plus" aria-hidden="true">+</span></button>
<div class="panel" id="p-${g.id}">${g.items.map(i=>`<div class="item"><h4>${esc(i.name)}</h4><p>${esc(i.desc)}</p>
<div class="price">${i.price?esc(i.price):"Price on request"}</div>
<button class="btn order" data-name="${esc(g.title+" - "+i.name)}" data-price="${esc(i.price||"Price on request")}">Place order</button></div>`).join("")}</div></div>`).join("");
document.querySelectorAll(".svc>button").forEach(b=>b.onclick=()=>{const o=b.parentElement.classList.toggle("open");b.setAttribute("aria-expanded",o)});
// Samples
$("#samples-list").innerHTML=SAMPLES.map(s=>`<div><strong>${esc(s.title)}</strong> <small>${esc(s.note||"")}</small><audio controls preload="none" src="${esc(s.file)}"></audio></div>`).join("")||'<p class="empty">Samples are coming soon.</p>';
}
render();
(async()=>{if(C.SUPABASE_URL.startsWith("PASTE"))return;const h={apikey:C.SUPABASE_ANON_KEY,Authorization:"Bearer "+C.SUPABASE_ANON_KEY};try{const [a,b]=await Promise.all([fetch(C.SUPABASE_URL+"/rest/v1/services?select=*,service_items(*)&order=sort",{headers:h}).then(r=>r.json()),fetch(C.SUPABASE_URL+"/rest/v1/samples?order=created_at.desc",{headers:h}).then(r=>r.json())]);if(Array.isArray(a)&&a.length)S=a.map(g=>({id:"g"+g.id,title:g.title,blurb:g.blurb,items:(g.service_items||[]).sort((x,y)=>x.sort-y.sort).map(i=>({name:i.name,desc:i.description,price:i.price}))}));if(Array.isArray(b))SAMPLES=b.map(x=>({title:x.title,note:x.note,file:x.file_url}));render()}catch(e){}})();
// Order pop-ups
const od=$("#od"),cd=$("#cd");
document.addEventListener("click",e=>{const b=e.target.closest(".order");
 if(b){$("#service").value=b.dataset.name;$("#o-name").textContent=b.dataset.name;$("#o-price").textContent=b.dataset.price;od.showModal()}
 if(e.target.closest(".custom-btn")){e.preventDefault();cd.showModal()}
 if(e.target.closest("[data-close]"))e.target.closest("dialog").close();
 if(e.target.tagName==="DIALOG")e.target.close()});
// Payment hook: after an order is saved, a payment step (e.g. Paystack) can be started here.
function afterOrder(order){}
async function send(form,btn,label){const m=form.querySelector(".msg"),d=Object.fromEntries(new FormData(form));
 if(C.SUPABASE_URL.startsWith("PASTE")){m.className="msg err";m.textContent="Setup needed: add the Supabase details in config.js.";return}
 btn.disabled=true;btn.textContent="Sending...";m.textContent="";
 const row={service:d.service,name:d.name,email:d.email,whatsapp:d.whatsapp,deadline:d.deadline||null,details:d.details,reference_link:d.reference_link,budget:d.budget||null,order_type:d.service==="Custom order"?"custom":"service"};
 try{const r=await fetch(C.SUPABASE_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:"Bearer "+C.SUPABASE_ANON_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(row)});
  if(!r.ok)throw new Error(r.status);m.className="msg ok";m.textContent="Order received. We will contact you soon to confirm the details and price.";form.reset();afterOrder(row);
 }catch(err){m.className="msg err";m.textContent="Your order did not send. Check your connection and try again, or use WhatsApp."}
 btn.disabled=false;btn.textContent=label}
$("#order-form").onsubmit=e=>{e.preventDefault();send(e.target,$("#send"),"Send order")};
$("#custom-form").onsubmit=e=>{e.preventDefault();send(e.target,$("#csend"),"Send custom order")};
const wa="https://wa.me/"+C.WHATSAPP+"?text="+encodeURIComponent("Hello RIM Productions, I have a question.");
document.querySelectorAll(".wa-link").forEach(a=>a.href=wa);document.querySelectorAll(".mail-link").forEach(a=>{a.href="mailto:"+C.EMAIL;a.textContent=C.EMAIL});
