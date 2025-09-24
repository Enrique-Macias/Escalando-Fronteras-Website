document.addEventListener('DOMContentLoaded', function() {
    const faqButtons = document.querySelectorAll('.question button');
    
    faqButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const question = button.closest('.question');
            const answer = question.querySelector('p');
            const icon = button.querySelector('.d-arrow');
            
            const isActive = answer.classList.contains('show');
            
            // Close all questions first
            faqButtons.forEach(otherButton => {
                const otherQuestion = otherButton.closest('.question');
                const otherAnswer = otherQuestion.querySelector('p');
                const otherIcon = otherButton.querySelector('.d-arrow');
                otherAnswer.classList.remove('show');
                otherIcon.classList.remove('rotate');
            });
            
            // If the clicked question wasn't active, make it active
            if (!isActive) {
                answer.classList.add('show');
                icon.classList.add('rotate');
            }
        });
    });
});