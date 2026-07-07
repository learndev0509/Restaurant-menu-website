/* Smoke & Saffron — GO tier (static). Minimal: offset the sticky nav on jumps. */
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.catnav');
  document.querySelectorAll('.catnav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.getElementById(this.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 0) - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });
});
