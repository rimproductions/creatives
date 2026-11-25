const C=window.RIM_CONFIG,db=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY),$=s=>document.querySelector(s),V=$("#view");
const e=t=>String(t??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));let tab="orders";
const fail=r=>{if(r.error){alert("Error: "+r.error.message);return true}};
async function boot(){const{data}=await db.auth.getSession();const on=!!data.session;$("#login").hidden=on;$("#app").hidden=!on;$("#out").hidden=!on;if(on)show()}
$("#login").onsubmit=async x=>{x.preventDefault();const r=await db.auth.signInWithPassword({email:$("#em").value,password:$("#pw").value});$("#lm").textContent=r.error?"Login failed: check email and password.":"";boot()};
$("#out").onclick=async()=>{await db.auth.signOut();boot()};
document.querySelectorAll(".tabs .btn").forEach(b=>b.onclick=()=>{tab=b.dataset.t;document.querySelectorAll(".tabs .btn").forEach(x=>x.classList.toggle("on",x===b));show()});
const show=()=>({orders,services,samples}[tab])();
async function orders(){const r=await db.from("orders").select("*").order("created_at",{ascending:false});if(fail(r))return;
 V.innerHTML=r.data.map(o=>`<div class="card"><strong>${e(o.service)}</strong><div>${e(o.name)} | ${e(o.email)} | ${e(o.whatsapp)}</div><div>${e(o.details)}</div><small>${new Date(o.created_at).toLocaleString()}${o.deadline?" | Deadline "+o.deadline:""} ${o.reference_link?'| <a href="'+e(o.reference_link)+'" target="_blank" rel="noopener">Reference</a>':""}</small>
 <div class="row"><select data-id="${o.id}" class="st">${["new","contacted","in progress","done"].map(s=>`<option ${s==o.status?"selected":""}>${s}</option>`).join("")}</select><button class="btn danger small" data-del="${o.id}">Delete</button></div></div>`).join("")||"<p>No orders yet.</p>";
 V.querySelectorAll(".st").forEach(s=>s.onchange=async()=>fail(await db.from("orders").update({status:s.value}).eq("id",s.dataset.id)));
 V.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this order?")){fail(await db.from("orders").delete().eq("id",b.dataset.del));orders()}})}
async function services(){const r=await db.from("services").select("*,service_items(*)").order("sort");if(fail(r))return;
 V.innerHTML=`<button class="btn small" id="addg">+ Add section</button>`+r.data.map(g=>`<div class="card" data-g="${g.id}"><div class="row"><input value="${e(g.title)}" data-f="title"><input value="${e(g.blurb)}" data-f="blurb"></div><div class="row"><button class="btn small" data-sg>Save section</button><button class="btn danger small" data-dg>Delete section</button></div>
 ${(g.service_items||[]).sort((a,b)=>a.sort-b.sort).map(i=>`<div class="card" data-i="${i.id}"><input value="${e(i.name)}" data-f="name" placeholder="Name"><textarea data-f="description" rows="2">${e(i.description)}</textarea><input value="${e(i.price)}" data-f="price" placeholder="Price, e.g. From N20,000"><div class="row"><button class="btn small" data-si>Save</button><button class="btn danger small" data-di>Delete</button></div></div>`).join("")}<button class="btn alt small" data-ai>+ Add service</button></div>`).join("");
 const vals=el=>Object.fromEntries([...el.querySelectorAll(":scope>[data-f],:scope>.row>[data-f]")].map(i=>[i.dataset.f,i.value]));
 $("#addg").onclick=async()=>{fail(await db.from("services").insert({title:"New section",blurb:"",sort:99}));services()};
 V.querySelectorAll("[data-sg]").forEach(b=>b.onclick=async()=>{const g=b.closest("[data-g]");fail(await db.from("services").update(vals(g)).eq("id",g.dataset.g));b.textContent="Saved"});
 V.querySelectorAll("[data-dg]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this section and its services?")){fail(await db.from("services").delete().eq("id",b.closest("[data-g]").dataset.g));services()}});
 V.querySelectorAll("[data-si]").forEach(b=>b.onclick=async()=>{const i=b.closest("[data-i]");fail(await db.from("service_items").update(vals(i)).eq("id",i.dataset.i));b.textContent="Saved"});
 V.querySelectorAll("[data-di]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this service?")){fail(await db.from("service_items").delete().eq("id",b.closest("[data-i]").dataset.i));services()}});
 V.querySelectorAll("[data-ai]").forEach(b=>b.onclick=async()=>{fail(await db.from("service_items").insert({service_id:b.closest("[data-g]").dataset.g,name:"New service",description:"",price:"",sort:99}));services()})}
async function samples(){const r=await db.from("samples").select("*").order("created_at",{ascending:false});if(fail(r))return;
 V.innerHTML=`<form class="card" id="up"><input id="st" placeholder="Title" required><input id="sn" placeholder="Note (e.g. Backing track)"><input type="file" id="sf" accept="audio/mpeg,audio/mp3" required><button class="btn small">Upload sample (MP3, small)</button><small id="um"></small></form>`+r.data.map(s=>`<div class="card"><strong>${e(s.title)}</strong> <small>${e(s.note)}</small><audio controls preload="none" src="${e(s.file_url)}"></audio><button class="btn danger small" data-d="${s.id}" data-p="${e(s.file_path)}">Delete</button></div>`).join("");
 $("#up").onsubmit=async x=>{x.preventDefault();const f=$("#sf").files[0];$("#um").textContent="Uploading...";const p=Date.now()+"-"+f.name.replace(/[^\w.-]/g,"_");const u=await db.storage.from("samples").upload(p,f);if(fail(u))return;
  const url=db.storage.from("samples").getPublicUrl(p).data.publicUrl;fail(await db.from("samples").insert({title:$("#st").value,note:$("#sn").value,file_url:url,file_path:p}));samples()};
 V.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this sample?")){await db.storage.from("samples").remove([b.dataset.p]);fail(await db.from("samples").delete().eq("id",b.dataset.d));samples()}})}
boot();
