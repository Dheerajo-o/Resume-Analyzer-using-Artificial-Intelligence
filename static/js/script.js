document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyzeForm');
    const fileInput = document.getElementById('resume');
    const fileNameDisplay = document.getElementById('fileName');
    const submitBtn = document.getElementById('submitBtn');
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');
    const toast = document.getElementById('toast');

    // Display selected file name
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.style.color = 'var(--primary)';
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            fileNameDisplay.style.color = 'inherit';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        
        // UI transitions
        form.classList.add('hidden');
        resultsSection.classList.add('hidden');
        loadingState.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong during analysis.');
            }

            populateResults(data);
            
            loadingState.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            form.classList.remove('hidden'); // Show form again to allow re-analysis
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'error');
            loadingState.classList.add('hidden');
            form.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
        }
    });

    function populateResults(data) {
        // Set Category
        document.getElementById('jobCategory').textContent = data.category || 'General';

        // Animate Score Gauge
        animateGauge(data.ats_score || 0);

        // Populate Matched Keywords
        const matchedContainer = document.getElementById('matchedKeywords');
        matchedContainer.innerHTML = '';
        if (data.matched_keywords && data.matched_keywords.length > 0) {
            data.matched_keywords.forEach(kw => {
                const span = document.createElement('span');
                span.className = 'tag tag-success';
                span.textContent = kw;
                matchedContainer.appendChild(span);
            });
        } else {
            matchedContainer.innerHTML = '<span class="text-muted">No specific keywords matched.</span>';
        }

        // Populate Missing Keywords
        const missingContainer = document.getElementById('missingKeywords');
        missingContainer.innerHTML = '';
        if (data.missing_keywords && data.missing_keywords.length > 0) {
            data.missing_keywords.forEach(kw => {
                const span = document.createElement('span');
                span.className = 'tag tag-danger';
                span.textContent = kw;
                missingContainer.appendChild(span);
            });
        } else {
            missingContainer.innerHTML = '<span class="text-muted">Great! No major keywords missing.</span>';
        }

        // Populate Suggestions
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = '';
        if (data.suggestions && data.suggestions.length > 0) {
            data.suggestions.forEach(sugg => {
                const li = document.createElement('li');
                li.textContent = sugg;
                suggestionsList.appendChild(li);
            });
        } else {
            suggestionsList.innerHTML = '<li>Your resume looks highly optimized for this role!</li>';
        }
    }

    function animateGauge(score) {
        const circle = document.getElementById('scoreCircle');
        const text = document.getElementById('scoreText');
        const message = document.getElementById('scoreMessage');

        // Reset for animation
        circle.setAttribute('stroke-dasharray', `0, 100`);
        
        // Trigger reflow
        void circle.offsetWidth;
        
        // Calculate stroke color based on score
        let color = 'var(--danger)';
        let msgText = 'Needs Major Rework';
        
        if (score >= 80) {
            color = 'var(--success)';
            msgText = 'Excellent Match!';
        } else if (score >= 60) {
            color = 'var(--warning)';
            msgText = 'Good, but needs tweaking';
        }

        circle.style.stroke = color;
        message.style.color = color;
        message.textContent = msgText;

        // Animate
        setTimeout(() => {
            circle.setAttribute('stroke-dasharray', `${score}, 100`);
            
            // Animate number counting
            let current = 0;
            const step = Math.ceil(score / 30); // 30 frames
            const timer = setInterval(() => {
                current += step;
                if (current >= score) {
                    current = score;
                    clearInterval(timer);
                }
                text.textContent = `${current}%`;
            }, 30);
        }, 100);
    }

    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, 4000);
    }
});
