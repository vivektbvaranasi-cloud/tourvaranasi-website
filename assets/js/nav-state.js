(function(){
  function path(){return (window.location.pathname||'/').replace(/\/+$/,'')||'/';}
  function addStyles(){
    if(document.getElementById('tv-nav-state-styles')) return;
    var s=document.createElement('style');
    s.id='tv-nav-state-styles';
    s.textContent=`
      .tv-navlinks{gap:18px!important}
      .navlinks a.is-active,.tv-navlinks a.is-active{
        background:#435852!important;
        border:1px solid #435852!important;
        color:#fff!important;
        padding:9px 12px!important;
        box-shadow:0 2px 0 rgba(0,0,0,.08);
      }
      .navlinks a.nav-cta.is-active,.tv-navlinks a.tv-nav-cta.is-active{
        background:#8d4f3d!important;
        border-color:#8d4f3d!important;
        color:#fff!important;
      }
      @media(max-width:980px){
        .navlinks a.is-active,.tv-navlinks a.is-active{width:100%;padding:10px 12px!important}
      }
    `;
    document.head.appendChild(s);
  }
  function ensureBlog(nav){
    if(Array.from(nav.querySelectorAll('a')).some(function(a){return (a.textContent||'').trim().toLowerCase()==='blog';})) return;
    var blog=document.createElement('a');
    blog.href='/blogs/';
    blog.textContent='Blog';
    var cta=nav.querySelector('.nav-cta,.tv-nav-cta');
    if(cta) nav.insertBefore(blog,cta); else nav.appendChild(blog);
  }
  function matches(href,p){
    href=(href||'').replace(/\/+$/,'')||'/';
    if(href==='/journeys-beyond-varanasi') return p==='/journeys-beyond-varanasi'||p.indexOf('/destinations/')===0;
    if(href==='/tours') return p==='/tours'||p.indexOf('/tours/')===0;
    if(href==='/experiences') return p==='/experiences'||p.indexOf('/experiences/')===0;
    if(href==='/blogs') return p==='/blogs'||p.indexOf('/blogs/')===0||p.indexOf('/travel-guide/')===0;
    if(href==='/about-us') return p==='/about-us'||p.indexOf('/about-us/')===0;
    if(href==='/plan-my-journey') return p==='/plan-my-journey'||p.indexOf('/plan-my-journey/')===0;
    return false;
  }
  function enhance(){
    addStyles();
    var p=path();
    document.querySelectorAll('.navlinks,.tv-navlinks').forEach(function(nav){
      ensureBlog(nav);
      nav.querySelectorAll('a').forEach(function(a){
        a.classList.remove('is-active');
        a.removeAttribute('aria-current');
        var href=a.getAttribute('href')||'';
        if(matches(href,p)){
          a.classList.add('is-active');
          a.setAttribute('aria-current','page');
        }
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance); else enhance();
})();
