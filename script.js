// Tab Layanan
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.service-list').forEach(list => list.classList.remove('active'));
        
        // Add active class
        button.classList.add('active');
        const category = button.dataset.category;
        document.getElementById(`${category}-services`).classList.add('active');
    });
});

// DOM Elements
const categoryTabs = document.querySelector('.category-tabs');
const serviceCards = document.querySelectorAll('.service-card');

// Service Filtering
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    // Function to show all services with animation
    function showAllServices() {
        serviceCards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        });
    }

    // Function to filter services by category
    function filterServices(category) {
        serviceCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Add click event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get selected category
            const selectedCategory = button.getAttribute('data-category');
            
            // Filter services
            if (selectedCategory === 'all') {
                showAllServices();
            } else {
                filterServices(selectedCategory);
            }
        });
    });

    // Show all services initially
    showAllServices();
});

// Form Validation
const bookingForm = document.querySelector('.booking-form form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic form validation
        const required = bookingForm.querySelectorAll('[required]');
        let isValid = true;
        
        required.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            // Here you would typically send the form data to a server
            alert('Booking berhasil! Kami akan menghubungi Anda segera.');
            bookingForm.reset();
        }
    });
}

// Contact Form Validation
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic form validation
        const required = contactForm.querySelectorAll('[required]');
        let isValid = true;
        
        required.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            // Here you would typically send the form data to a server
            alert('Pesan Anda telah terkirim! Kami akan merespons segera.');
            contactForm.reset();
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMain = document.querySelector('.nav-main');
    const body = document.body;
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        menuToggle.classList.toggle('active');
        navMain.classList.toggle('active');
        body.classList.toggle('menu-open');
    }

    function closeMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            menuToggle.classList.remove('active');
            navMain.classList.remove('active');
            body.classList.remove('menu-open');
        }
    }

    if (menuToggle && navMain) {
        // Toggle menu when clicking the hamburger button
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !menuToggle.contains(e.target) && !navMain.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMain.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });

        // Prevent clicks inside the menu from closing it
        navMain.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

// Header Scroll Effect
const header = document.querySelector('.header-main');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scrolling down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scrolling up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Service Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const serviceLists = document.querySelectorAll('.service-list');

    function switchTab(category) {
        // Remove active class from all tabs and lists
        tabButtons.forEach(btn => btn.classList.remove('active'));
        serviceLists.forEach(list => list.classList.remove('active'));

        // Add active class to selected tab and list
        const selectedTab = document.querySelector(`.tab-btn[data-category="${category}"]`);
        const selectedList = document.getElementById(`${category}-services`);
        
        if (selectedTab && selectedList) {
            selectedTab.classList.add('active');
            selectedList.classList.add('active');
        }
    }

    // Add click event listeners to tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            switchTab(category);
        });
    });

    // Booking Form Functionality
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const carPriceSelect = document.getElementById('carPrice');
    const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
    const packageRadios = document.querySelectorAll('input[name="package"]');
    const selectedCategoryElement = document.getElementById('selectedCategory');
    const selectedServicesElement = document.getElementById('selectedServices');
    const totalPriceElement = document.getElementById('totalPrice');
    const serviceDateInput = document.getElementById('serviceDate');
    const serviceTimeInput = document.getElementById('serviceTime');
    const selectedDateElement = document.getElementById('selectedDate');
    const selectedTimeElement = document.getElementById('selectedTime');

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    serviceDateInput.min = tomorrow.toISOString().split('T')[0];

    // Service base prices and rates
    const servicePrices = {
        ketok: {
            body: {
                standard: { base: 165000, rate: 33000 },
                luxury: { base: 275000, rate: 55000 }
            },
            tiang: {
                standard: { base: 220000, rate: 33000 },
                luxury: { base: 330000, rate: 66000 }
            }
        },
        las: {
            body: {
                standard: { base: 55000, rate: 16500 },
                luxury: { base: 110000, rate: 33000 }
            },
            tiang: {
                standard: { base: 82500, rate: 16500 },
                luxury: { base: 137500, rate: 33000 }
            },
            kropos: {
                standard: { base: 165000, rate: 33000 },
                luxury: { base: 275000, rate: 66000 }
            },
            bodykit: {
                standard: { base: 165000, rate: 0 },
                luxury: { base: 440000, rate: 0 }
            }
        },
        press: {
            kacamata: {
                standard: { base: 770000, rate: 0 },
                luxury: { base: 1650000, rate: 0 }
            },
            crossmember: {
                standard: { base: 660000, rate: 0 },
                luxury: { base: 1320000, rate: 0 }
            },
            tiangpintu: {
                standard: { base: 1100000, rate: 0 },
                luxury: { base: 2420000, rate: 0 }
            },
            afron: {
                standard: { base: 770000, rate: 0 },
                luxury: { base: 1650000, rate: 0 }
            }
        },
        additional: {
            angkatbody: {
                standard: { base: 2750000, rate: 0 },
                luxury: { base: 2750000, rate: 0 }
            },
            aksesoris: {
                standard: { base: 55000, rate: 0 },
                luxury: { base: 55000, rate: 0 }
            }
        },
        'cat-small': {
            bumper: {
                silver: { base: 770000 },
                gold: { base: 990000 },
                platinum: { base: 1100000 }
            },
            fender: {
                silver: { base: 770000 },
                gold: { base: 990000 },
                platinum: { base: 1100000 }
            },
            pintu: {
                silver: { base: 770000 },
                gold: { base: 990000 },
                platinum: { base: 1100000 }
            },
            kapMesin: {
                silver: { base: 770000 },
                gold: { base: 990000 },
                platinum: { base: 1100000 }
            },
            bagasi: {
                silver: { base: 770000 },
                gold: { base: 990000 },
                platinum: { base: 1100000 }
            },
            bodykit: {
                silver: { base: 385000 },
                gold: { base: 495000 },
                platinum: { base: 550000 }
            },
            atap: {
                silver: { base: 1540000 },
                gold: { base: 1980000 },
                platinum: { base: 2200000 }
            },
            coverSpion: {
                silver: { base: 137500 },
                gold: { base: 275000 },
                platinum: { base: 330000 }
            },
            qpanel: {
                silver: { base: 440000 },
                gold: { base: 825000 },
                platinum: { base: 1100000 }
            },
            tangga: {
                silver: { base: 440000 },
                gold: { base: 825000 },
                platinum: { base: 1100000 }
            },
            tiangAtas: {
                silver: { base: 440000 },
                gold: { base: 825000 },
                platinum: { base: 1100000 }
            },
            wingBagasi: {
                silver: { base: 385000 },
                gold: { base: 495000 },
                platinum: { base: 550000 }
            },
            clearLampu: {
                silver: { base: 385000 },
                gold: { base: 495000 },
                platinum: { base: 550000 }
            },
            velg: {
                silver: { base: 385000 },
                gold: { base: 495000 },
                platinum: { base: 550000 }
            },
            antiKarat: {
                silver: { base: 1650000 }
            },
            plingcoat: {
                gold: { base: 1210000 }
            },
            dalamanPintu: {
                silver: { base: 385000 },
                gold: { base: 550000 },
                platinum: { base: 660000 }
            },
            coverPowerWindow: {
                silver: { base: 165000 },
                gold: { base: 275000 },
                platinum: { base: 300000 }
            },
            doortrim: {
                silver: { base: 275000 },
                gold: { base: 385000 },
                platinum: { base: 440000 }
            },
            fullBody: {
                silver: { base: 9900000 },
                gold: { base: 11000000 },
                platinum: { base: 13200000 }
            },
            pijakanKaki: {
                silver: { base: 275000 },
                gold: { base: 385000 },
                platinum: { base: 440000 }
            }
        },
        'cat-large': {
            bumper: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            fender: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            pintu: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            kapMesin: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            bagasi: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            bodykit: {
                silver: { base: 440000 },
                gold: { base: 550000 },
                platinum: { base: 605000 }
            },
            atap: {
                silver: { base: 1760000 },
                gold: { base: 2200000 },
                platinum: { base: 2420000 }
            },
            coverSpion: {
                silver: { base: 192500 },
                gold: { base: 330000 },
                platinum: { base: 385000 }
            },
            qpanel: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            tangga: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            tiangAtas: {
                silver: { base: 880000 },
                gold: { base: 1100000 },
                platinum: { base: 1210000 }
            },
            wingBagasi: {
                silver: { base: 440000 },
                gold: { base: 550000 },
                platinum: { base: 605000 }
            },
            clearLampu: {
                silver: { base: 440000 },
                gold: { base: 550000 },
                platinum: { base: 605000 }
            },
            velg: {
                silver: { base: 440000 },
                gold: { base: 550000 },
                platinum: { base: 605000 }
            },
            antiKarat: {
                silver: { base: 2200000 }
            },
            plingcoat: {
                gold: { base: 1870000 }
            },
            dalamanPintu: {
                silver: { base: 440000 },
                gold: { base: 550000 },
                platinum: { base: 770000 }
            },
            coverPowerWindow: {
                silver: { base: 220000 },
                gold: { base: 330000 },
                platinum: { base: 385000 }
            },
            doortrim: {
                silver: { base: 330000 },
                gold: { base: 440000 },
                platinum: { base: 495000 }
            },
            fullBody: {
                silver: { base: 12100000 },
                gold: { base: 15400000 },
                platinum: { base: 16500000 }
            },
            pijakanKaki: {
                silver: { base: 330000 },
                gold: { base: 440000 },
                platinum: { base: 495000 }
            }
        },
        'cat-luxury': {
            bumper: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            fender: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            pintu: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            kapMesin: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            bagasi: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            bodykit: {
                silver: { base: 495000 },
                gold: { base: 660000 },
                platinum: { base: 825000 }
            },
            atap: {
                silver: { base: 1980000 },
                gold: { base: 2860000 },
                platinum: { base: 3300000 }
            },
            coverSpion: {
                silver: { base: 275000 },
                gold: { base: 440000 },
                platinum: { base: 550000 }
            },
            qpanel: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            tangga: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            tiangAtas: {
                silver: { base: 990000 },
                gold: { base: 1430000 },
                platinum: { base: 1650000 }
            },
            wingBagasi: {
                silver: { base: 660000 },
                gold: { base: 880000 },
                platinum: { base: 990000 }
            },
            clearLampu: {
                silver: { base: 660000 },
                gold: { base: 880000 },
                platinum: { base: 990000 }
            },
            velg: {
                silver: { base: 660000 },
                gold: { base: 880000 },
                platinum: { base: 990000 }
            },
            antiKarat: {
                silver: { base: 4400000 }
            },
            plingcoat: {
                gold: { base: 3080000 }
            },
            dalamanPintu: {
                silver: { base: 660000 },
                gold: { base: 880000 },
                platinum: { base: 990000 }
            },
            coverPowerWindow: {
                silver: { base: 385000 },
                gold: { base: 550000 },
                platinum: { base: 660000 }
            },
            doortrim: {
                silver: { base: 440000 },
                gold: { base: 660000 },
                platinum: { base: 700000 }
            },
            fullBody: {
                silver: { base: 22000000 },
                gold: { base: 25000000 },
                platinum: { base: 27000000 }
            },
            pijakanKaki: {
                silver: { base: 440000 },
                gold: { base: 660000 },
                platinum: { base: 770000 }
            }
        }
    };

    // Update booking summary when package changes
    function updatePackageDisplay() {
        const selectedPackage = document.querySelector('input[name="package"]:checked').value;
        
        // Update price display for all services
        document.querySelectorAll('.price-category').forEach(priceCategory => {
            if (priceCategory.classList.contains(selectedPackage)) {
                priceCategory.style.display = 'flex';
            } else {
                priceCategory.style.display = 'none';
            }
        });

        updateServiceSummary();
    }

    // Update booking summary when category changes
    function updateCategorySummary() {
        const category = carPriceSelect.value;
        selectedCategoryElement.textContent = category ? 
            (category === 'standard' ? 'Standard (< 1M)' : 'Luxury (> 1M)') : 
            '-';
        
        updateServiceSummary();
    }

    // Update booking summary when services are selected
    function updateServiceSummary() {
        const selectedServices = Array.from(serviceCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => {
                const serviceCategory = checkbox.dataset.category;
                const serviceType = checkbox.dataset.service;
                const serviceName = checkbox.closest('.service-card').querySelector('h4').textContent;
                
                // Get selected package (silver/gold/platinum)
                const packageType = document.querySelector('input[name="package"]:checked').value;
                
                let priceDisplay;
                if (serviceCategory.startsWith('cat-')) {
                    const priceData = servicePrices[serviceCategory][serviceType][packageType];
                    priceDisplay = `Rp ${priceData.base.toLocaleString('id-ID')}`;
                } else {
                    const category = carPriceSelect.value || 'standard';
                    const priceData = servicePrices[serviceCategory][serviceType][category];
                    priceDisplay = `Rp ${priceData.base.toLocaleString('id-ID')}`;
                    if (priceData.rate > 0) {
                        priceDisplay += ` + ${priceData.rate.toLocaleString('id-ID')}/cm`;
                    }
                }
                
                return `${serviceName} (${priceDisplay})`;
            });

        selectedServicesElement.textContent = selectedServices.length > 0 
            ? selectedServices.join('\n') 
            : '-';

        // Calculate total price
        const total = Array.from(serviceCheckboxes)
            .filter(checkbox => checkbox.checked)
            .reduce((sum, checkbox) => {
                const serviceCategory = checkbox.dataset.category;
                const serviceType = checkbox.dataset.service;
                
                if (serviceCategory.startsWith('cat-')) {
                    const packageType = document.querySelector('input[name="package"]:checked').value;
                    return sum + servicePrices[serviceCategory][serviceType][packageType].base;
                } else {
                    const category = carPriceSelect.value || 'standard';
                    return sum + servicePrices[serviceCategory][serviceType][category].base;
                }
            }, 0);

        totalPriceElement.textContent = `Rp ${total.toLocaleString('id-ID')}*`;
    }

    // Update date and time in summary
    function updateDateTimeSummary() {
        const selectedDate = serviceDateInput.value;
        const selectedTime = serviceTimeInput.value;

        selectedDateElement.textContent = selectedDate 
            ? new Date(selectedDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : '-';

        selectedTimeElement.textContent = selectedTime || '-';
    }

    // Event listeners
    carPriceSelect.addEventListener('change', updateCategorySummary);
    
    packageRadios.forEach(radio => {
        radio.addEventListener('change', updatePackageDisplay);
    });

    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateServiceSummary);
    });

    serviceDateInput.addEventListener('change', updateDateTimeSummary);
    serviceTimeInput.addEventListener('change', updateDateTimeSummary);

    // Initialize summary
    updatePackageDisplay();
    updateCategorySummary();
    updateDateTimeSummary();
});

// Team Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('teamSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = document.querySelectorAll('.team-card');
    
    if (!slider || !prevBtn || !nextBtn || cards.length === 0) return;

    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight);
    const maxIndex = cards.length - 1;

    // Clone cards for infinite scroll
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        slider.appendChild(clone);
    });

    function updateSliderPosition(index) {
        slider.style.transition = 'transform 0.5s ease-in-out';
        slider.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    function handleTransitionEnd() {
        if (currentIndex > maxIndex) {
            currentIndex = 0;
            slider.style.transition = 'none';
            updateSliderPosition(currentIndex);
        } else if (currentIndex < 0) {
            currentIndex = maxIndex;
            slider.style.transition = 'none';
            updateSliderPosition(currentIndex);
        }
    }

    function slideNext() {
        currentIndex++;
        updateSliderPosition(currentIndex);
    }

    function slidePrev() {
        currentIndex--;
        updateSliderPosition(currentIndex);
    }

    // Event Listeners
    nextBtn.addEventListener('click', slideNext);
    prevBtn.addEventListener('click', slidePrev);
    slider.addEventListener('transitionend', handleTransitionEnd);

    // Pause on hover
    slider.addEventListener('mouseenter', () => {
        slider.classList.add('paused');
    });

    slider.addEventListener('mouseleave', () => {
        slider.classList.remove('paused');
    });

    // Auto slide
    let autoSlideInterval = setInterval(slideNext, 3000);

    slider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    slider.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(slideNext, 3000);
    });
});

// Main JavaScript for Bengkel Aseng Ketok website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMain = document.querySelector('.nav-main');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMain.classList.toggle('active');
        });
    }
    
    // Check if auth.js is loaded
    if (typeof updateNavigation === 'function') {
        // Update navigation based on login status
        updateNavigation();
    }
    
    // Add click event listener to all links with class 'btn-booking'
    const bookingButtons = document.querySelectorAll('.btn-booking');
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Check if it's not already a WhatsApp link
            if (!this.href.includes('wa.me')) {
                e.preventDefault();
                window.location.href = 'booking.html';
            }
        });
    });
});

// Load auth.js if it hasn't been loaded already
if (typeof isLoggedIn !== 'function') {
    const script = document.createElement('script');
    script.src = 'auth.js';
    script.async = true;
    script.onload = function() {
        // Update navigation after auth.js is loaded
        if (typeof updateNavigation === 'function') {
            updateNavigation();
        }
    };
    document.head.appendChild(script);
}