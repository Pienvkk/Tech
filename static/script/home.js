//image laden 

document.addEventListener("DOMContentLoaded", function() {
  const images = document.querySelectorAll('.lazy-load');

  const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const image = entry.target;
              image.src = image.dataset.src;
              observer.unobserve(image);
          }
      });
  }, { rootMargin: "0px 0px 50px 0px" });

  images.forEach(image => {
      imageObserver.observe(image);
  });
});


// carousel
var options = {
    direction: 'horizontal',
    loop: true,
    speed: 300,
    slidesPerView: 3, 

    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        type: 'bullets',
    },
  
    navigation: {
      nextEl: '.swiper-button-next', 
      prevEl: '.swiper-button-prev' 
    }
};

const swiper = new Swiper('.swiper', options);