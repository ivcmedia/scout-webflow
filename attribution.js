
!function(w,d){
  if(!w.rdt){
    var p=w.rdt=function(){
      p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)
    };
    p.callQueue=[];
    var t=d.createElement("script");
    t.src="https://www.redditstatic.com/ads/pixel.js";
    t.async=!0;
    var s=d.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(t,s)
  }
}(window,document);
rdt('init','a2_h0xpgl4gxp6t');
rdt('track', 'PageVisit');

  $(document).ready(function () {
    // Fire both pixels when any .button is clicked
    $('.button').click(function () {
      fbq('track', 'Lead');
      rdt('track', 'Lead');
    });

    // Fire both pixels if a form is submitted successfully
    $('form[facebook_pixel="true"]').each(function () {
      const $form = $(this);
      $form.on('submit', function () {
        const checkSuccess = setInterval(() => {
          if ($form.siblings('.w-form-done').is(':visible')) {
            fbq('track', 'Lead');
            rdt('track', 'Lead');
            clearInterval(checkSuccess);
          }
        }, 100);
      });
    });

    // Fire both pixels if redirected to form-submitted page
    if (window.location.pathname === '/form-submitted') {
      fbq('track', 'Lead');
      rdt('track', 'Lead');
    }

    // --- UTM Functions ---
    function getUTMParams() {
      const params = new URLSearchParams(window.location.search);
      const utms = {};
      for (const [key, value] of params.entries()) {
        if (key.startsWith('utm_')) {
          utms[key] = value;
          document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
      }
      return utms;
    }

    function getUTMsFromCookies() {
      const cookies = document.cookie.split('; ');
      const utms = {};
      cookies.forEach(cookie => {
        const [key, value] = cookie.split('=');
        if (key.startsWith('utm_')) {
          utms[key] = value;
        }
      });
      return utms;
    }

    const urlUTMs = getUTMParams();       // write URL values to cookies
    const cookieUTMs = getUTMsFromCookies();
    const finalUTMs = { ...cookieUTMs, ...urlUTMs };
    const utmString = new URLSearchParams(finalUTMs).toString();

    // Update all .button links with full UTMs
    if (Object.keys(finalUTMs).length > 0) {
      $('a.button').each(function () {
        const originalHref = $(this).attr('href');
        if (!originalHref || originalHref.startsWith('#')) return;
        try {
          const url = new URL(originalHref, window.location.origin);
          const params = new URLSearchParams(url.search);
          for (const key of [...params.keys()]) {
            if (key.startsWith('utm_')) params.delete(key);
          }
          for (const key in finalUTMs) {
            params.set(key, finalUTMs[key]);
          }
          url.search = params.toString();
          $(this).attr('href', url.toString());
        } catch (e) {
          console.warn('Invalid URL skipped:', originalHref);
        }
      });
    }

    // ✅ Update JotForm iframe with merged UTMs
    if (utmString) {
      $("iframe[src^='https://form.jotform.com/']").each(function () {
        const $iframe = $(this);
        const originalSrc = $iframe.attr("src");
        const url = new URL(originalSrc, window.location.origin);

        const params = new URLSearchParams(url.search);
        for (const key of [...params.keys()]) {
          if (key.startsWith('utm_')) {
            params.delete(key);
          }
        }

        for (const key in finalUTMs) {
          params.set(key, finalUTMs[key]);
        }

        url.search = params.toString();
        $iframe.attr("src", url.toString());

        console.log("✅ Updated JotForm iframe src:", url.toString());
      });
    }
  });
