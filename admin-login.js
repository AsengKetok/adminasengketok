// Add admin login modal HTML to the page
function addAdminLoginModal() {
    const modalHTML = `
        <div id="adminLoginModal" class="modal">
            <div class="modal-content">
                <span class="modal-close" onclick="closeAdminLoginModal()">&times;</span>
                <h2 class="modal-title">Admin Login</h2>
                <form class="modal-form" onsubmit="handleAdminLogin(event)">
                    <input type="text" 
                           id="adminUsername" 
                           class="modal-input" 
                           placeholder="Username"
                           required>
                    <input type="password" 
                           id="adminPassword" 
                           class="modal-input" 
                           placeholder="Password"
                           required>
                    <button type="submit" class="btn-submit">Login</button>
                </form>
            </div>
        </div>
    `;

    // Add modal styles if not already present
    if (!document.getElementById('adminModalStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'adminModalStyles';
        styleSheet.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
            }

            .modal-content {
                position: relative;
                background-color: white;
                margin: 15% auto;
                padding: 3rem;
                width: 90%;
                max-width: 500px;
                border-radius: 15px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            }

            .modal-close {
                position: absolute;
                right: 2rem;
                top: 2rem;
                font-size: 2rem;
                cursor: pointer;
                color: #718096;
            }

            .modal-title {
                font-size: 2.2rem;
                font-weight: 700;
                color: #2d3748;
                margin-bottom: 2rem;
            }

            .modal-form {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .modal-input {
                font-size: 1.8rem;
                padding: 1.5rem;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                width: 100%;
            }

            .btn-submit {
                background-color: var(--color-primary);
                color: white;
                border: none;
                padding: 1.5rem;
                border-radius: 10px;
                font-size: 1.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-submit:hover {
                background-color: var(--color-primary-dark);
            }

            .btn-admin {
                background-color: #4a5568;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 1rem;
            }

            .btn-admin:hover {
                background-color: #2d3748;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add admin button to navigation
    const navList = document.querySelector('.nav-main ul');
    const adminButton = document.createElement('li');
    adminButton.innerHTML = `<button class="btn-admin" onclick="openAdminLoginModal()">ADMIN</button>`;
    navList.appendChild(adminButton);
}

// Open admin login modal
function openAdminLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'block';
}

// Close admin login modal
function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'none';
}

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (adminLogin(username, password)) {
        window.location.href = 'admin.html';
    } else {
        alert('Username atau password salah');
    }
}

// Initialize admin login modal
document.addEventListener('DOMContentLoaded', function() {
    addAdminLoginModal();
}); 