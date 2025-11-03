
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
  function typeWriter(elementId, text, speed = 100) {
    const element = document.getElementById(elementId);

    if (!element) return;
    let index = 0;
    element.innerHTML = '';
    function type() {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        element.innerHTML = 'Temukan Pesona <br class="hidden md:inline" />Jatigede, Surga <br class="hidden md:inline" />Air Biru di Jawa <br class="hidden md:inline" />Barat';
      }
    }

    type();
  }

  // callback
  const fullText = 'Temukan Pesona Jatigede, Surga Air Biru di Jawa Barat';
  typeWriter('animated-text', fullText, 100); 
})();