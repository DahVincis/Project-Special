window.addEventListener('scroll', function() {
    const parallaxElements = document.querySelectorAll('.parallax');
    const header = document.querySelector('header');
    const scrollPosition = window.scrollY;

    // Parallax effect
    parallaxElements.forEach(function(element) {
        let offset = window.scrollY;
        element.style.backgroundPositionY = offset * 0.5 + 'px';
    });

    // Show sticky header after scrolling
    if (scrollPosition > 200) { // Adjust the value to when you want the header to appear
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});
