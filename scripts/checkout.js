    function q(s,c){return (c||document).querySelector(s)}
    
    function qa(s,c){return Array.from((c||document).querySelectorAll(s))}
    
    function showToast(msg){
      var t=q('#toast');
      if(!t)return;
      t.textContent=msg;
      t.classList.add('show');
      setTimeout(function(){
        t.classList.remove('show')
      },2000)
    }
    
    function setToday(){
      var d=new Date();
      var y=q('#year');
      if(y)y.textContent=d.getFullYear()
    }
    
    function cartLoad(){
      try{
        var raw=localStorage.getItem('stylehub_cart');
        return raw?JSON.parse(raw):{items:{}}
      }catch(e){
        return {items:{}}
      }
    }
    
    function cartSave(state){
      try{
        localStorage.setItem('stylehub_cart',JSON.stringify(state))
      }catch(e){}
    }
    
    function cartCount(s){
      var c=0;
      Object.keys(s.items).forEach(function(k){
        c+=s.items[k].qty
      });
      return c
    }
    
    function updateCartBadge(){
      var s=cartLoad();
      var cnt=q('#cart-count');
      if(cnt)cnt.textContent=String(cartCount(s))
    }
    
    function changeQty(key,delta){
      var s=cartLoad();
      if(!s.items[key])return;
      s.items[key].qty+=delta;
      if(s.items[key].qty<=0){
        delete s.items[key]
      }
      cartSave(s);
      updateCartBadge();
      renderSummary()
    }
    
    function removeItem(key){
      var s=cartLoad();
      if(s.items[key]){
        delete s.items[key];
        cartSave(s);
        updateCartBadge();
        renderSummary()
      }
    }
    
    function totalAmount(s){
      var t=0;
      Object.keys(s.items).forEach(function(k){
        var it=s.items[k];
        t+=it.price*it.qty
      });
      return t
    }
    
    function calcSummary(s){
      var subtotal=totalAmount(s);
      var discount=0;
      if(subtotal>=100){
        discount=subtotal*0.25
      }
      var total=subtotal-discount;
      return {subtotal:subtotal,discount:discount,total:total}
    }
    
    function renderSummary(){
      var s=cartLoad();
      var wrap=q('#order-items');
      var total=q('#order-total');
      
      if(!wrap||!total)return;
      
      wrap.innerHTML='';
      var keys=Object.keys(s.items);
      
      if(keys.length===0){
        wrap.innerHTML='<div class="summary-item"><div>Your cart is empty.</div></div>'
      }else{
        var frag=document.createDocumentFragment();
        keys.forEach(function(k){
          var it=s.items[k];
          var row=document.createElement('div');
          row.className='summary-item';
          row.innerHTML='<div>'+it.name+' '+(it.size?('• '+it.size):'')+'</div><div class="summary-qty" data-key="'+k+'"><button class="qty-dec" aria-label="Decrease">−</button><span class="qty-val">'+it.qty+'</span><button class="qty-inc" aria-label="Increase">+</button><button class="btn btn-outline remove-item" aria-label="Remove">Remove</button></div><div>$'+it.price.toFixed(2)+'</div>';
          frag.appendChild(row)
        });
        wrap.appendChild(frag)
      }
      
      var sum=calcSummary(s);
      var html='Subtotal: $'+sum.subtotal.toFixed(2);
      if(sum.discount>0){
        html+='<span>Discount: -$'+sum.discount.toFixed(2)+'</span>'
      }
      html+='<span>Total: $'+sum.total.toFixed(2)+'</span>';
      total.innerHTML=html
    }
    
    function initNavbar(){
      var navToggle=q('#nav-toggle');
      var hamburger=q('.hamburger');
      var nav=q('#primary-navigation');
      
      if(!navToggle||!hamburger||!nav)return;
      
      function syncAria(){
        hamburger.setAttribute('aria-expanded',navToggle.checked?'true':'false')
      }
      
      navToggle.addEventListener('change',syncAria);
      syncAria();
      
      nav.addEventListener('click',function(e){
        var a=e.target.closest('a');
        if(a&&window.matchMedia('(max-width: 640px)').matches){
          navToggle.checked=false;
          syncAria()
        }
      })
    }
    document.addEventListener('DOMContentLoaded',function(){
      var productsLink=q('.dropdown > a');
      if(productsLink){
        productsLink.addEventListener('click',function(e){
          e.preventDefault();
          this.parentElement.classList.toggle('open');
        });
      }
    });
    
    var REGIONS = {
      'Egypt': ['Cairo','Giza','Alexandria','Tanta','Mansoura','Aswan'],
      'Saudi Arabia': ['Riyadh','Jeddah','Dammam','Mecca','Medina'],
      'UAE': ['Dubai','Abu Dhabi','Sharjah','Ajman'],
      'Qatar': ['Doha','Al Rayyan'],
      'Kuwait': ['Kuwait City','Hawalli'],
      'USA': ['New York','Los Angeles','San Francisco','Chicago','Houston','Seattle','Boston'],
      'Canada': ['Toronto','Vancouver','Montreal','Calgary','Ottawa'],
      'UK': ['London','Manchester','Birmingham','Leeds'],
      'Germany': ['Berlin','Munich','Hamburg','Frankfurt'],
      'France': ['Paris','Lyon','Marseille'],
      'Italy': ['Rome','Milan','Naples'],
      'Spain': ['Madrid','Barcelona','Valencia']
    };
    
    function regionsFetch(){
      try{
        return Promise.resolve(REGIONS);
      }catch(e){
        return Promise.resolve(REGIONS);
      }
    }
    
    function fillSelect(sel, items, placeholder){
      while(sel.firstChild) sel.removeChild(sel.firstChild);
      var opt=document.createElement('option');
      opt.value=''; opt.textContent=placeholder||'اختر';
      sel.appendChild(opt);
      var frag=document.createDocumentFragment();
      items.forEach(function(v){
        var o=document.createElement('option');
        o.value=v; o.textContent=v;
        frag.appendChild(o);
      });
      sel.appendChild(frag);
    }
    
    function buildCityToCountryMap(regions){
      var map={};
      Object.keys(regions).forEach(function(country){
        regions[country].forEach(function(city){
          map[city]=country;
        });
      });
      return map;
    }
    
    function setBusy(el, busy){
      if(!el) return;
      el.setAttribute('aria-busy', busy ? 'true' : 'false');
    }
    
    function initRegions(){
      var citySel=q('#city');
      var countrySel=q('#country');
      var hint=q('#region-hint');
      if(!citySel || !countrySel) return;
      
      setBusy(citySel,true); setBusy(countrySel,true);
      
      regionsFetch().then(function(regions){
        var countries=Object.keys(regions).sort();
        var allCities=[];
        countries.forEach(function(c){ allCities=allCities.concat(regions[c]); });
        allCities=Array.from(new Set(allCities)).sort();
        
        var reverse=buildCityToCountryMap(regions);
        
        fillSelect(countrySel, countries, 'Choose Country');
        fillSelect(citySel, allCities, 'Choose City');
        
        setBusy(citySel,false); setBusy(countrySel,false);
        if(hint) hint.textContent='اختر الدولة لتصفية المدن أو اختر المدينة ليتم تحديد دولتها تلقائياً.';
        
        countrySel.addEventListener('change', function(){
          var c=this.value;
          setBusy(citySel,true);
          setTimeout(function(){
            if(c){
              fillSelect(citySel, regions[c].slice().sort(), 'Choose City');
            }else{
              var all=[];
              Object.keys(regions).forEach(function(cc){ all=all.concat(regions[cc]); });
              all=Array.from(new Set(all)).sort();
              fillSelect(citySel, all, 'Choose City');
            }
            setBusy(citySel,false);
            var ce=q('#city-error'); if(ce) ce.textContent='';
          },150);
        });
        
        citySel.addEventListener('change', function(){
          var city=this.value;
          if(!city) return;
          var c=reverse[city] || '';
          if(countrySel.value!==c){
            countrySel.value=c || '';
            setBusy(citySel,true);
            setTimeout(function(){
              var list=c?regions[c].slice().sort():allCities;
              fillSelect(citySel, list, 'Choose City');
              citySel.value=city;
              setBusy(citySel,false);
            },150);
          }
        });
      });
    }
    
    function setFieldError(id,msg){
      var el=q('#'+id+'-error');
      if(el) el.textContent=msg||''
    }
    function setInvalid(id,isBad){
      var el=q('#'+id);
      if(!el) return;
      if(isBad){
        el.classList.add('invalid');
        el.setAttribute('aria-invalid','true');
      }else{
        el.classList.remove('invalid');
        el.removeAttribute('aria-invalid');
      }
    }
    
    function setEmailError(msg){
      var err=q('#email-error');
      if(err) err.textContent=msg||''
    }
    
    function validateEmail(email){
      var e=email.trim();
      if(e===''){ setEmailError(''); setInvalid('email',false); return true }
      
      if(/\s/.test(e)){ setEmailError('البريد الإلكتروني لا يجب أن يحتوي فراغات'); setInvalid('email',true); return false }
      
      var atParts=e.split('@');
      if(atParts.length!==2){ setEmailError('صيغة البريد يجب أن تحتوي رمز @  '); setInvalid('email',true); return false }
      
      var local=atParts[0], domain=atParts[1];
      
      if(e.indexOf('..')!==-1){ setEmailError('غير مسموح بنقاط متتالية'); setInvalid('email',true); return false }
      
      if(!/^[A-Za-z0-9._%+-]+$/.test(local)){ setEmailError('أحرف غير مسموح بها في الجزء قبل @'); setInvalid('email',true); return false }
      if(local.startsWith('.')||local.endsWith('.')){ setEmailError('لا يجوز أن يبدأ أو ينتهي الجزء المحلي بنقطة'); setInvalid('email',true); return false }
      
      var parts=domain.split('.');
      if(parts.length<2){ setEmailError('صيغة النطاق غير صحيحة'); setInvalid('email',true); return false }
      for(var k=0;k<parts.length;k++){
        var lbl=parts[k];
        if(!/^[A-Za-z0-9-]+$/.test(lbl) || lbl.startsWith('-') || lbl.endsWith('-')){
          setEmailError('صيغة النطاق تحتوي جزءاً غير صالح'); setInvalid('email',true); return false
        }
      }
      
      var tld=parts[parts.length-1].toLowerCase();
      var provider=parts[parts.length-2].toLowerCase();
      
      var allowedTlds={'com':true,'net':true,'org':true,'edu':true};
      var allowedProviders={
        'google':true,'gmail':true,'yahoo':true,'outlook':true,'icloud':true,
        'hotmail':true,'live':true,'msn':true,'aol':true,'proton':true,
        'zoho':true,'yandex':true
      };
      
      if(!allowedProviders[provider]){
        setEmailError('مزود البريد غير مدعوم. استخدم google/yahoo/outlook/icloud وغيرها المعتمدة'); setInvalid('email',true);
        return false
      }
      if(!allowedTlds[tld]){
        setEmailError('نطاق غير معتمد. استخدم ‎.com أو ‎.net أو ‎.org أو ‎.edu'); setInvalid('email',true);
        return false
      }
      
      setEmailError('');
      setInvalid('email',false);
      return true
    }
    
    var REQUIRED_CARD_LEN=16;
    
    function validateName(){
      var v=q('#name')?q('#name').value.trim():'';
      if(v===''){ setFieldError('name',''); setInvalid('name',false); return true }
      if(v.length<2){ setFieldError('name','يرجى إدخال الاسم الكامل'); setInvalid('name',true); return false }
      setFieldError('name',''); setInvalid('name',false); return true
    }
    
    function validatePhone(){
      var el=q('#phone'); if(!el) return true;
      var v=el.value;
      if(v.trim()===''){ setFieldError('phone',''); setInvalid('phone',false); return true }
      setFieldError('phone',''); setInvalid('phone',false); return true
    }
    
    function validateZip(){
      var el=q('#zip'); if(!el) return true;
      var v=el.value.trim();
      var digits=v.replace(/\s+/g,'');
      if(digits===''){ setFieldError('zip',''); setInvalid('zip',false); return true }
      if(!/^\d{3,10}$/.test(digits)){ setFieldError('zip','الرمز البريدي يجب أن يكون أرقاماً بين 3-10'); setInvalid('zip',true); return false }
      setFieldError('zip',''); setInvalid('zip',false); return true
    }
    
    function validateAddress(){
      var v=q('#address')?q('#address').value.trim():'';
      if(v===''){ setFieldError('address',''); setInvalid('address',false); return true }
      if(v.length<5){ setFieldError('address','يرجى إدخال عنوان صحيح'); setInvalid('address',true); return false }
      setFieldError('address',''); setInvalid('address',false); return true
    }
    
    function luhn(num){
      var s=0,alt=false;
      for(var i=num.length-1;i>=0;i--){
        var n=parseInt(num[i],10);
        if(alt){ n*=2; if(n>9) n-=9 }
        s+=n; alt=!alt
      }
      return s%10===0
    }
    
    function formatCardInput(){
      var el=q('#card'); if(!el) return;
      var v=el.value.replace(/\D+/g,'').slice(0,REQUIRED_CARD_LEN);
      var parts=[]; for(var i=0;i<v.length;i+=4){ parts.push(v.slice(i,i+4)) }
      el.value=parts.join(' ')
    }
    
    function validateCardNumber(required){
      var el=q('#card'); if(!el) return true;
      var num=el.value.replace(/\s+/g,'');
      if(num===''){
        if(required){ setFieldError('card','يرجى إدخال رقم البطاقة'); setInvalid('card',true); return false }
        setFieldError('card',''); setInvalid('card',false); return true
      }
      if(!/^\d+$/.test(num)){ setFieldError('card','يسمح فقط بالأرقام في رقم البطاقة'); setInvalid('card',true); return false }
      if(num.length!==REQUIRED_CARD_LEN){ setFieldError('card','رقم البطاقة يجب أن يحتوي '+REQUIRED_CARD_LEN+' رقماً بالضبط'); setInvalid('card',true); return false }
      setFieldError('card',''); setInvalid('card',false); return true
    }
    
    function initExpiry(){
      var mSel=q('#exp-month'); var ySel=q('#exp-year');
      if(!mSel||!ySel) return;
      while(mSel.firstChild) mSel.removeChild(mSel.firstChild);
      while(ySel.firstChild) ySel.removeChild(ySel.firstChild);
      var mOpt=document.createElement('option'); mOpt.value=''; mOpt.textContent='MM'; mSel.appendChild(mOpt);
      for(var m=1;m<=12;m++){ var o=document.createElement('option'); o.value=String(m).padStart(2,'0'); o.textContent=String(m).padStart(2,'0'); mSel.appendChild(o) }
      var now=new Date(); var start=now.getFullYear(); var end=start+15;
      var yOpt=document.createElement('option'); yOpt.value=''; yOpt.textContent='YY'; ySel.appendChild(yOpt);
      for(var y=start;y<=end;y++){ var oy=document.createElement('option'); oy.value=String(y).slice(-2); oy.textContent=String(y).slice(-2); ySel.appendChild(oy) }
    }
    
    function validateExpiry(){
      var mSel=q('#exp-month'); var ySel=q('#exp-year');
      if(!mSel||!ySel) return true;
      var m=mSel.value; var y=ySel.value;
      if(!m||!y){ setFieldError('exp','يرجى اختيار الشهر والسنة'); return false }
      var now=new Date(); var cm=now.getMonth()+1; var cy=String(now.getFullYear()).slice(-2);
      var im=parseInt(m,10); var iy=parseInt(y,10);
      var icy=parseInt(cy,10);
      if(iy<icy || (iy===icy && im<cm)){ setFieldError('exp','تاريخ الانتهاء يجب أن يكون مستقبلياً'); setInvalid('exp-month',true); setInvalid('exp-year',true); return false }
      setFieldError('exp',''); setInvalid('exp-month',false); setInvalid('exp-year',false); return true
    }
    
    function validateCVV(){
      var el=q('#cvv'); if(!el) return true;
      var v=el.value.replace(/\D+/g,'');
      el.value=v;
      if(v===''){ setFieldError('cvv',''); setInvalid('cvv',false); return true }
      if(!/^\d{3,4}$/.test(v)){ setFieldError('cvv','CVV يجب أن يكون 3-4 أرقام'); setInvalid('cvv',true); return false }
      setFieldError('cvv',''); setInvalid('cvv',false); return true
    }
    
    function validateHolder(required){
      var v=q('#holder')?q('#holder').value.trim():'';
      if(v===''){
        if(required){ setFieldError('holder','يرجى إدخال اسم حامل البطاقة'); setInvalid('holder',true); return false }
        setFieldError('holder',''); setInvalid('holder',false); return true
      }
      if(v.replace(/\s+/g,'').length<2){ setFieldError('holder','الاسم يجب ألا يكون فارغاً ويحتوي على حرفين على الأقل'); setInvalid('holder',true); return false }
      setFieldError('holder',''); setInvalid('holder',false); return true
    }
    
    function initLiveValidation(){
      var nameEl=q('#name'); if(nameEl) nameEl.addEventListener('blur',validateName);
      var emailEl=q('#email'); if(emailEl) emailEl.addEventListener('blur',function(){ validateEmail(emailEl.value) });
      var phoneEl=q('#phone'); if(phoneEl){ phoneEl.addEventListener('input',validatePhone); phoneEl.addEventListener('blur',validatePhone) }
      var zipEl=q('#zip'); if(zipEl){ zipEl.addEventListener('input',validateZip); zipEl.addEventListener('blur',validateZip) }
      var addrEl=q('#address'); if(addrEl){ addrEl.addEventListener('blur',validateAddress) }
      var cardEl=q('#card'); if(cardEl){ cardEl.addEventListener('input',function(){ formatCardInput(); validateCardNumber(false) }); cardEl.addEventListener('blur',function(){ validateCardNumber(false) }) }
      initCombinedExpiryValidation();
      var cvvEl=q('#cvv'); if(cvvEl){ cvvEl.addEventListener('input',validateCVV); cvvEl.addEventListener('blur',validateCVV) }
      var holderEl=q('#holder'); if(holderEl){ holderEl.addEventListener('input',function(){ validateHolder(false) }); holderEl.addEventListener('blur',function(){ validateHolder(false) }) }
      var countrySel=q('#country'); if(countrySel){ }
    }
    
    function initCombinedExpiryValidation(){
      var mSel=q('#exp-month'); var ySel=q('#exp-year');
      if(!mSel||!ySel) return;
      function onChange(){
        var m=mSel.value; var y=ySel.value;
        if(m && y){
          validateExpiry();
        }else{
          setFieldError('exp','');
        }
      }
      mSel.addEventListener('change',onChange);
      ySel.addEventListener('change',onChange);
    }
    
    function initEnterNavigation(){
      var order=['name','email','phone','zip','address','country','city','card','exp-month','exp-year','cvv','holder','place-order'];
      var form=q('#checkout-form');
      if(!form) return;
      form.addEventListener('keydown',function(e){
        if(e.key==='Enter'){
          var target=e.target;
          var id=target.id;
          var idx=order.indexOf(id);
          if(idx>-1){
            e.preventDefault();
            var nextId=order[idx+1];
            var next=nextId?q('#'+nextId):null;
            if(next) next.focus()
          }
        }
      });
    }
    
    function initReset(){
      var btn=q('#reset-form'); var form=q('#checkout-form');
      if(!btn||!form) return;
      btn.addEventListener('click',function(){
        form.reset();
        initExpiry();
        initRegions();
        setEmailError('');
        setFieldError('name',''); setFieldError('phone',''); setFieldError('zip',''); setFieldError('address','');
        setFieldError('card',''); setFieldError('exp',''); setFieldError('cvv',''); setFieldError('holder','');
        formatCardInput();
      });
    }
    function serverValidateEmail(email){
      return Promise.resolve(true);
    }
    
    function validateForm(){
      var req=['name','email','address'];
      for(var i=0;i<req.length;i++){
        var el=q('#'+req[i]);
        if(!el||!el.value.trim()){
          showToast('يرجى ملء جميع الحقول');
          if(req[i]==='email') setEmailError('يرجى إدخال البريد الإلكتروني');
          return false
        }
      }
      
      var emailVal=q('#email')?q('#email').value:'';
      if(!validateEmail(emailVal)){ return false }
      if(!validateName()) return false
      if(!validatePhone()) return false
      if(!validateZip()) return false
      if(!validateAddress()) return false
      
      var countrySel=q('#country');
      var citySel=q('#city');
      var countryErr=q('#country-error');
      var cityErr=q('#city-error');
      var ok=true;
      if(!countrySel || !countrySel.value){
        if(countryErr) countryErr.textContent='يرجى اختيار الدولة';
        ok=false;
      }else{ if(countryErr) countryErr.textContent=''; }
      if(!citySel || !citySel.value){
        if(cityErr) cityErr.textContent='يرجى اختيار المدينة';
        ok=false;
      }else{ if(cityErr) cityErr.textContent=''; }
      if(!ok){ return false }
      
      var pm=document.querySelector('input[name="pay"]:checked');
      if(pm&&pm.value==='card'){
        if(!validateCardNumber(true)) return false
        if(!validateExpiry()) return false
        if(!validateCVV()) return false
        if(!validateHolder(true)) return false
      }
      return true
    }
    
    function placeOrder(){
      if(!validateForm())return;
      
      cartSave({items:{}});
      updateCartBadge();
      renderSummary();
      showToast('تم تأكيد الطلب');
      
      setTimeout(function(){
        window.location.href='index.html'
      },700)
    }
    
    document.addEventListener('DOMContentLoaded',function(){
      setToday();
      updateCartBadge();
      initNavbar();
      renderSummary();
      initRegions();
      initExpiry();
      initLiveValidation();
      initEnterNavigation();
      initReset();
      
      document.body.addEventListener('click',function(e){
        var inc=e.target.closest('.qty-inc');
        var dec=e.target.closest('.qty-dec');
        var rm=e.target.closest('.remove-item');
        
        if(inc||dec||rm){
          var qtyEl=(inc||dec||rm).closest('.summary-qty');
          var key=qtyEl.getAttribute('data-key');
          
          if(inc)changeQty(key,1);
          else if(dec)changeQty(key,-1);
          else removeItem(key)
        }
      });
      
      var pays=qa('input[name="pay"]');
      pays.forEach(function(r){
        r.addEventListener('change',function(){
          var v=this.value;
          var cf=q('#card-fields');
          if(cf)cf.style.display=(v==='card')?'grid':'none'
        })
      });
      
      var cf=q('#card-fields');
      if(cf)cf.style.display='grid';
      
      var form=q('#checkout-form');
      if(form) form.addEventListener('submit',async function(e){
        e.preventDefault();
        if(!validateForm()) return;
        var emailVal=q('#email')?q('#email').value.trim():'';
        var okServer=await serverValidateEmail(emailVal);
        if(!okServer){
          setEmailError('البريد الإلكتروني غير معتمد من الخادم');
          return;
        }
        placeOrder();
      });
    });