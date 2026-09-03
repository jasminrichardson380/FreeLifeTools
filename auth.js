/*
 * Shared Netlify Identity glue for FreeLifeTools.
 *
 * Every page that includes this script gets an Account/Log in nav link that
 * reflects the current session. Pages can also opt into extra behaviour:
 *
 *   data-auth-link            nav link, relabelled Account or Log in
 *   data-auth-when="out"      shown only to signed-out visitors
 *   data-auth-when="in"       shown only to signed-in visitors
 *   data-auth-when="pro"      shown only to signed-in Pro members
 *   data-auth-when="free"     shown only to signed-in visitors without Pro
 *   data-auth-email           filled with the signed-in email address
 *   data-auth-logout          click logs out, then goes to the page's href
 */
(function () {
  var ENDPOINTS = {
    me: '/.netlify/functions/auth-me',
    logout: '/.netlify/functions/auth-logout'
  };

  var SIGNED_OUT = { loggedIn: false, isPro: false };

  function load() {
    return fetch(ENDPOINTS.me, { credentials: 'same-origin' })
      .then(function (response) {
        return response.ok ? response.json() : SIGNED_OUT;
      })
      .catch(function () {
        return SIGNED_OUT;
      });
  }

  function shouldShow(mode, auth) {
    if (mode === 'out') return !auth.loggedIn;
    if (mode === 'in') return auth.loggedIn;
    if (mode === 'pro') return auth.loggedIn && auth.isPro;
    if (mode === 'free') return auth.loggedIn && !auth.isPro;
    return true;
  }

  function paint(auth) {
    var links = document.querySelectorAll('[data-auth-link]');

    for (var i = 0; i < links.length; i += 1) {
      links[i].textContent = auth.loggedIn ? 'Account' : 'Log in';
      links[i].setAttribute('href', auth.loggedIn ? '/account.html' : '/login.html');
    }

    var toggles = document.querySelectorAll('[data-auth-when]');

    for (var j = 0; j < toggles.length; j += 1) {
      toggles[j].hidden = !shouldShow(toggles[j].getAttribute('data-auth-when'), auth);
    }

    var emails = document.querySelectorAll('[data-auth-email]');

    for (var k = 0; k < emails.length; k += 1) {
      emails[k].textContent = auth.email || '';
    }

    document.documentElement.setAttribute('data-auth-ready', 'true');
  }

  function logout() {
    return fetch(ENDPOINTS.logout, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).catch(function () {
      /* Cookies are cleared server side either way. */
    });
  }

  function wireLogoutButtons() {
    var buttons = document.querySelectorAll('[data-auth-logout]');

    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener('click', function (event) {
        event.preventDefault();

        var destination = this.getAttribute('href') || '/index.html';

        logout().then(function () {
          // A full navigation makes the browser drop the cleared cookie.
          window.location.href = destination;
        });
      });
    }
  }

  function start() {
    wireLogoutButtons();

    window.FreeLifeAuth.ready = load().then(function (auth) {
      paint(auth);
      return auth;
    });
  }

  window.FreeLifeAuth = { load: load, logout: logout, ready: null };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
