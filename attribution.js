
$(document).ready(function () {
  console.log("✅ DOM Ready");

  // 🔁 FIRE PIXELS ON INTERACTION
  $('[data-utm]').click(function () {
    console.log("📦 Clicked UTM-tracked element:", this);
    fbq('track', 'Lead');
    
  });

  // ✅ Monitor Webflow form submissions
  $('form[facebook_pixel="true"]').each(function () {
    const $form = $(this);
    console.log("📝 Watching form for Facebook pixel:", $form);
    $form.on('submit', function () {
      const checkSuccess = setInterval(() => {
        if ($form.siblings('.w-form-done').is(':visible')) {
          console.log("🎯 Form submitted successfully");
          fbq('track', 'Lead');
          clearInterval(checkSuccess);
        }
      }, 100);
    });
  });

  // 🎯 UTM PARAMETER LOGIC
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_')) {
        utms[key] = value;
        document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    }
    console.log("🔍 UTMs from URL:", utms);
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
    console.log("🍪 UTMs from cookies:", utms);
    return utms;
  }

  const urlUTMs = getUTMParams();
  const cookieUTMs = getUTMsFromCookies();
  const finalUTMs = { ...cookieUTMs, ...urlUTMs };
  const utmString = new URLSearchParams(finalUTMs).toString();

  console.log("🧠 Final merged UTMs:", finalUTMs);
  console.log("🔗 Final UTM query string:", utmString);

  // 🔗 UPDATE BUTTON LINKS WITH UTM TRACKING
  if (Object.keys(finalUTMs).length > 0) {
    $('[data-utm]').each(function () {
      const originalHref = $(this).attr('href');
      console.log("🔗 Processing element:", this.tagName, originalHref);

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

        console.log("✅ Updated href with UTMs:", url.toString());
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

      for (const key of [...params.keys()]) {
        if (key.startsWith('utm_')) {
          params.delete(key);
        }
      }

      for (const key in finalUTMs) {
        params.set(key, finalUTMs[key]);
      }

      url.search = params.toString();
      $iframe.attr("src", url.toStrirng());

      console.log("✅ Updated JotForm iframe src:", url.toString());
    });
  }
});
