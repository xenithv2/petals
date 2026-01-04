document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 30;
  const y = (window.innerHeight / 2 - e.clientY) / 30;

  document.querySelector(".logo-3d").style.transform =
    `translateX(-50%) rotateY(${x}deg) rotateX(${y}deg)`;

  document.querySelector(".crown-3d").style.transform =
    `translateX(-50%) rotateY(${x * 2}deg) rotateX(${y * 2}deg)`;
});
