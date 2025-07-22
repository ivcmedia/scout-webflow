// Initialize Reddit Pixel
!function(w,d){
  if(!w.rdt){
    var p=w.rdt=function(){
      p.sendEvent ? p.sendEvent.apply(p,arguments) : p.callQueue.push(arguments);
    };
    p.callQueue = [];
    var t = d.createElement("script");
    t.src = "https://www.redditstatic.com/ads/pixel.js";
    t.async = true;
    var s = d.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(t,s);
  }
}(window,document);

// Start Reddit pixel with your pixel ID
rdt('init', 'a2_h0xpgl4gxp6t');
rdt('track', 'PageVisit'); // Log page visit immediately

$(document).ready(function () {
  // 🔁 FIRE PIXELS ON INTERACTION

  // Fire Facebook and Reddit pixels when any .button is clicked
  $('.button').click(function () {
    fbq('track', 'Contact');
    rdt('track', 'ViewContent');
  });

  // Watch for successful native Webflow form submissions and fire pixels
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

  // 🎯 UTM PARAMETER LOGIC

  // Capture UTM parameters from URL and store them in cookies
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_')) {
        utms[key] = value;
        // Store in cookie for up to 7 days
        document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    }
    return utms;
  }

  // Retrieve UTM values from cookies
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

  // Combine cookie-stored UTMs with those from the current URL
  const urlUTMs = getUTMParams(); // Updates cookies if present in URL
  const cookieUTMs = getUTMsFromCookies();
  const finalUTMs = { ...cookieUTMs, ...urlUTMs }; // Prefer URL if available
  const utmString = new URLSearchParams(finalUTMs).toString();

  // 🔗 UPDATE BUTTON LINKS WITH UTM TRACKING

  if (Object.keys(finalUTMs).length > 0) {
    $('a.button').each(function () {
      const originalHref = $(this).attr('href');
      if (!originalHref || originalHref.startsWith('#')) return;
      try {
        const url = new URL(originalHref, window.location.origin);
        const params = new URLSearchParams(url.search);

        // Remove existing UTM params
        for (const key of [...params.keys()]) {
          if (key.startsWith('utm_')) params.delete(key);
        }

        // Add final UTM set
        for (const key in finalUTMs) {
          params.set(key, finalUTMs[key]);
        }

        url.search = params.toString();
        $(this).attr('href', url.toString());
      } catch (e) {
        console.warn('⚠️ Invalid link skipped for UTM update:', originalHref);
      }
    });
  }

  // 🧠 INJECT UTM PARAMS INTO JOTFORM IFRAME

  if (utmString) {
    $("iframe[src^='https://form.jotform.com/']").each(function () {
      const $iframe = $(this);
      const originalSrc = $iframe.attr("src");
      const url = new URL(originalSrc, window.location.origin);
      const params = new URLSearchParams(url.search);

      // Remove existing UTM params from the iframe URL
      for (const key of [...params.keys()]) {
        if (key.startsWith('utm_')) {
          params.delete(key);
        }
      }

      // Add fresh UTMs
      for (const key in finalUTMs) {
        params.set(key, finalUTMs[key]);
      }

      url.search = params.toString();
      $iframe.attr("src", url.toString());

      console.log("✅ Updated JotForm iframe src:", url.toString());
    });
  }
});
