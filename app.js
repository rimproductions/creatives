const C=window.RIM_CONFIG,S=window.RIM_SERVICES,$=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
// Services accordion
$("#services-list").innerHTML=S.map(g=>`<div class="svc" id="${g.id}">
<button aria-expanded="false" aria-controls="p-${g.id}"><span><h3>${esc(g.title)}</h3><small>${esc(g.blurb)}</small></span><span class="plus" aria-hidden="true">+</span></button>
<div class="panel" id="p-${g.id}">${g.items.map(i=>`<div class="item"><h4>${esc(i.name)}</h4><p>${esc(i.desc)}</p>
<div class="price">${i.price?esc(i.price):"Price on request"}</div>
<button class="btn order" data-name="${esc(g.title+" - "+i.name)}">Place order</button></div>`).join("")}</div></div>`).join("");
document.querySelectorAll(".svc>button").forEach(b=>b.onclick=()=>{const o=b.parentElement.classList.toggle("open");b.setAttribute("aria-expanded",o)});
// Samples
$("#samples-list").innerHTML=(window.RIM_SAMPLES||[]).map(s=>`<div><strong>${esc(s.title)}</strong> <small>${esc(s.note||"")}</small><audio controls preload="none" src="${esc(s.file)}"></audio></div>`).join("")||'<p class="empty">Samples are coming soon.</p>';
// Order flow
function choose(name){$("#service").value=name;$("#chosen").textContent=name;$("#chosen-box").hidden=false;$("#order").scrollIntoView();$("#name").focus({preventScroll:true})}
document.addEventListener("click",e=>{const b=e.target.closest(".order");if(b)choose(b.dataset.name);if(e.target.closest(".custom-btn")){e.preventDefault();choose("Custom order")}});
$("#change").onclick=()=>{$("#service").value="";$("#chosen-box").hidden=true};
$("#order-form").onsubmit=async e=>{e.preventDefault();const m=$("#msg"),btn=$("#send"),d=Object.fromEntries(new FormData(e.target));
 if(!d.service){m.className="err";m.textContent="Pick a service first, or choose Custom order.";return}
 if(C.SUPABASE_URL.startsWith("PASTE")){m.className="err";m.textContent="Setup needed: add the Supabase details in config.js.";return}
 btn.disabled=true;btn.textContent="Sending...";m.textContent="";
 try{const r=await fetch(C.SUPABASE_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:"Bearer "+C.SUPABASE_ANON_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},
  body:JSON.stringify({service:d.service,name:d.name,email:d.email,whatsapp:d.whatsapp,deadline:d.deadline||null,details:d.details,reference_link:d.reference_link})});
  if(!r.ok)throw new Error(r.status);
  m.className="ok";m.textContent="Order received. We will contact you soon to confirm the details and price.";e.target.reset();$("#chosen-box").hidden=true;
 }catch(err){m.className="err";m.textContent="Your order did not send. Check your connection and try again, or use WhatsApp."}
 btn.disabled=false;btn.textContent="Send order"};
const wa="https://wa.me/"+C.WHATSAPP+"?text="+encodeURIComponent("Hello RIM Productions, I have a question.");
document.querySelectorAll(".wa-link").forEach(a=>a.href=wa);document.querySelectorAll(".mail-link").forEach(a=>{a.href="mailto:"+C.EMAIL;a.textContent=C.EMAIL});
