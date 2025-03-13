// carousel
var options = {
    direction: 'horizontal',
    loop: true,  // Booleaanse waarde in plaats van een string
    speed: 300, 
    cssMode: true, 
  
    // pagination
    pagination: {
      el: '.swiper-pagination', 
      type: 'fraction' 
    },
  
    // navigation arrows
    navigation: {
      nextEl: '.swiper-button-next', 
      prevEl: '.swiper-button-prev' 
    }
};

// Initialiseren van de Swiper
const swiper = new Swiper('.swiper', options);