document.addEventListener("DOMContentLoaded", () => {
    const toggleAnswer = (event) => {
        const parentLi = event.target.parentElement;
        const answer = parentLi.querySelector("p");

        document.querySelectorAll(".mainHelpSupport li").forEach(li => {
            li.classList.remove("active");
            li.querySelector("p").style.display = "none";
        });
    
        if (answer) {
            parentLi.classList.toggle("active");
            answer.style.display = parentLi.classList.contains("active") ? "block" : "none";
        }
    };

    document.querySelectorAll(".mainHelpSupport li h3").forEach(h3 => {
        h3.addEventListener("click", toggleAnswer);
    });
});
