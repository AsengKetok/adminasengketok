// Redis Upstash Authentication Handler
const UPSTASH_URL = "https://verified-pangolin-19430.upstash.io";
const UPSTASH_TOKEN = "AUvmAAIjcDEwODcwMWRlYmFmMjY0YjY4YWJmOGJkYmEwZDA2NTkwMnAxMA";

// Helper function for making Redis REST API calls
async function redisRequest(command, args) {
    try {
        const response = await fetch(`${UPSTASH_URL}/${command}/${args.join('/')}`, {
            headers: {
                Authorization: `Bearer ${UPSTASH_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Redis request failed: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Redis request error:", error);
        throw error;
    }
}

// User Registration
async function registerUser(userData) {
    try {
        // Check if user already exists
        const phoneCheck = await redisRequest('get', [`user:${userData.phone}`]);
        
        if (phoneCheck.result) {
            return {
                success: false,
                message: "Nomor telepon sudah terdaftar"
            };
        }
        
        // Generate unique ID in format YYMMDDHHMMSS
        const now = new Date();
        const uniqueId = now.getFullYear().toString().slice(-2) + 
                       (now.getMonth() + 1).toString().padStart(2, '0') +
                       now.getDate().toString().padStart(2, '0') +
                       now.getHours().toString().padStart(2, '0') +
                       now.getMinutes().toString().padStart(2, '0') +
                       now.getSeconds().toString().padStart(2, '0');
        
        // Create user object
        const user = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            password: userData.password, // In a real app, this should be hashed!
            created: new Date().toISOString(),
            uniqueId: uniqueId
        };
        
        // Store user in Redis
        await redisRequest('set', [`user:${userData.phone}`, JSON.stringify(user)]);
        
        // Return success
        return {
            success: true,
            message: "Pendaftaran berhasil"
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat pendaftaran"
        };
    }
}

// User Login
async function loginUser(phone, password) {
    try {
        // Get user from Redis
        const userResponse = await redisRequest('get', [`user:${phone}`]);
        
        if (!userResponse.result) {
            return {
                success: false,
                message: "Nomor telepon tidak terdaftar"
            };
        }
        
        const user = JSON.parse(userResponse.result);
        
        // Check password
        if (user.password !== password) { // In a real app, compare hashed passwords
            return {
                success: false,
                message: "Password salah"
            };
        }
        
        // Check if user has a unique ID, create one if not
        if (!user.uniqueId) {
            user.uniqueId = generateLegacyUniqueId(user);
            // Update user in Redis
            await redisRequest('set', [`user:${phone}`, JSON.stringify(user)]);
        }
        
        // Create session
        const sessionId = generateSessionId();
        const session = {
            userId: phone,
            created: new Date().toISOString(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Store session in Redis
        await redisRequest('set', [`session:${sessionId}`, JSON.stringify(session)]);
        
        // Return user data and session
        return {
            success: true,
            message: "Login berhasil",
            session: sessionId,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                uniqueId: user.uniqueId
            }
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat login"
        };
    }
}

// Get User Profile
async function getUserProfile(sessionId) {
    try {
        // Get session from Redis
        const sessionResponse = await redisRequest('get', [`session:${sessionId}`]);
        
        if (!sessionResponse.result) {
            return {
                success: false,
                message: "Sesi tidak valid"
            };
        }
        
        const session = JSON.parse(sessionResponse.result);
        
        // Check if session is expired
        if (new Date(session.expires) < new Date()) {
            await redisRequest('del', [`session:${sessionId}`]);
            return {
                success: false,
                message: "Sesi telah berakhir"
            };
        }
        
        // Get user from Redis
        const userResponse = await redisRequest('get', [`user:${session.userId}`]);
        
        if (!userResponse.result) {
            return {
                success: false,
                message: "Pengguna tidak ditemukan"
            };
        }
        
        const user = JSON.parse(userResponse.result);
        
        // Return user profile
        return {
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                created: user.created,
                uniqueId: user.uniqueId || generateLegacyUniqueId(user)
            }
        };
    } catch (error) {
        console.error("Get profile error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat mengambil profil"
        };
    }
}

// Generate a legacy unique ID for users who registered before the update
function generateLegacyUniqueId(user) {
    // If user has creation date, use it to generate ID
    if (user.created) {
        const date = new Date(user.created);
        return date.getFullYear().toString().slice(-2) + 
               (date.getMonth() + 1).toString().padStart(2, '0') +
               date.getDate().toString().padStart(2, '0') +
               date.getHours().toString().padStart(2, '0') +
               date.getMinutes().toString().padStart(2, '0') +
               date.getSeconds().toString().padStart(2, '0');
    }
    
    // Fallback to current timestamp + random digits
    const now = new Date();
    return now.getFullYear().toString().slice(-2) + 
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

// Logout User
async function logoutUser(sessionId) {
    try {
        // Delete session from Redis
        await redisRequest('del', [`session:${sessionId}`]);
        
        return {
            success: true,
            message: "Logout berhasil"
        };
    } catch (error) {
        console.error("Logout error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat logout"
        };
    }
}

// Generate a random session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('bengkelSession') !== null;
}

// Update navigation based on login status
function updateNavigation() {
    const loginButtons = document.querySelectorAll('.btn-login');
    
    if (isLoggedIn()) {
        // User is logged in, show profile button
        loginButtons.forEach(button => {
            button.textContent = 'Profil Saya';
            button.href = 'akun.html';
            button.classList.add('btn-profile');
        });
    } else {
        // User is logged out, show login button
        loginButtons.forEach(button => {
            button.textContent = 'Log in';
            button.href = 'login.html';
            button.classList.remove('btn-profile');
        });
    }
}

// Delete User Account
async function deleteAccount(phone, password, sessionId) {
    try {
        // Get user from Redis
        const userResponse = await redisRequest('get', [`user:${phone}`]);
        
        if (!userResponse.result) {
            return {
                success: false,
                message: "Pengguna tidak ditemukan"
            };
        }
        
        const user = JSON.parse(userResponse.result);
        
        // Verify password
        if (user.password !== password) {
            return {
                success: false,
                message: "Password salah"
            };
        }
        
        console.log(`Deleting account for user: ${phone}`);
        
        // First, get all individual transaction keys for this user
        let individualTransactionKeys = [];
        try {
            // Use scan command to find all keys matching the pattern
            const scanData = await redisRequest('scan', [0, 'match', `transaction:${phone}:*`, 'count', 1000]);
            
            if (scanData.result && Array.isArray(scanData.result[1])) {
                individualTransactionKeys = scanData.result[1];
                console.log(`Found ${individualTransactionKeys.length} individual transaction keys to delete`);
            }
        } catch (error) {
            console.error('Error scanning for transaction keys:', error);
        }
        
        // Clean up global transactions list
        try {
            const globalKey = 'global:transactions';
            const globalData = await redisRequest('get', [globalKey]);
            
            if (globalData.result) {
                try {
                    let globalTransactions = JSON.parse(globalData.result);
                    if (Array.isArray(globalTransactions)) {
                        // Filter out transactions for this user
                        const originalLength = globalTransactions.length;
                        globalTransactions = globalTransactions.filter(t => t.userPhone !== phone);
                        
                        if (originalLength !== globalTransactions.length) {
                            console.log(`Removed ${originalLength - globalTransactions.length} transactions from global list`);
                            // Save the updated global transactions list
                            await redisRequest('set', [globalKey, JSON.stringify(globalTransactions)]);
                        }
                    }
                } catch (e) {
                    console.error('Error cleaning up global transactions:', e);
                }
            }
        } catch (globalError) {
            console.error('Error updating global transactions:', globalError);
        }
        
        // Begin deletion process - delete all user data from Redis
        const deletePromises = [
            // Delete user profile
            redisRequest('del', [`user:${phone}`]),
            // Delete user balance
            redisRequest('del', [`balance:${phone}`]),
            // Delete user points
            redisRequest('del', [`points:${phone}`]),
            // Delete user transactions
            redisRequest('del', [`transactions:${phone}`]),
            // Delete user service history
            redisRequest('del', [`serviceHistory:${phone}`]),
            // Delete user points history
            redisRequest('del', [`pointsHistory:${phone}`])
        ];
        
        // Add individual transaction keys to delete promises
        for (const key of individualTransactionKeys) {
            deletePromises.push(redisRequest('del', [key]));
        }
        
        // Delete session if provided
        if (sessionId) {
            deletePromises.push(redisRequest('del', [`session:${sessionId}`]));
        }
        
        // Execute all deletions
        await Promise.all(deletePromises);
        
        // Also clear localStorage data
        console.log('Clearing localStorage data');
        
        return {
            success: true,
            message: "Akun berhasil dihapus"
        };
    } catch (error) {
        console.error("Delete account error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus akun"
        };
    }
} 