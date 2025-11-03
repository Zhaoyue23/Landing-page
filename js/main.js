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

  // ensure proper state on resize
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      mobileMenu?.classList.add('hidden');
      navLinks?.classList.remove('hidden');
      btn?.setAttribute('aria-expanded', 'false');
    } else {
      navLinks?.classList.add('hidden');
    }
  });
})();