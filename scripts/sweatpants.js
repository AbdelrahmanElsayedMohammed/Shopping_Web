    function q(s, c) {
      return (c || document).querySelector(s);
    }
    
    function qa(s, c) {
      return Array.from((c || document).querySelectorAll(s));
    }
    
    function showToast(msg) {
      var t = q('#toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function() {
        t.classList.remove('show');
      }, 2000);
    }
    
    function setToday() {
      var d = new Date();
      var opts = {year: 'numeric', month: 'long', day: 'numeric'};
      var el = q('#current-date');
      if (el) el.textContent = d.toLocaleDateString(undefined, opts);
      var y = q('#year');
      if (y) y.textContent = d.getFullYear();
    }
    
    function cartLoad() {
      try {
        var raw = localStorage.getItem('stylehub_cart');
        return raw ? JSON.parse(raw) : {items: {}};
      } catch (e) {
        return {items: {}};
      }
    }
    
    function cartSave(state) {
      try {
        localStorage.setItem('stylehub_cart', JSON.stringify(state));
      } catch (e) {}
    }
    
    function cartCount(state) {
      var c = 0;
      Object.keys(state.items).forEach(function(k) {
        c += state.items[k].qty;
      });
      return c;
    }
    
    function updateCartBadge() {
      var state = cartLoad();
      var cnt = q('#cart-count');
      if (cnt) {
        cnt.textContent = String(cartCount(state));
      }
    }
    
    function bounceCart() {
      var btn = q('#cart-button');
      if (btn) {
        btn.classList.add('bounce');
        setTimeout(function() {
          btn.classList.remove('bounce');
        }, 350);
      }
    }
    
    function addCartItem(name, size, price) {
      var s = cartLoad();
      var key = name + '|' + (size || '');
      var it = s.items[key];
      if (!it) {
        s.items[key] = {name: name, size: size, price: price, qty: 0};
      }
      s.items[key].qty += 1;
      cartSave(s);
      updateCartBadge();
      bounceCart();
      renderCart();
    }
    
    function changeQty(key, delta) {
      var s = cartLoad();
      if (!s.items[key]) return;
      s.items[key].qty += delta;
      if (s.items[key].qty <= 0) {
        delete s.items[key];
      }
      cartSave(s);
      updateCartBadge();
      renderCart();
    }
    
    function removeItem(key) {
      var s = cartLoad();
      if (s.items[key]) {
        delete s.items[key];
        cartSave(s);
        updateCartBadge();
        renderCart();
      }
    }
    
    function totalAmount(state) {
      var t = 0;
      Object.keys(state.items).forEach(function(k) {
        var it = state.items[k];
        t += it.price * it.qty;
      });
      return t;
    }
    
    function calcSummary(state) {
      var subtotal = totalAmount(state);
      var discount = 0;
      if (subtotal >= 200) {
        discount = subtotal * 0.10;
      }
      var total = subtotal - discount;
      return {subtotal: subtotal, discount: discount, total: total};
    }
    
    function renderCart() {
      var s = cartLoad();
      var wrap = q('#cart-items');
      var empty = q('#cart-empty');
      var total = q('#cart-total');
      if (!wrap || !empty || !total) return;
      
      wrap.innerHTML = '';
      var keys = Object.keys(s.items);
      
      if (keys.length === 0) {
        empty.style.display = 'block';
      } else {
        empty.style.display = 'none';
        var frag = document.createDocumentFragment();
        
        keys.forEach(function(k) {
          var it = s.items[k];
          var row = document.createElement('div');
          row.className = 'cart-item';
          row.innerHTML = `
            <div class="cart-item-info">
              <div>${it.name} ${it.size ? '• ' + it.size : ''}</div>
              <div>$${it.price.toFixed(2)}</div>
            </div>
            <div class="qty" data-key="${k}">
              <button class="qty-dec" aria-label="Decrease">−</button>
              <span class="qty-val">${it.qty}</span>
              <button class="qty-inc" aria-label="Increase">+</button>
              <button class="btn btn-outline remove-item" aria-label="Remove">Remove</button>
              <span class="spinner" style="display:none"></span>
            </div>
          `;
          frag.appendChild(row);
        });
        
        wrap.appendChild(frag);
      }
      
      var sum = calcSummary(s);
      var html = `Subtotal: $${sum.subtotal.toFixed(2)}`;
      if (sum.discount > 0) {
        html += `<span>Discount: -$${sum.discount.toFixed(2)}</span>`;
      }
      html += `<span>Total: $${sum.total.toFixed(2)}</span>`;
      total.innerHTML = html;
    }
    
    function openCart() {
      document.body.classList.add('cart-open');
      renderCart();
      var close = q('#cart-close');
      if (close) close.focus();
    }
    
    function closeCart() {
      document.body.classList.remove('cart-open');
    }
    
    function initNavbar() {
      var navToggle = q('#nav-toggle');
      var hamburger = q('.hamburger');
      var nav = q('#primary-navigation');
      
      if (!navToggle || !hamburger || !nav) return;
      
      function syncAria() {
        hamburger.setAttribute('aria-expanded', navToggle.checked ? 'true' : 'false');
      }
      
      navToggle.addEventListener('change', syncAria);
      syncAria();
      
      nav.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        if (a && window.matchMedia('(max-width: 640px)').matches) {
          navToggle.checked = false;
          syncAria();
        }
      });
    }
    
    function showMoreProducts() {
      var additionalProducts = qa('.additional-product');
      var showMoreBtn = q('#show-more-btn');
      
      additionalProducts.forEach(function(product) {
        product.style.display = 'block';
      });
      
      if (showMoreBtn) {
        showMoreBtn.style.display = 'none';
      }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      setToday();
      updateCartBadge();
      initNavbar();
      
      var showMoreBtn = q('#show-more-btn');
      if (showMoreBtn) {
        showMoreBtn.addEventListener('click', showMoreProducts);
      }
      
      var addToCartButtons = qa('.add-to-cart-btn');
      addToCartButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          var name = this.getAttribute('data-product');
          var price = parseFloat(this.getAttribute('data-price'));
          
          addCartItem(name, null, price);
          showToast(name + ' added to cart');
        });
      });
      
      var cartBtn = q('#cart-button');
      var overlay = q('#cart-overlay');
      var closeBtn = q('#cart-close');
      
      if (cartBtn) {
        cartBtn.addEventListener('click', function() {
          if (document.body.classList.contains('cart-open')) {
            closeCart();
          } else {
            openCart();
          }
        });
      }
      
      if (overlay) overlay.addEventListener('click', closeCart);
      if (closeBtn) closeBtn.addEventListener('click', closeCart);
      
      document.addEventListener('keydown', function(ev) {
        if (ev.key === 'Escape') closeCart();
      });
      
      var checkoutBtn = q('#checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
          try { closeCart(); } catch (e) {}
          setTimeout(function() {
            var p = window.location.pathname.toLowerCase();
            var href = (p.indexOf('/sweatpants/project/') !== -1) ? '../../checkout.html' : 'checkout.html';
            window.location.href = href;
          }, 180);
        });
      }
      
      var productsLink = q('.dropdown > a');
      if (productsLink) {
        productsLink.addEventListener('click', function(e) {
          e.preventDefault();
          this.parentElement.classList.toggle('open');
        });
      }
      
      document.body.addEventListener('click', function(e) {
        var inc = e.target.closest('.qty-inc');
        var dec = e.target.closest('.qty-dec');
        var rm = e.target.closest('.remove-item');
        
        if (inc || dec || rm) {
          var qtyEl = (inc || dec || rm).closest('.qty');
          var key = qtyEl.getAttribute('data-key');
          var row = qtyEl.closest('.cart-item');
          var spin = qtyEl.querySelector('.spinner');
          
          row.classList.add('loading');
          if (spin) spin.style.display = 'inline-block';
          
          var p = new Promise(function(resolve) {
            setTimeout(function() {
              resolve({ok: true});
            }, 250);
          });
          
          p.then(function() {
            if (inc) changeQty(key, 1);
            else if (dec) changeQty(key, -1);
            else removeItem(key);
          }).catch(function(err) {
            showToast('Failed to update cart. Please try again');
          }).finally(function() {
            if (spin) spin.style.display = 'none';
            row.classList.remove('loading');
          });
        }
      });
    });