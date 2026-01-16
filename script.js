/* ============================================
   RETRO SITE - GLOBAL JAVASCRIPT
   Handles navigation, interactions, and effects
   ============================================ */

// Wait for page to load
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupKeyboardNavigation();
});

/* ============================================
   NAVIGATION SETUP
   Makes menu items clickable
   ============================================ */
function setupNavigation() {
    // Find all menu items on the start screen
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        // Add click event
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                // Add transition effect before navigation
                document.body.style.opacity = '0';
                setTimeout(() => {
                    window.location.href = page;
                }, 300);
            }
        });
        
        // Add hover sound effect (optional - uncomment if you add sound files)
        // item.addEventListener('mouseenter', () => {
        //     playSound('hover');
        // });
    });
}

/* ============================================
   KEYBOARD NAVIGATION
   Arrow keys to navigate menu, Enter to select
   ============================================ */
function setupKeyboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems.length === 0) return; // Not on start screen
    
    let currentIndex = 0;
    
    // Highlight first item
    menuItems[0].classList.add('selected');
    
    document.addEventListener('keydown', (e) => {
        // Remove current selection
        menuItems[currentIndex].classList.remove('selected');
        
        if (e.key === 'ArrowDown') {
            // Move down
            currentIndex = (currentIndex + 1) % menuItems.length;
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            // Move up
            currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            e.preventDefault();
        } else if (e.key === 'Enter') {
            // Select current item
            menuItems[currentIndex].click();
            e.preventDefault();
        }
        
        // Highlight new selection
        menuItems[currentIndex].classList.add('selected');
        menuItems[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/* ============================================
   OPTIONAL: SOUND EFFECTS
   Add retro sound effects to interactions
   ============================================ */

// Create audio objects for different sounds
const sounds = {
    hover: null,  // new Audio('sounds/hover.mp3')
    select: null, // new Audio('sounds/select.mp3')
    error: null   // new Audio('sounds/error.mp3')
};

function playSound(soundName) {
    // Check if sound exists and is loaded
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0; // Reset to start
        sounds[soundName].play().catch(err => {
            // Browsers may block autoplay - this is normal
            console.log('Sound play blocked:', err);
        });
    }
}

/* ============================================
   UTILITY FUNCTIONS
   Helper functions used across the site
   ============================================ */

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Check if localStorage is available
function isLocalStorageAvailable() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Show browser notification if supported
function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💾</text></svg>'
        });
    }
}

/* ============================================
   PAGE TRANSITION EFFECTS
   Add fade effects when navigating
   ============================================ */
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s';
});

/* ============================================
   ADD SELECTED STATE STYLING
   For keyboard navigation
   ============================================ */
const style = document.createElement('style');
style.textContent = `
    .menu-item.selected {
        background: var(--primary) !important;
        color: var(--bg-dark) !important;
        transform: translateX(10px);
        box-shadow: 0 0 20px var(--primary);
    }
`;
document.head.appendChild(style);