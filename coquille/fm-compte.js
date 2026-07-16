/* ============================================================================
   Coquille partagée — fm-compte.js (R-4a). Compte utilisateur Supabase :
   connexion par lien magique + profil (pseudo), window.fmSupabase /
   window.fmCurrentUser / événement « fm-auth ».
   TRANSPLANTATION VERBATIM du bloc COMPTE du build 0.12.0 (index.html,
   l. 6906–7067) : sous cette bannière, AUCUNE ligne modifiée (preuve :
   recette-extraction.js, partie C — référence reference-compte-0.12.0.json).
   Chaque page consommatrice porte le petit markup requis (#acctDim, #acctCard,
   style #acctCss, bouton #btnAccount facultatif) et la balise CDN supabase-js ;
   tout est gardé — la page fonctionne sans réseau et sans compte.
   ============================================================================ */
/* ===== Compte utilisateur : connexion par lien magique + profil (pseudo) ===== */
(function(){
  var SB_URL="https://hifqtzxhmboxbruraiab.supabase.co";
  var SB_KEY="sb_publishable_HdA4ThMx_yDk7212nJ_sIg_J18wCNYK";
  window.fmSupabase=function(){
    if(window._fmSb) return window._fmSb;
    if(!(window.supabase&&window.supabase.createClient)) return null;
    window._fmSb=window.supabase.createClient(SB_URL,SB_KEY);
    return window._fmSb;
  };

  var dim=document.getElementById('acctDim');
  var card=document.getElementById('acctCard');
  var titleEl=document.getElementById('acctTitle');
  var bodyEl=document.getElementById('acctBody');
  var btn=document.getElementById('btnAccount');
  var currentUser=null, currentProfil=null, autoPrompted=false;

  function openModal(){ dim.classList.add('show'); card.style.display='block'; }
  function closeModal(){ dim.classList.remove('show'); card.style.display='none'; bodyEl.innerHTML=''; }
  dim.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && card.style.display==='block') closeModal(); });
  function esc(s){ var d=document.createElement('div'); d.textContent=(s==null?'':String(s)); return d.innerHTML; }
  function fb(msg,ok){ var el=document.getElementById('acctFb'); if(el){ el.textContent=msg; el.className=(ok?'good':'bad'); } }

  function showLogin(){
    titleEl.textContent="Se connecter";
    bodyEl.innerHTML=
      '<p>Reçois un lien de connexion par e-mail — aucun mot de passe à retenir.</p>'+
      '<p style="opacity:.75;font-size:.85rem">L\'application fonctionne aussi sans compte : la connexion sert seulement à partager tes routines et suivre ta progression.</p>'+
      '<input id="acctEmail" type="email" inputmode="email" autocomplete="email" placeholder="ton@email.fr">'+
      '<div id="acctFb"></div>'+
      '<div class="acct-actions">'+
        '<button id="acctCancel">Annuler</button>'+
        '<button class="acct-primary" id="acctSend">Envoyer le lien</button>'+
      '</div>';
    var email=document.getElementById('acctEmail');
    document.getElementById('acctCancel').onclick=closeModal;
    document.getElementById('acctSend').onclick=sendLink;
    email.addEventListener('keydown', function(e){ if(e.key==='Enter') sendLink(); });
    setTimeout(function(){ email.focus(); }, 30);
  }
  async function sendLink(){
    var email=((document.getElementById('acctEmail')||{}).value||'').trim();
    if(!/.+@.+\..+/.test(email)){ fb('Entre une adresse e-mail valide.',false); return; }
    var sb=window.fmSupabase(); if(!sb){ fb('Connexion au serveur impossible (réseau ?).',false); return; }
    fb('Envoi…',true);
    try{
      var redirect=location.href.split('#')[0];
      var res=await sb.auth.signInWithOtp({ email:email, options:{ emailRedirectTo:redirect } });
      if(res.error){ fb('Erreur : '+res.error.message,false); return; }
      titleEl.textContent="Vérifie tes e-mails";
      bodyEl.innerHTML='<p>Un lien de connexion a été envoyé à <b>'+esc(email)+'</b>. Ouvre-le sur cet appareil pour te connecter.</p>'+
        '<p style="opacity:.75;font-size:.85rem">Pas reçu au bout d\'une minute ? Vérifie tes indésirables (spams), ou renvoie le lien.</p>'+
        '<div class="acct-actions">'+
          '<button id="acctResend">Renvoyer le lien</button>'+
          '<button class="acct-primary" id="acctOk">Fermer</button>'+
        '</div>';
      document.getElementById('acctOk').onclick=closeModal;
      document.getElementById('acctResend').onclick=function(){
        showLogin();
        var e2=document.getElementById('acctEmail'); if(e2){ e2.value=email; }
      };
    }catch(e){ fb('Échec : '+(e&&e.message||e),false); }
  }

  async function ensureProfil(user){
    var sb=window.fmSupabase(); if(!sb) return null;
    try{
      var r=await sb.from('profils').select('id,pseudo,instrument').eq('id',user.id).maybeSingle();
      if(r.error) return null;
      return r.data;
    }catch(e){ return null; }
  }
  function showPseudoPrompt(user, existing){
    titleEl.textContent="Ton pseudo";
    var cur=(existing&&existing.pseudo)||'';
    bodyEl.innerHTML=
      '<p>Le nom affiché à côté des routines que tu partageras.</p>'+
      '<input id="acctPseudo" type="text" maxlength="40" placeholder="ex. Naomi" value="'+esc(cur)+'">'+
      '<div id="acctFb"></div>'+
      '<div class="acct-actions">'+
        '<button id="acctSkip">Plus tard</button>'+
        '<button class="acct-primary" id="acctSavePseudo">Enregistrer</button>'+
      '</div>';
    var inp=document.getElementById('acctPseudo');
    document.getElementById('acctSkip').onclick=closeModal;
    document.getElementById('acctSavePseudo').onclick=function(){ savePseudo(user); };
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') savePseudo(user); });
    setTimeout(function(){ inp.focus(); if(inp.select) inp.select(); }, 30);
  }
  async function savePseudo(user){
    var sb=window.fmSupabase(); if(!sb) return;
    var pseudo=((document.getElementById('acctPseudo')||{}).value||'').trim();
    if(!pseudo){ fb('Choisis un pseudo (ou « Plus tard »).',false); return; }
    fb('Enregistrement…',true);
    try{
      var res=await sb.from('profils').upsert({ id:user.id, pseudo:pseudo }, { onConflict:'id' }).select().maybeSingle();
      if(res.error){ fb('Erreur : '+res.error.message,false); return; }
      currentProfil=res.data||{ id:user.id, pseudo:pseudo };
      renderAccount(); closeModal();
    }catch(e){ fb('Échec : '+(e&&e.message||e),false); }
  }

  function showAccount(){
    var name=(currentProfil&&currentProfil.pseudo)||'';
    var mail=(currentUser&&currentUser.email)||'';
    titleEl.textContent="Ton compte";
    bodyEl.innerHTML=
      '<p>Connecté'+(name?' comme <b>'+esc(name)+'</b>':'')+
        (mail?'<br><span style="opacity:.7;font-size: .8125rem">'+esc(mail)+'</span>':'')+'</p>'+
      '<div class="acct-actions" style="justify-content:space-between">'+
        '<button id="acctEditPseudo">'+(name?'Changer de pseudo':'Choisir un pseudo')+'</button>'+
        '<button id="acctLogout">Se déconnecter</button>'+
      '</div>';
    document.getElementById('acctEditPseudo').onclick=function(){ showPseudoPrompt(currentUser,currentProfil); };
    document.getElementById('acctLogout').onclick=logout;
  }
  async function logout(){
    var sb=window.fmSupabase(); if(sb){ try{ await sb.auth.signOut(); }catch(e){} }
    currentUser=null; currentProfil=null; autoPrompted=false; renderAccount(); closeModal();
  }

  function renderAccount(){
    window.fmCurrentUser=currentUser; window.fmCurrentProfil=currentProfil;
    try{ document.dispatchEvent(new CustomEvent('fm-auth',{detail:{user:currentUser,profil:currentProfil}})); }catch(e){}
    if(!btn) return;
    if(currentUser){
      var name=(currentProfil&&currentProfil.pseudo)||currentUser.email||'Compte';
      btn.textContent='👤 '+name; btn.title='Ton compte';
    }else{
      btn.textContent='Se connecter'; btn.title='Recevoir un lien de connexion par e-mail';
    }
  }
  if(btn){ btn.addEventListener('click', function(){ openModal(); if(currentUser) showAccount(); else showLogin(); }); }

  async function onSession(user){
    currentUser=user||null;
    if(currentUser){
      if(!currentProfil) currentProfil=await ensureProfil(currentUser);
      renderAccount();
      if(!autoPrompted && (!currentProfil || !currentProfil.pseudo)){
        autoPrompted=true; openModal(); showPseudoPrompt(currentUser, currentProfil);
      }
    }else{
      currentProfil=null; renderAccount();
    }
  }
  function init(){
    var sb=window.fmSupabase();
    if(!sb){ renderAccount(); return; }
    sb.auth.getSession().then(function(r){
      var u=r&&r.data&&r.data.session&&r.data.session.user; onSession(u||null);
    }).catch(function(){ renderAccount(); });
    sb.auth.onAuthStateChange(function(evt, session){
      var u=session&&session.user;
      if(evt==='SIGNED_IN') onSession(u||null);
      else if(evt==='SIGNED_OUT') onSession(null);
    });
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
