const Zoekbalk = document.querySelector('.zoeken');

document.addEventListener('DOMContentLoaded', function () {
    if (typeof List === 'undefined') {
        console.error('List.js is niet geladen!!');
        return;
    }

    const options = {
        valueNames: ['posttitle', 'user']  
    };

    const communityList = new List('communityList', options);

    Zoekbalk.addEventListener('input', function () {
        const searchValue = Zoekbalk.value; 
        communityList.search(searchValue); 
        console.log(`Zoeken naar: ${searchValue}`);
    });
});
