/* ================= HERO SLIDER AUTO PLAY ================= */

const slides = document.querySelectorAll(".hero-slider .slide");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

function nextSlide() {
  currentSlide++;
  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  showSlide(currentSlide);
}

/* start slider */
if (slides.length > 1) {
  setInterval(nextSlide, 5000); // 5 seconds
}

/* ================= TESTIMONIAL SLIDER ================= */

const testimonials = document.querySelectorAll(".testimonial");
let currentTestimonial = 0;

function showTestimonial(index) {
  testimonials.forEach(t => t.classList.remove("active"));
  testimonials[index].classList.add("active");
}

function nextTestimonial() {
  currentTestimonial++;
  if (currentTestimonial >= testimonials.length) {
    currentTestimonial = 0;
  }
  showTestimonial(currentTestimonial);
}

if (testimonials.length > 1) {
  setInterval(nextTestimonial, 6000); // 6 seconds
}

/* ================= DARK MODE TOGGLE ================= */

const toggle = document.getElementById("darkToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    toggle.textContent = 
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}

