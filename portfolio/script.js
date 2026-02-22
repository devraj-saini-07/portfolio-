document.addEventListener("DOMContentLoaded", function () {

  // ===============================
  // Sidebar Function
  // ===============================
  window.showsidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.style.display = "flex";
  };

  window.hidesidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".mainside");

    if (sidebar) sidebar.style.display = "none";
    if (main) main.style.display = "flex";
  };

  // ===============================
  // Skill Progress Animation
  // ===============================
  const bars = document.querySelectorAll(".cppproo");

  if (bars.length > 0) {
    bars.forEach(bar => {
      bar.style.animation = "loadd 2s forwards";
    });
  }

  function restart(logoId, barId) {
    const logo = document.getElementById(logoId);
    const bar = document.getElementById(barId);

    if (logo && bar) {
      logo.addEventListener("mouseenter", function () {
        bar.style.animation = "none";
        bar.offsetWidth; // force reflow
        bar.style.animation = "loadd 2s forwards";
      });
    }
  }

  restart("cpplogo", "cpppro");
  restart("javalogo", "javapro");
  restart("sqllogo", "sqlpro");
  restart("htmllogo", "htmlpro");
  restart("csslogo", "csspro");
  restart("javascriptlogo", "javascript");

  // ===============================
  // Scroll Animation (Projects)
  // ===============================
  const projects = document.querySelectorAll(".imgsize1");

  if (projects.length > 0) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    projects.forEach(project => observer.observe(project));
  }

  // ===============================
  // Footer Auto Year Update
  // ===============================
  const footerYear = document.getElementById("year22");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ===============================
  // Image Slider
  // ===============================
  const slides = document.querySelectorAll(".slide");
  let index = 0;

  if (slides.length > 0) {
    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 5000);
  }

});