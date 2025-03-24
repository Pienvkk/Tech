

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