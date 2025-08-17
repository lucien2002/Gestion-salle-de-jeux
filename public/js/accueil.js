document.addEventListener('DOMContentLoaded', function() {
    const timers = document.querySelectorAll('.timer');
    
    timers.forEach(timerElement => {
        const minutes = parseInt(timerElement.getAttribute('data-minutes'));
        const startTime = parseInt(timerElement.getAttribute('data-start'));
        
        // Correction du problème de syntaxe ici
        if (isNaN(minutes) || isNaN(startTime)) return;
        
        const endTime = startTime + minutes * 60 * 1000;
        let timerInterval;
        let hasAlerted = false;

        function updateTimer() {
            const now = new Date().getTime();
            const remainingTime = endTime - now;
            
            if (remainingTime <= 0) {
                timerElement.textContent = "Temps écoulé!";
                timerElement.classList.remove('warning');
                timerElement.classList.add('expired');
                clearInterval(timerInterval);
                
                // Mise en évidence de la ligne
                const clientRow = timerElement.closest('tr');
                if (clientRow) {
                    clientRow.style.backgroundColor = "#ffebee";
                }
                
                // Afficher l'alerte une seule fois
                if (!hasAlerted) {
                    alert(`Le temps de jeu pour le client ${clientRow.querySelector('td:nth-child(2)').textContent} est écoulé!`);
                    hasAlerted = true;
                }
                
                return;
            }
            
            const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            
            timerElement.textContent = `${remainingMinutes} min ${remainingSeconds} s`;
            
            // Ajout d'un style warning quand il reste moins d'1 minute
            if (remainingMinutes < 1) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
        }

        // Démarrer le timer immédiatement
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);

        // Nettoyer lors du changement de page
        window.addEventListener('beforeunload', () => {
            clearInterval(timerInterval);
        });
    });
});