
// Resource cards are collected before any functions use them.
const cards = [...document.querySelectorAll(".tool-card")];

// Automatically add a website logo/image to every resource card.
// Logos are loaded from the website domain; initials are used if a logo cannot load.
function addWebsiteImages(){
  cards.forEach(card=>{
    const link = card.querySelector('.tool-link');
    const img = card.querySelector('.image-wrap img');
    if(!link || !img) return;

    try{
      const url = new URL(link.href);
      const domain = url.hostname.replace(/^www\./,'');
      img.alt = `${card.querySelector('h3')?.textContent.trim() || domain} website logo`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
      img.onerror = ()=>{
        if(img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = '1';
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'site-fallback';
        fallback.textContent = (card.querySelector('h3')?.textContent.trim() || domain)
          .split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
        img.parentElement.appendChild(fallback);
      };
    }catch(err){
      // Keep the original image if a URL cannot be parsed.
    }
  });
}
addWebsiteImages();

const progress = document.querySelector(".top-progress");
const searchInput = document.querySelector("#searchInput");
const count = document.querySelector("#resultCount");
const empty = document.querySelector("#empty");
const themeBtn = document.querySelector("#themeBtn");
const year = document.querySelector("#year");

function updateProgress(){
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;
}
window.addEventListener("scroll", updateProgress, {passive:true});
updateProgress();

function updateCount(visible){
  count.textContent = `${visible} resource${visible === 1 ? "" : "s"} shown`;
  empty.style.display = visible ? "none" : "block";
}

function filterCards(){
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card=>{
    const name = card.dataset.name || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if(match) visible++;
  });
  updateCount(visible);
}
searchInput.addEventListener("input", filterCards);
updateCount(cards.length);

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08});

cards.forEach((card,i)=>{
  card.style.transitionDelay = `${Math.min(i % 8, 7) * 45}ms`;
  observer.observe(card);
});

// Small 3D hover effect on desktop
if (window.matchMedia("(pointer:fine)").matches){
  cards.forEach(card=>{
    card.addEventListener("mousemove", e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(700px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", ()=>{
      card.style.transform = "";
    });
  });
}

function setTheme(light){
  document.body.classList.toggle("light", light);
  themeBtn.textContent = light ? "🌙 Dark" : "☀️ Light";
  localStorage.setItem("studyToolsTheme", light ? "light" : "dark");
}
const savedTheme = localStorage.getItem("studyToolsTheme");
setTheme(savedTheme === "light");
themeBtn.addEventListener("click", ()=>setTheme(!document.body.classList.contains("light")));

if(year) year.textContent = new Date().getFullYear();
