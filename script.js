const $ = (id) => document.getElementById(id);
const STORE_KEY = 'gatepass_visitors_v1';
let visitors = [];
try { visitors = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { visitors = []; }

const demoVisitors = [
  {id:'GP-1001',name:'Ravi Kumar',phone:'9876543210',purpose:'Meeting',host:'Admin office',notes:'',entry:'2026-10-22T10:15:00',exit:'',status:'Inside',qr:true},
  {id:'GP-1002',name:'Priya S',phone:'9445566778',purpose:'Interview',host:'HR Department',notes:'',entry:'2026-10-22T11:02:00',exit:'2026-10-22T12:10:00',status:'Exited',qr:true},
  {id:'GP-1003',name:'Arun K',phone:'9087654321',purpose:'Delivery',host:'Stores',notes:'',entry:'2026-10-22T12:20:00',exit:'',status:'Inside',qr:true}
];
if (!visitors.length) { visitors = demoVisitors; save(); }

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(visitors)); }
function dateTime(value){ if(!value) return '—'; return new Date(value).toLocaleString([], {year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}); }
function shortTime(value){ if(!value) return '—'; return new Date(value).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
function escapeHTML(value){ return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function initials(name){ return String(name||'?').trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(); }
function statusBadge(status){ return `<span class="status ${status==='Inside'?'inside':'exited'}">${status}</span>`; }
function visitorCell(v){ return `<div class="visitor-cell"><div class="table-avatar">${escapeHTML(initials(v.name))}</div><div><strong>${escapeHTML(v.name)}</strong><small>${escapeHTML(v.id)}</small></div></div>`; }
function render(){
  $('totalCount').textContent=visitors.length;
  $('insideCount').textContent=visitors.filter(v=>v.status==='Inside').length;
  $('qrCount').textContent=visitors.filter(v=>v.qr).length;
  $('exitedCount').textContent=visitors.filter(v=>v.status==='Exited').length;
  const latest=[...visitors].sort((a,b)=>new Date(b.entry)-new Date(a.entry)).slice(0,5);
  $('recentTable').innerHTML=latest.map(v=>`<tr><td>${visitorCell(v)}</td><td>${escapeHTML(v.purpose)}</td><td>${shortTime(v.entry)}</td><td>${statusBadge(v.status)}</td></tr>`).join('') || '<tr><td colspan="4">No visitors registered yet.</td></tr>';
  const query=($('logSearch')?.value||'').toLowerCase();
  const filter=$('statusFilter')?.value||'all';
  const filtered=[...visitors].sort((a,b)=>new Date(b.entry)-new Date(a.entry)).filter(v=>(filter==='all'||v.status===filter)&&[v.name,v.phone,v.purpose,v.id].some(s=>String(s).toLowerCase().includes(query)));
  $('logsTable').innerHTML=filtered.map(v=>`<tr><td>${visitorCell(v)}</td><td>${escapeHTML(v.phone)}</td><td>${escapeHTML(v.purpose)}</td><td>${dateTime(v.entry)}</td><td>${dateTime(v.exit)}</td><td>${statusBadge(v.status)}</td><td>${v.status==='Inside'?`<button class="text-btn" data-exit="${escapeHTML(v.id)}">Mark exit</button>`:'<span style="color:#9aa7b7">Complete</span>'}</td></tr>`).join('');
  $('noLogs').classList.toggle('hidden',filtered.length>0);
  $('adminTable').innerHTML=[...visitors].sort((a,b)=>new Date(b.entry)-new Date(a.entry)).map(v=>`<tr><td>${escapeHTML(v.id)}</td><td>${escapeHTML(v.name)}</td><td>${escapeHTML(v.phone)}</td><td>${escapeHTML(v.purpose)}</td><td>${escapeHTML(v.host||'—')}</td><td>${dateTime(v.entry)}</td><td>${dateTime(v.exit)}</td><td>${statusBadge(v.status)}</td></tr>`).join('');
  const selected=$('scanVisitorSelect').value;
  $('scanVisitorSelect').innerHTML='<option value="">Select visitor pass</option>'+visitors.filter(v=>v.qr).map(v=>`<option value="${escapeHTML(v.id)}">${escapeHTML(v.name)} — ${escapeHTML(v.id)} (${v.status})</option>`).join('');
  if(visitors.some(v=>v.id===selected)) $('scanVisitorSelect').value=selected;
}
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
  $(name+'View').classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  const titles={dashboard:'Dashboard overview',registration:'Register visitor',logs:'Visitor logs & QR scanning',admin:'Admin records'};
  $('pageTitle').textContent=titles[name]||'Dashboard';
  if(name==='logs'||name==='admin'||name==='dashboard') render();
}
document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
$('loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const username=$('username').value.trim(), password=$('password').value;
  if(username==='admin' && password==='admin123'){
    $('loginError').textContent='';
    $('loginScreen').classList.add('hidden'); $('app').classList.remove('hidden');
    sessionStorage.setItem('gatepass_logged_in','yes'); render();
  }else $('loginError').textContent='Incorrect username or password. Use the demo login shown below.';
});
$('logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem('gatepass_logged_in');$('app').classList.add('hidden');$('loginScreen').classList.remove('hidden');$('password').value='';});
if(sessionStorage.getItem('gatepass_logged_in')==='yes'){$('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');}
$('visitorForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('visitorName').value.trim(), phone=$('visitorPhone').value.trim(), purpose=$('visitorPurpose').value;
  const id='GP-'+Date.now().toString().slice(-7);
  const visitor={id,name,phone,purpose,host:$('hostName').value.trim(),notes:$('visitorNotes').value.trim(),entry:new Date().toISOString(),exit:'',status:'Inside',qr:true};
  visitors.unshift(visitor); save(); render();
  $('emptyPass').classList.add('hidden'); $('visitorPass').classList.remove('hidden');
  $('passName').textContent=name; $('passPhone').textContent=phone; $('passPurpose').textContent=purpose;
  $('passId').textContent=id; $('passCreated').textContent=dateTime(visitor.entry);
  $('qrcode').innerHTML='';
  if(window.QRCode){new QRCode($('qrcode'),{text:JSON.stringify({id,name,phone,purpose}),width:128,height:128,colorDark:'#082e55',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}
  else $('qrcode').textContent='QR library unavailable. Connect to the internet to generate the QR code.';
  $('visitorForm').reset();
  $('scanMessage').textContent='';
});
$('printPass').addEventListener('click',()=>window.print());
$('scanBtn').addEventListener('click',()=>{
  const id=$('scanVisitorSelect').value;
  if(!id){$('scanMessage').textContent='Please select a visitor pass first.';return;}
  const v=visitors.find(x=>x.id===id); if(!v)return;
  if(v.status==='Inside'){v.status='Exited';v.exit=new Date().toISOString();$('scanMessage').textContent=`✓ ${v.name} verified. Exit time recorded.`;}
  else {v.status='Inside';v.entry=new Date().toISOString();v.exit='';$('scanMessage').textContent=`✓ ${v.name} verified. New entry time recorded.`;}
  save();render();$('scanVisitorSelect').value=id;
});
$('logsTable').addEventListener('click',e=>{
  const btn=e.target.closest('[data-exit]'); if(!btn)return;
  const v=visitors.find(x=>x.id===btn.dataset.exit); if(!v)return;
  v.status='Exited';v.exit=new Date().toISOString();save();render();
});
$('logSearch').addEventListener('input',render); $('statusFilter').addEventListener('change',render);
$('exportBtn').addEventListener('click',()=>{
  const columns=['id','name','phone','purpose','host','entry','exit','status','notes'];
  const csv=[columns.join(','),...visitors.map(v=>columns.map(k=>`"${String(v[k]??'').replace(/"/g,'""')}"`).join(','))].join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}), url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download='visitor-records.csv';a.click();URL.revokeObjectURL(url);
});
render();