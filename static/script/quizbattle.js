console.log ('ik werk')

document.addEventListener("DOMContentLoaded", function() {
    let currentQuestionIndex = 0;
    const sections = document.querySelectorAll(".quiz-question");
    
    function showQuestion(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('is-active', i === index);
        });
    }
    

    document.querySelectorAll(".nextBtn").forEach((btn, index) => {
        btn.addEventListener("click", function() {
            if (currentQuestionIndex < sections.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            }
        });
    });

    document.querySelectorAll(".previousBtn").forEach((btn, index) => {
        btn.addEventListener("click", function() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                showQuestion(currentQuestionIndex);
            }
        });
    });

    showQuestion(currentQuestionIndex);

    document.querySelector('.submit-quiz').addEventListener('click', function() {
        const selectedAnswers = [];

        questions.forEach((question) => {
            const selectedOption = document.querySelector(`input[name="vraag${question._id}"]:checked`);
            if (selectedOption) {
                selectedAnswers.push({
                    question: question.question,
                    answer: selectedOption.value
                });
            }
        });

        if (selectedAnswers.length < questions.length) {
            alert("Je hebt niet alle vragen beantwoord!");
            return;
        }

        fetch('/submit-quiz', {
            method: 'POST',
            body: JSON.stringify(selectedAnswers),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Quiz verzonden:', data);
            alert(`Quiz succesvol verzonden! Jouw score: ${data.score}/${questions.length}`);
        })
        .catch(error => {
            console.error('Fout bij verzenden:', error);
            alert("Er ging iets mis bij het verzenden van je antwoorden.");
        });
    });
});
