// Admin credentials
const ADMIN_USERNAME = 'STARK';
const ADMIN_PASSWORD = 'ADMIN';

// Check if admin is logged in
function isAdminLoggedIn() {
    return localStorage.getItem('adminSession') === 'true';
}

// Admin login function
function adminLogin(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminSession', 'true');
        return true;
    }
    return false;
}

// Admin logout function
function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.href = 'index.html';
}

// Redis API request helper function
async function redisRequest(command, args = []) {
    try {
        const REDIS_REST_API = 'https://verified-pangolin-19430.upstash.io';
        const REDIS_REST_TOKEN = 'AUvmAAIjcDEwODcwMWRlYmFmMjY0YjY4YWJmOGJkYmEwZDA2NTkwMnAxMA';

        const response = await fetch(`${REDIS_REST_API}/${command}/${args.join('/')}`, {
            headers: {
                'Authorization': `Bearer ${REDIS_REST_TOKEN}`
            }
        });

        if (!response.ok) {
            console.error(`Redis API error (${command}):`, response.status, response.statusText);
            return { success: false, error: `API error: ${response.status} ${response.statusText}` };
        }

        const data = await response.json();
        return { success: true, result: data.result };
    } catch (error) {
        console.error(`Redis request error (${command}):`, error);
        return { success: false, error: error.message };
    }
}

// Get all users from Redis
async function getAllUsers() {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        // Use the SCAN command to find all user keys - using the same format as auth.js
        const scanResponse = await redisRequest('scan', [0, 'MATCH', 'user:*', 'COUNT', 1000]);
        
        if (!scanResponse.success) {
            console.error('Failed to scan for user keys:', scanResponse.error);
            return { success: false, message: 'Failed to scan for users' };
        }
        
        // Extract user keys from scan result
        let userKeys = [];
        if (scanResponse.result && Array.isArray(scanResponse.result) && scanResponse.result.length > 1) {
            userKeys = scanResponse.result[1]
                .filter(key => key.startsWith('user:') && !key.includes(':balance') && !key.includes(':points') && !key.includes(':transactions'));
        }
        
        console.log('Found user keys:', userKeys);
        
        if (userKeys.length === 0) {
            return { success: true, users: [] };
        }

        // Fetch user data in parallel
        const userPromises = userKeys.map(async (userKey) => {
            try {
                // Get user profile
                const userResponse = await redisRequest('get', [userKey]);
                if (!userResponse.success || !userResponse.result) {
                    console.error(`Failed to get user data for ${userKey}:`, userResponse.error);
                    return null;
                }
                
                let user;
                try {
                    user = JSON.parse(userResponse.result);
                } catch (e) {
                    console.error(`Error parsing user data for ${userKey}:`, e);
                    return null;
                }
                
                const phone = user.phone;
                if (!phone) {
                    console.error(`User ${userKey} has no phone number`);
                    return null;
                }
                
                // Get user balance
                const balanceResponse = await redisRequest('get', [`user:${phone}:balance`]);
                user.balance = balanceResponse.success && balanceResponse.result ? balanceResponse.result : 0;
                
                // Get user points
                const pointsResponse = await redisRequest('get', [`user:${phone}:points`]);
                user.points = pointsResponse.success && pointsResponse.result ? pointsResponse.result : 0;
                
                // Get user transactions
                const transactionsResponse = await redisRequest('get', [`user:${phone}:transactions`]);
                if (transactionsResponse.success && transactionsResponse.result) {
                    try {
                        user.transactions = JSON.parse(transactionsResponse.result);
                        if (!Array.isArray(user.transactions)) {
                            user.transactions = [];
                        }
                    } catch (e) {
                        console.error(`Error parsing transactions for ${phone}:`, e);
                        user.transactions = [];
                    }
                } else {
                    // Try to find individual transactions
                    user.transactions = [];
                    try {
                        const scanResponse = await redisRequest('scan', [0, 'MATCH', `transaction:${phone}:*`, 'COUNT', 1000]);
                        if (scanResponse.success && scanResponse.result && Array.isArray(scanResponse.result) && scanResponse.result.length > 1) {
                            const transactionKeys = scanResponse.result[1];
                            
                            if (transactionKeys.length > 0) {
                                const transactionPromises = transactionKeys.map(key => redisRequest('get', [key]));
                                const transactionResponses = await Promise.all(transactionPromises);
                                
                                for (const response of transactionResponses) {
                                    if (response.success && response.result) {
                                        try {
                                            const transaction = JSON.parse(response.result);
                                            user.transactions.push(transaction);
                                        } catch (e) {
                                            console.error('Error parsing individual transaction:', e);
                                        }
                                    }
                                }
                                
                                // Sort transactions by timestamp (newest first)
                                user.transactions.sort((a, b) => {
                                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                                    return timeB - timeA;
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching individual transactions:', e);
                    }
                }
                
                // Get user services
                const servicesResponse = await redisRequest('get', [`user:${phone}:services`]);
                if (servicesResponse.success && servicesResponse.result) {
                    try {
                        user.services = JSON.parse(servicesResponse.result);
                        if (!Array.isArray(user.services)) {
                            user.services = [];
                        }
                    } catch (e) {
                        console.error(`Error parsing services for ${phone}:`, e);
                        user.services = [];
                    }
                } else {
                    user.services = [];
                }
                
                return user;
            } catch (error) {
                console.error(`Error fetching data for user key ${userKey}:`, error);
                return null;
            }
        });

        const users = (await Promise.all(userPromises)).filter(user => user !== null);
        console.log(`Successfully retrieved ${users.length} users`);
        
        return { success: true, users };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, message: 'Error fetching users' };
    }
}

// Update user balance
async function updateUserBalance(phone, newBalance) {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        // Validate the new balance
        if (isNaN(newBalance) || newBalance < 0) {
            return { success: false, message: 'Invalid balance amount' };
        }

        // Update the user's balance in Redis
        const response = await redisRequest('set', [`user:${phone}:balance`, newBalance.toString()]);
        
        if (!response.success) {
            return { success: false, message: 'Failed to update balance' };
        }

        return { success: true, message: 'Balance updated successfully' };
    } catch (error) {
        console.error('Update user balance error:', error);
        return { success: false, message: 'Error updating balance' };
    }
}

// Update user points
async function updateUserPoints(phone, newPoints) {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        // Validate the new points
        if (isNaN(newPoints) || newPoints < 0) {
            return { success: false, message: 'Invalid points amount' };
        }

        // Update the user's points in Redis
        const response = await redisRequest('set', [`user:${phone}:points`, newPoints.toString()]);
        
        if (!response.success) {
            return { success: false, message: 'Failed to update points' };
        }

        return { success: true, message: 'Points updated successfully' };
    } catch (error) {
        console.error('Update user points error:', error);
        return { success: false, message: 'Error updating points' };
    }
}

// Get user details including all history
async function getUserDetails(phone) {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        console.log(`Getting details for user with phone: ${phone}`);

        // Get user profile
        const userResponse = await redisRequest('get', [`user:${phone}`]);
        if (!userResponse.success || !userResponse.result) {
            console.error('User not found:', userResponse);
            return { success: false, message: 'User not found' };
        }

        let user;
        try {
            user = JSON.parse(userResponse.result);
            console.log('User profile retrieved:', user);
        } catch (e) {
            console.error(`Error parsing user data for ${phone}:`, e);
            return { success: false, message: 'Error parsing user data' };
        }
        
        // Get all user related data in parallel
        console.log('Fetching user related data...');
        const [balanceResponse, pointsResponse, transactionsResponse, servicesResponse] = await Promise.all([
            redisRequest('get', [`user:${phone}:balance`]),
            redisRequest('get', [`user:${phone}:points`]),
            redisRequest('get', [`user:${phone}:transactions`]),
            redisRequest('get', [`user:${phone}:services`])
        ]);

        console.log('User balance response:', balanceResponse);
        console.log('User points response:', pointsResponse);
        console.log('User transactions response:', transactionsResponse);
        console.log('User services response:', servicesResponse);

        // Add balance to user object
        user.balance = balanceResponse.success && balanceResponse.result ? balanceResponse.result : 0;
        
        // Add points to user object
        user.points = pointsResponse.success && pointsResponse.result ? pointsResponse.result : 0;
        
        // Add transactions to user object
        if (transactionsResponse.success && transactionsResponse.result) {
            try {
                user.transactions = JSON.parse(transactionsResponse.result);
                console.log(`Parsed ${user.transactions.length} transactions from Redis`);
                if (!Array.isArray(user.transactions)) {
                    console.warn('Transactions data is not an array, setting to empty array');
                    user.transactions = [];
                }
            } catch (e) {
                console.error(`Error parsing transactions for ${phone}:`, e);
                user.transactions = [];
            }
        } else {
            console.warn('No transactions found in Redis, checking for individual transactions...');
            user.transactions = [];
            
            // Try to find individual transactions
            try {
                const scanResponse = await redisRequest('scan', [0, 'MATCH', `transaction:${phone}:*`, 'COUNT', 1000]);
                if (scanResponse.success && scanResponse.result && Array.isArray(scanResponse.result) && scanResponse.result.length > 1) {
                    const transactionKeys = scanResponse.result[1];
                    console.log(`Found ${transactionKeys.length} individual transaction keys:`, transactionKeys);
                    
                    if (transactionKeys.length > 0) {
                        const transactionPromises = transactionKeys.map(key => redisRequest('get', [key]));
                        const transactionResponses = await Promise.all(transactionPromises);
                        
                        for (const response of transactionResponses) {
                            if (response.success && response.result) {
                                try {
                                    const transaction = JSON.parse(response.result);
                                    user.transactions.push(transaction);
                                } catch (e) {
                                    console.error('Error parsing individual transaction:', e);
                                }
                            }
                        }
                        
                        console.log(`Added ${user.transactions.length} individual transactions`);
                        
                        // Sort transactions by timestamp (newest first)
                        user.transactions.sort((a, b) => {
                            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                            return timeB - timeA;
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching individual transactions:', e);
            }
        }
        
        // Add services to user object
        if (servicesResponse.success && servicesResponse.result) {
            try {
                user.serviceHistory = JSON.parse(servicesResponse.result);
                if (!Array.isArray(user.serviceHistory)) {
                    user.serviceHistory = [];
                }
            } catch (e) {
                console.error(`Error parsing services for ${phone}:`, e);
                user.serviceHistory = [];
            }
        } else {
            user.serviceHistory = [];
        }
        
        // Format registration date
        user.registrationDate = user.created 
            ? new Date(user.created).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'N/A';

        console.log('Final user details:', user);
        return { success: true, user };
    } catch (error) {
        console.error('Get user details error:', error);
        return { success: false, message: 'Error getting user details' };
    }
}

// Get all transactions from all users
async function getAllTransactions() {
    try {
        // First get all users
        const usersResult = await getAllUsers();
        if (!usersResult.success) {
            return { success: false, message: 'Failed to fetch users' };
        }

        // Collect all transactions from all users
        let allTransactions = [];
        
        for (const user of usersResult.users) {
            if (user.transactions && Array.isArray(user.transactions)) {
                // Add user information to each transaction
                const userTransactions = user.transactions.map(transaction => ({
                    ...transaction,
                    userName: `${user.firstName} ${user.lastName}`,
                    userPhone: user.phone
                }));
                
                allTransactions = [...allTransactions, ...userTransactions];
            }
        }
        
        // Sort transactions by timestamp (newest first)
        allTransactions.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });
        
        return {
            success: true, 
            transactions: allTransactions 
        };
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        return { success: false, message: 'Error fetching transactions' };
    }
}

// Delete a user and all associated data
async function adminDeleteUser(phone) {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        console.log(`Attempting to delete user with phone: ${phone}`);

        // Get the user first to verify they exist
        const userKey = `user:${phone}`;
        const userResponse = await redisRequest('get', [userKey]);
        
        if (!userResponse || !userResponse.result) {
            return { success: false, message: 'User not found' };
        }

        // Delete all user-related keys
        const keysToDelete = [
            `user:${phone}`,                    // User profile
            `user:${phone}:balance`,            // User balance
            `user:${phone}:points`,             // User points
            `user:${phone}:transactions`,       // User transactions list
            `user:${phone}:services`            // User services history
        ];

        // Get all transactions to delete individual transaction keys
        const transactionsResponse = await redisRequest('get', [`user:${phone}:transactions`]);
        if (transactionsResponse && transactionsResponse.result) {
            try {
                const transactions = JSON.parse(transactionsResponse.result);
                if (Array.isArray(transactions)) {
                    console.log(`Found ${transactions.length} transactions to delete for user ${phone}`);
                    // Add individual transaction keys to delete with the correct format
                    transactions.forEach(transaction => {
                        if (transaction.transactionId) {
                            keysToDelete.push(`transaction:${phone}:${transaction.transactionId}`);
                        }
                        if (transaction.orderId && transaction.orderId !== transaction.transactionId) {
                            keysToDelete.push(`transaction:${phone}:${transaction.orderId}`);
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing transactions for deletion:', e);
            }
        } else {
            console.log('No transactions list found, scanning for individual transaction keys...');
            // If no transactions list is found, scan for individual transaction keys
            try {
                const scanResponse = await redisRequest('scan', [0, 'MATCH', `transaction:${phone}:*`, 'COUNT', 1000]);
                if (scanResponse.success && scanResponse.result && Array.isArray(scanResponse.result) && scanResponse.result.length > 1) {
                    const transactionKeys = scanResponse.result[1];
                    console.log(`Found ${transactionKeys.length} individual transaction keys for user ${phone}:`, transactionKeys);
                    keysToDelete.push(...transactionKeys);
                }
            } catch (e) {
                console.error('Error scanning for transaction keys:', e);
            }
        }

        // Also check for global transactions that might belong to this user
        try {
            const globalTransactionsResponse = await redisRequest('get', ['global:transactions']);
            if (globalTransactionsResponse.success && globalTransactionsResponse.result) {
                const globalTransactions = JSON.parse(globalTransactionsResponse.result);
                if (Array.isArray(globalTransactions)) {
                    // Filter out transactions from this user
                    const updatedGlobalTransactions = globalTransactions.filter(transaction => 
                        transaction.userPhone !== phone
                    );
                    
                    // If we removed any transactions, update the global transactions list
                    if (updatedGlobalTransactions.length !== globalTransactions.length) {
                        console.log(`Updating global transactions list to remove user ${phone}'s transactions`);
                        await redisRequest('set', ['global:transactions', JSON.stringify(updatedGlobalTransactions)]);
                    }
                }
            }
        } catch (e) {
            console.error('Error updating global transactions list:', e);
        }

        console.log(`Deleting ${keysToDelete.length} keys for user ${phone}:`, keysToDelete);
        
        // Delete all keys in parallel
        const deletePromises = keysToDelete.map(key => 
            redisRequest('del', [key])
        );
        
        await Promise.all(deletePromises);
        
        // Also remove from global users list if it exists
        try {
            const globalUsersResponse = await redisRequest('get', ['global:users']);
            if (globalUsersResponse && globalUsersResponse.result) {
                const globalUsers = JSON.parse(globalUsersResponse.result);
                if (Array.isArray(globalUsers)) {
                    const updatedUsers = globalUsers.filter(userPhone => userPhone !== phone);
                    if (updatedUsers.length !== globalUsers.length) {
                        console.log(`Removing user ${phone} from global users list`);
                        await redisRequest('set', ['global:users', JSON.stringify(updatedUsers)]);
                    }
                }
            }
        } catch (e) {
            console.error('Error updating global users list:', e);
        }
        
        console.log(`User ${phone} deleted successfully`);
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: 'Error deleting user' };
    }
}

// Inject deposit function - automatically approve pending deposits with bonus
async function injectDeposit(phone, transactionId, amount) {
    try {
        if (!isAdminLoggedIn()) {
            return { success: false, message: 'Admin authentication required' };
        }

        console.log(`Injecting deposit for user ${phone}, transaction ${transactionId}, amount ${amount}`);

        // Calculate bonus based on deposit amount
        function calculateBonus(amount) {
            switch(parseInt(amount)) {
                case 3000000: return 540000;
                case 5000000: return 1000000;
                case 10000000: return 2200000;
                case 15000000: return 3600000;
                case 20000000: return 5200000;
                default: return 0;
            }
        }

        const bonusAmount = calculateBonus(amount);
        const totalAmount = parseInt(amount) + bonusAmount;
        
        console.log(`Calculated bonus: ${bonusAmount}, total amount: ${totalAmount}`);

        // 1. Get current user balance
        const balanceResponse = await redisRequest('get', [`user:${phone}:balance`]);
        let currentBalance = 0;
        
        if (balanceResponse.success && balanceResponse.result) {
            currentBalance = parseInt(balanceResponse.result);
        }
        
        console.log(`Current balance: ${currentBalance}`);
        
        // 2. Calculate new balance
        const newBalance = currentBalance + totalAmount;
        console.log(`New balance: ${newBalance}`);
        
        // 3. Update user balance
        const updateBalanceResponse = await redisRequest('set', [`user:${phone}:balance`, newBalance.toString()]);
        
        if (!updateBalanceResponse.success) {
            console.error('Failed to update balance:', updateBalanceResponse.error);
            return { success: false, message: 'Failed to update user balance' };
        }
        
        // 4. Update transaction status in the individual transaction record
        const transactionKey = `transaction:${phone}:${transactionId}`;
        const transactionResponse = await redisRequest('get', [transactionKey]);
        
        if (transactionResponse.success && transactionResponse.result) {
            try {
                const transaction = JSON.parse(transactionResponse.result);
                
                // Update transaction status and add completion timestamp
                transaction.status = 'success';
                transaction.completedAt = new Date().toISOString();
                transaction.bonusAmount = bonusAmount;
                
                // Save updated transaction
                await redisRequest('set', [transactionKey, JSON.stringify(transaction)]);
                console.log('Individual transaction updated successfully');
            } catch (e) {
                console.error('Error updating individual transaction:', e);
            }
        }
        
        // 5. Update transaction in the user's transactions list
        const userTransactionsKey = `user:${phone}:transactions`;
        const userTransactionsResponse = await redisRequest('get', [userTransactionsKey]);
        
        if (userTransactionsResponse.success && userTransactionsResponse.result) {
            try {
                let transactions = JSON.parse(userTransactionsResponse.result);
                
                if (Array.isArray(transactions)) {
                    // Find and update the transaction in the list
                    const transactionIndex = transactions.findIndex(t => 
                        t.transactionId === transactionId || t.orderId === transactionId
                    );
                    
                    if (transactionIndex !== -1) {
                        transactions[transactionIndex].status = 'success';
                        transactions[transactionIndex].completedAt = new Date().toISOString();
                        transactions[transactionIndex].bonusAmount = bonusAmount;
                        
                        // Save updated transactions list
                        await redisRequest('set', [userTransactionsKey, JSON.stringify(transactions)]);
                        console.log('Transaction updated in user transactions list');
                    } else {
                        console.warn('Transaction not found in user transactions list');
                    }
                }
            } catch (e) {
                console.error('Error updating transaction in user transactions list:', e);
            }
        }
        
        return { 
            success: true, 
            message: `Deposit injected successfully. Added ${totalAmount} to user balance (${amount} + ${bonusAmount} bonus)` 
        };
    } catch (error) {
        console.error('Inject deposit error:', error);
        return { success: false, message: 'Error injecting deposit' };
    }
} 