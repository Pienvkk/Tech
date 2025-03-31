
const List = require('list.js'); 

const AlphabetFilterButton = document.querySelector('.sort');
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');

// check
document.addEventListener('DOMContentLoaded', function () {
    if (typeof List === 'undefined') {
        console.error('List.js is niet geladen!!');
        return;
    }

    const options = {
        valueNames: ['forename', 'surname']  // Geef de classes door waarop we willen sorteren
    };

    // Maak een nieuwe List.js instantie en wijs deze toe aan je lijst
    const archiveList = new List('archiveList', options);

    AlphabetFilterButton.addEventListener('click', function () {
        archiveList.sort('surname', { order: 'asc' });
        console.log('Lijst gesorteerd op surname');
    });

    Zoekbalk.addEventListener('input', function () {
        const searchValue = Zoekbalk.value; 
        archiveList.search(searchValue); 
        console.log(`Zoeken naar: ${searchValue}`);
    });
});