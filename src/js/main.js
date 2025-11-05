//one-page-per-scroll behavior + intersection observer + typewriter
(function () {
  const btn = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('nav-links');

  if (btn && mobileMenu) {
    btn.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('hidden');
    });
  }

  // proper state on resize
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      mobileMenu?.classList.add('hidden');
      navLinks?.classList.remove('hidden');
      btn?.setAttribute('aria-expanded', 'false');
    } else {
      navLinks?.classList.add('hidden');
    }
  });

  // typewriter animation text
  function typeWriter(elementId, text, speed = 90) {
    const element = document.getElementById(elementId);
    if (!element) return;
    let index = 0;
    element.innerHTML = '';
    function type() {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // IntersectionObserver
  const sections = document.querySelectorAll('section.section');
  let sectionList = Array.from(sections);

  if ('IntersectionObserver' in window && sections.length) {
    const opts = { root: null, rootMargin: '0px', threshold: 0.48 };

    const onChange = (entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        if (entry.isIntersecting) {
          section.classList.add('in-view');

          // Untuk hero section, mulai typewriter saat masuk view
          if (section.querySelector('#animated-text') && !section.dataset.typeStarted) {
            const fullText = 'Temukan Pesona Jatigede, Surga Air Biru di Jawa Barat';
            typeWriter('animated-text', fullText, 75);
            section.dataset.typeStarted = 'true';
          }
        } else {
          // menghapus kelas in-view saat keluar view
          section.classList.remove('in-view');
        }
      });
    };

    const observer = new IntersectionObserver(onChange, opts);
    sections.forEach((s) => observer.observe(s));
  } else {
    // mengatasi browser lama: langsung tambahkan kelas in-view
    sections.forEach((s) => s.classList.add('in-view'));
    const fullText = 'Temukan Pesona Jatigede, Surga Air Biru di Jawa Barat';
    typeWriter('animated-text', fullText, 75);
  }

  // ---------------------------
  // ONE-PAGE-PER-SCROLL Implementasi
  // ---------------------------
  // Config
  const ENABLE_ONLY_DESKTOP = true; // jika true, nonaktifkan behavior ini di layar < 768px
  const WHEEL_THRESHOLD = 60; // jumlah akumulasi deltaY untuk trigger
  const TOUCH_THRESHOLD = 80; // px swiped untuk trigger
  let isAnimating = false;
  let accumulate = 0;
  let lastSign = 0;
  let touchStartY = null;

  // Utilitas fungsi
  function getActiveSectionIndex() {
    return sectionList.findIndex(s => s.classList.contains('in-view'));
  }

  function clampIndex(i) {
    return Math.max(0, Math.min(sectionList.length - 1, i));
  }

  function scrollToSection(index) {
    index = clampIndex(index);
    const target = sectionList[index];
    if (!target) return;
    isAnimating = true;
    // smooth scroll
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // timeout sama atau sedikit lebih besar dari durasi scroll/transition
    setTimeout(() => { isAnimating = false; }, 700);
  }

  // Handle wheel (desktop)
  function onWheel(e) {
    if (ENABLE_ONLY_DESKTOP && window.innerWidth < 768) return;
    const delta = e.deltaY;
    // mengabaikan scroll secara horizontal
    if (Math.abs(delta) < 2) return;

    const sign = Math.sign(delta);
    if (lastSign && sign !== lastSign) {
      accumulate = 0;
    }
    lastSign = sign;
    accumulate += delta;

    if (Math.abs(accumulate) >= WHEEL_THRESHOLD && !isAnimating) {
      // determinasi arah
      const dir = accumulate > 0 ? 1 : -1;
      const active = getActiveSectionIndex();
      const nextIndex = active === -1 ? 0 : clampIndex(active + dir);
      // menghindari event default snap
      e.preventDefault();
      scrollToSection(nextIndex);
      // reset
      accumulate = 0;
      lastSign = 0;
    } else {

    }
  }

  // Handle touch for mobile/swipe
  function onTouchStart(e) {
    if (ENABLE_ONLY_DESKTOP && window.innerWidth < 768) {
    }
    touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
  }

  function onTouchEnd(e) {
    if (touchStartY === null) return;
    const endY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
    const diff = touchStartY - endY; // positive => swipe up (next)
    if (Math.abs(diff) > TOUCH_THRESHOLD && !isAnimating) {
      const dir = diff > 0 ? 1 : -1;
      const active = getActiveSectionIndex();
      const nextIndex = active === -1 ? 0 : clampIndex(active + dir);
      scrollToSection(nextIndex);
    }
    touchStartY = null;
  }

  // Bind events
  try {
    window.addEventListener('wheel', onWheel, { passive: false });
  } catch (err) {
    // older browsers
    window.addEventListener('wheel', onWheel);
  }

  // touch events untuk swipe
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // Navigasi keyboard (ArrowUp/ArrowDown / PageUp / PageDown)
  document.addEventListener('keydown', (e) => {
    if (ENABLE_ONLY_DESKTOP && window.innerWidth < 768) return;
    if (isAnimating) return;
    const active = getActiveSectionIndex();
    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      scrollToSection(clampIndex(active + 1));
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      scrollToSection(clampIndex(active - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToSection(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToSection(sectionList.length - 1);
    }
  });

  // Metode simple (for debugging)
  window.__onePageScroll = {
    scrollToSection,
    getActiveSectionIndex,
    enableOnMobile: () => { window.__onePageScroll._mobileEnabled = true; },
  };

})();

// Contact form handler: builds mailto: fallback and shows UI status.
// This IIFE is safe to include even if the contact form is not present on the page.
(function() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  // Jika form tidak ada di halaman, hentikan supaya tidak terjadi error.
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim() || 'Pesan dari Landing Page Jatigede';
    const message = form.message.value.trim();

    // basic validation
    if (!name || !email || !message) {
      alert('Silakan lengkapi Nama, Email, dan Pesan terlebih dahulu.');
      return;
    }

    // Build mailto link as a simple fallback (opens user's email client)
    const to = 'info@jatigede.example'; // default destination; ganti jika perlu
    const bodyLines = [
      'Nama: ' + name,
      'Email: ' + email,
      '',
      'Pesan:',
      message
    ];
    const mailto = 'mailto:' + encodeURIComponent(to)
                  + '?subject=' + encodeURIComponent(subject)
                  + '&body=' + encodeURIComponent(bodyLines.join('%0D%0A'));

    // Try to open mail client
    window.location.href = mailto;

    // Show a temporary status in the UI (jika elemen status ada)
    if (status) {
      status.classList.remove('hidden');
      setTimeout(() => {
        status.classList.add('hidden');
        form.reset();
      }, 4000);
    } else {
      // jika tidak ada elemen status, reset form setelah singkat
      setTimeout(() => form.reset(), 100);
    }
  });
})();