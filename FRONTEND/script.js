
let currentUser = null;
const STORAGE_KEY = 'ipt_demo_v1';


window.db = {
    accounts: [],
    departments: [],
    employees: [],
    requests: []
};


function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    
    container.appendChild(toast);
    
 
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);
    
   
    setTimeout(function() {
        toast.classList.remove('show');
 
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}


function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
        try {
            window.db = JSON.parse(saved);
            console.log('Data loaded from storage');
        } catch (e) {
            console.error('Error loading data:', e);
            seedDefaultData();
        }
    } else {
        seedDefaultData();
    }
}

function seedDefaultData() {
    window.db = {
        accounts: [
            {
                id: 1,
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'Password123!',
                role: 'admin',
                verified: true
            }
        ],
        departments: [
            { id: 1, name: 'Engineering', description: 'Software development team' },
            { id: 2, name: 'HR', description: 'Human resources department' }
        ],
        employees: [],
        requests: []
    };
    saveToStorage();
    console.log('✅ Default data created');
    console.log('📧 Admin login: admin@example.com / Password123!');
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}


function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
   
    const exists = window.db.accounts.find(function(acc) {
        return acc.email === email;
    });
    
    if (exists) {
        showToast('Email already registered!', 'error');
        return;
    }
    
   
    const newAccount = {
        id: window.db.accounts.length + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: 'user',
        verified: false
    };
    
    window.db.accounts.push(newAccount);
    saveToStorage();
    
    localStorage.setItem('unverified_email', email);
    showToast('Registration successful! Please verify email.', 'success');
    navigateTo('#/verify-email');
}


function handleVerify() {
    const email = localStorage.getItem('unverified_email');
    if (!email) {
        showToast('No email to verify', 'error');
        return;
    }
    
    const account = window.db.accounts.find(function(acc) {
        return acc.email === email;
    });
    
    if (account) {
        account.verified = true;
        saveToStorage();
        localStorage.removeItem('unverified_email');
        showToast('Email verified! You can login now.', 'success');
        navigateTo('#/login');
    }
}


function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('Login attempt:', email);
    
    const account = window.db.accounts.find(function(acc) {
        return acc.email === email && acc.password === password && acc.verified === true;
    });
    
    if (account) {
        localStorage.setItem('auth_token', email);
        setAuthState(true, account);
        showToast('Welcome, ' + account.firstName + '!', 'success');
        navigateTo('#/profile');
    } else {
        showToast('Invalid email or password', 'error');
    }
}


function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('auth_token');
    setAuthState(false);
    showToast('Logged out successfully', 'info');
    navigateTo('#/');
}


function setAuthState(isAuth, user) {
    if (isAuth && user) {
        currentUser = user;
        document.body.classList.remove('not-authenticated');
        document.body.classList.add('authenticated');
        
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.firstName;
        }
        
        if (user.role === 'admin') {
            document.body.classList.add('is-admin');
        } else {
            document.body.classList.remove('is-admin');
        }
    } else {
        currentUser = null;
        document.body.classList.remove('authenticated', 'is-admin');
        document.body.classList.add('not-authenticated');
    }
}


function checkAuthState() {
    const token = localStorage.getItem('auth_token');
    if (token) {
        const user = window.db.accounts.find(function(acc) {
            return acc.email === token;
        });
        
        if (user && user.verified) {
            setAuthState(true, user);
            console.log('✅ Auto-login successful');
        } else {
            localStorage.removeItem('auth_token');
        }
    }
}


function renderProfile() {
    if (!currentUser) return;
    
    const content = document.getElementById('profile-content');
    if (!content) return;
    
    const roleClass = currentUser.role === 'admin' ? 'badge-danger' : 'badge-primary';
    
    content.innerHTML = 
        '<p><strong>Name:</strong> ' + currentUser.firstName + ' ' + currentUser.lastName + '</p>' +
        '<p><strong>Email:</strong> ' + currentUser.email + '</p>' +
        '<p><strong>Role:</strong> <span class="badge ' + roleClass + '">' + currentUser.role + '</span></p>' +
        '<p><strong>Status:</strong> <span class="badge badge-success">Verified</span></p>' +
        '<hr>' +
        '<button class="btn btn-info" onclick="alert(\'Edit profile feature coming soon!\')">Edit Profile</button>';
}


function renderAccountsList() {
    const content = document.getElementById('accounts-content');
    if (!content) return;
    
    let html = '<button class="btn btn-success" onclick="showAddAccountForm()">+ Add Account</button>';
    html += '<div id="account-form"></div>';
    html += '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';
    
    for (let i = 0; i < window.db.accounts.length; i++) {
        const acc = window.db.accounts[i];
        const roleClass = acc.role === 'admin' ? 'badge-danger' : 'badge-primary';
        html += '<tr>';
        html += '<td>' + acc.firstName + ' ' + acc.lastName + '</td>';
        html += '<td>' + acc.email + '</td>';
        html += '<td><span class="badge ' + roleClass + '">' + acc.role + '</span></td>';
        html += '<td>' + (acc.verified ? '✓' : '—') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editAccount(' + acc.id + ')">Edit</button>';
        html += '<button class="btn btn-info" onclick="resetPassword(' + acc.id + ')">Reset PW</button>';
        html += '<button class="btn btn-danger" onclick="deleteAccount(' + acc.id + ')">Delete</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    content.innerHTML = html;
}

function showAddAccountForm() {
    const formDiv = document.getElementById('account-form');
    if (!formDiv) return;
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Add Account</h5>' +
        '<input type="text" id="acc-fname" placeholder="First Name">' +
        '<input type="text" id="acc-lname" placeholder="Last Name">' +
        '<input type="email" id="acc-email" placeholder="Email">' +
        '<input type="password" id="acc-password" placeholder="Password (min 6 chars)" minlength="6">' +
        '<select id="acc-role"><option value="user">User</option><option value="admin">Admin</option></select>' +
        '<label><input type="checkbox" id="acc-verified"> Verified</label>' +
        '<button class="btn btn-success" onclick="saveAccount()">Save</button>' +
        '<button class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>' +
        '</div>';
}

function saveAccount() {
    const newAcc = {
        id: window.db.accounts.length + 1,
        firstName: document.getElementById('acc-fname').value,
        lastName: document.getElementById('acc-lname').value,
        email: document.getElementById('acc-email').value,
        password: document.getElementById('acc-password').value,
        role: document.getElementById('acc-role').value,
        verified: document.getElementById('acc-verified').checked
    };
    
    window.db.accounts.push(newAcc);
    saveToStorage();
    showToast('Account created successfully!', 'success');
    renderAccountsList();
}

function editAccount(id) {
    const acc = window.db.accounts.find(function(a) { return a.id === id; });
    if (!acc) return;
    
    const formDiv = document.getElementById('account-form');
    if (!formDiv) return;
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Edit Account</h5>' +
        '<input type="text" id="edit-fname" value="' + acc.firstName + '">' +
        '<input type="text" id="edit-lname" value="' + acc.lastName + '">' +
        '<input type="email" id="edit-email" value="' + acc.email + '">' +
        '<select id="edit-role">' +
        '<option value="user"' + (acc.role === 'user' ? ' selected' : '') + '>User</option>' +
        '<option value="admin"' + (acc.role === 'admin' ? ' selected' : '') + '>Admin</option>' +
        '</select>' +
        '<label><input type="checkbox" id="edit-verified"' + (acc.verified ? ' checked' : '') + '> Verified</label>' +
        '<button class="btn btn-success" onclick="updateAccount(' + id + ')">Update</button>' +
        '<button class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>' +
        '</div>';
}

function updateAccount(id) {
    const acc = window.db.accounts.find(function(a) { return a.id === id; });
    if (!acc) return;
    
    acc.firstName = document.getElementById('edit-fname').value;
    acc.lastName = document.getElementById('edit-lname').value;
    acc.email = document.getElementById('edit-email').value;
    acc.role = document.getElementById('edit-role').value;
    acc.verified = document.getElementById('edit-verified').checked;
    
    saveToStorage();
    showToast('Account updated successfully!', 'success');
    renderAccountsList();
}

function resetPassword(id) {
    const newPassword = prompt('Enter new password (min 6 characters):');
    
    if (newPassword && newPassword.length >= 6) {
        const acc = window.db.accounts.find(function(a) { return a.id === id; });
        if (acc) {
            acc.password = newPassword;
            saveToStorage();
            showToast('Password reset successfully!', 'success');
        }
    } else if (newPassword) {
        showToast('Password must be at least 6 characters!', 'error');
    }
}

function deleteAccount(id) {
    if (currentUser && currentUser.id === id) {
        showToast('Cannot delete your own account!', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this account?')) {
        window.db.accounts = window.db.accounts.filter(function(a) {
            return a.id !== id;
        });
        saveToStorage();
        showToast('Account deleted successfully!', 'success');
        renderAccountsList();
    }
}


function renderDepartmentsList() {
    const content = document.getElementById('departments-content');
    if (!content) return;
    
    let html = '<button class="btn btn-success" onclick="showAddDeptForm()">+ Add Department</button>';
    html += '<div id="dept-form"></div>';
    html += '<table><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
    
    for (let i = 0; i < window.db.departments.length; i++) {
        const dept = window.db.departments[i];
        html += '<tr>';
        html += '<td>' + dept.name + '</td>';
        html += '<td>' + dept.description + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editDept(' + dept.id + ')">Edit</button>';
        html += '<button class="btn btn-danger" onclick="deleteDept(' + dept.id + ')">Delete</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    content.innerHTML = html;
}

function showAddDeptForm() {
    const formDiv = document.getElementById('dept-form');
    if (!formDiv) return;
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Add Department</h5>' +
        '<input type="text" id="dept-name" placeholder="Name">' +
        '<textarea id="dept-desc" placeholder="Description" rows="3"></textarea>' +
        '<button class="btn btn-success" onclick="saveDept()">Save</button>' +
        '<button class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>' +
        '</div>';
}

function saveDept() {
    const newDept = {
        id: window.db.departments.length + 1,
        name: document.getElementById('dept-name').value,
        description: document.getElementById('dept-desc').value
    };
    
    window.db.departments.push(newDept);
    saveToStorage();
    showToast('Department created successfully!', 'success');
    renderDepartmentsList();
}

function editDept(id) {
    const dept = window.db.departments.find(function(d) { return d.id === id; });
    if (!dept) return;
    
    const formDiv = document.getElementById('dept-form');
    if (!formDiv) return;
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Edit Department</h5>' +
        '<input type="text" id="edit-dept-name" value="' + dept.name + '">' +
        '<textarea id="edit-dept-desc" rows="3">' + dept.description + '</textarea>' +
        '<button class="btn btn-success" onclick="updateDept(' + id + ')">Update</button>' +
        '<button class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>' +
        '</div>';
}

function updateDept(id) {
    const dept = window.db.departments.find(function(d) { return d.id === id; });
    if (!dept) return;
    
    dept.name = document.getElementById('edit-dept-name').value;
    dept.description = document.getElementById('edit-dept-desc').value;
    
    saveToStorage();
    showToast('Department updated successfully!', 'success');
    renderDepartmentsList();
}

function deleteDept(id) {
    if (confirm('Are you sure you want to delete this department?')) {
        window.db.departments = window.db.departments.filter(function(d) {
            return d.id !== id;
        });
        saveToStorage();
        showToast('Department deleted successfully!', 'success');
        renderDepartmentsList();
    }
}


function renderEmployeesList() {
    const content = document.getElementById('employees-content');
    if (!content) return;
    
    let html = '<button class="btn btn-success" onclick="showAddEmpForm()">+ Add Employee</button>';
    html += '<div id="emp-form"></div>';
    html += '<table><thead><tr><th>ID</th><th>User</th><th>Position</th><th>Department</th><th>Hire Date</th><th>Actions</th></tr></thead><tbody>';
    
    for (let i = 0; i < window.db.employees.length; i++) {
        const emp = window.db.employees[i];
        const user = window.db.accounts.find(function(a) { return a.id === emp.userId; });
        const dept = window.db.departments.find(function(d) { return d.id === emp.deptId; });
        
        html += '<tr>';
        html += '<td>' + emp.empId + '</td>';
        html += '<td>' + (user ? user.email : 'N/A') + '</td>';
        html += '<td>' + emp.position + '</td>';
        html += '<td>' + (dept ? dept.name : 'N/A') + '</td>';
        html += '<td>' + emp.hireDate + '</td>';
        html += '<td>';
        html += '<button class="btn btn-warning" onclick="editEmp(' + emp.id + ')">Edit</button>';
        html += '<button class="btn btn-danger" onclick="deleteEmp(' + emp.id + ')">Delete</button>';
        html += '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    content.innerHTML = html;
}

function showAddEmpForm() {
    const formDiv = document.getElementById('emp-form');
    if (!formDiv) return;
    
    let userOptions = '<option value="">Select User</option>';
    for (let i = 0; i < window.db.accounts.length; i++) {
        userOptions += '<option value="' + window.db.accounts[i].id + '">' + window.db.accounts[i].email + '</option>';
    }
    
    let deptOptions = '<option value="">Select Department</option>';
    for (let i = 0; i < window.db.departments.length; i++) {
        deptOptions += '<option value="' + window.db.departments[i].id + '">' + window.db.departments[i].name + '</option>';
    }
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Add Employee</h5>' +
        '<input type="text" id="emp-id" placeholder="Employee ID">' +
        '<select id="emp-user">' + userOptions + '</select>' +
        '<input type="text" id="emp-position" placeholder="Position">' +
        '<select id="emp-dept">' + deptOptions + '</select>' +
        '<input type="date" id="emp-hire-date">' +
        '<button class="btn btn-success" onclick="saveEmp()">Save</button>' +
        '<button class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>' +
        '</div>';
}

function saveEmp() {
    const newEmp = {
        id: window.db.employees.length + 1,
        empId: document.getElementById('emp-id').value,
        userId: parseInt(document.getElementById('emp-user').value),
        position: document.getElementById('emp-position').value,
        deptId: parseInt(document.getElementById('emp-dept').value),
        hireDate: document.getElementById('emp-hire-date').value
    };
    
    window.db.employees.push(newEmp);
    saveToStorage();
    showToast('Employee added successfully!', 'success');
    renderEmployeesList();
}

function editEmp(id) {
    const emp = window.db.employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    
    const formDiv = document.getElementById('emp-form');
    if (!formDiv) return;
    
    let userOptions = '';
    for (let i = 0; i < window.db.accounts.length; i++) {
        const selected = window.db.accounts[i].id === emp.userId ? ' selected' : '';
        userOptions += '<option value="' + window.db.accounts[i].id + '"' + selected + '>' + window.db.accounts[i].email + '</option>';
    }
    
    let deptOptions = '';
    for (let i = 0; i < window.db.departments.length; i++) {
        const selected = window.db.departments[i].id === emp.deptId ? ' selected' : '';
        deptOptions += '<option value="' + window.db.departments[i].id + '"' + selected + '>' + window.db.departments[i].name + '</option>';
    }
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>Edit Employee</h5>' +
        '<input type="text" id="edit-emp-id" value="' + emp.empId + '">' +
        '<select id="edit-emp-user">' + userOptions + '</select>' +
        '<input type="text" id="edit-emp-position" value="' + emp.position + '">' +
        '<select id="edit-emp-dept">' + deptOptions + '</select>' +
        '<input type="date" id="edit-emp-hire-date" value="' + emp.hireDate + '">' +
        '<button class="btn btn-success" onclick="updateEmp(' + id + ')">Update</button>' +
        '<button class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>' +
        '</div>';
}

function updateEmp(id) {
    const emp = window.db.employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    
    emp.empId = document.getElementById('edit-emp-id').value;
    emp.userId = parseInt(document.getElementById('edit-emp-user').value);
    emp.position = document.getElementById('edit-emp-position').value;
    emp.deptId = parseInt(document.getElementById('edit-emp-dept').value);
    emp.hireDate = document.getElementById('edit-emp-hire-date').value;
    
    saveToStorage();
    showToast('Employee updated successfully!', 'success');
    renderEmployeesList();
}

function deleteEmp(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        window.db.employees = window.db.employees.filter(function(e) {
            return e.id !== id;
        });
        saveToStorage();
        showToast('Employee deleted successfully!', 'success');
        renderEmployeesList();
    }
}


function renderRequestsList() {
    if (!currentUser) return;
    
    const content = document.getElementById('requests-content');
    if (!content) return;
    
    const userRequests = currentUser.role === 'admin' 
        ? window.db.requests 
        : window.db.requests.filter(function(r) { return r.employeeEmail === currentUser.email; });
    
    let html = '<button class="btn btn-success" onclick="showAddRequestForm()">+ New Request</button>';
    html += '<div id="request-form"></div>';
    
    if (userRequests.length === 0) {
        html += '<p class="text-muted">No requests yet.</p>';
    } else {
        html += '<table><thead><tr><th>Date</th><th>Type</th><th>Items</th><th>Status</th>';
        
        if (currentUser.role === 'admin') {
            html += '<th>Employee</th><th>Actions</th>';
        }
        
        html += '</tr></thead><tbody>';
        
        for (let i = 0; i < userRequests.length; i++) {
            const req = userRequests[i];
            let badgeClass = 'badge-warning';
            if (req.status === 'Approved') badgeClass = 'badge-success';
            if (req.status === 'Rejected') badgeClass = 'badge-danger';
            
            html += '<tr>';
            html += '<td>' + req.date + '</td>';
            html += '<td>' + req.type + '</td>';
            html += '<td>' + req.items.length + ' item(s)</td>';
            html += '<td><span class="badge ' + badgeClass + '">' + req.status + '</span></td>';
            
            if (currentUser.role === 'admin') {
                html += '<td>' + req.employeeEmail + '</td>';
                html += '<td>';
                html += '<button class="btn btn-success" onclick="updateRequestStatus(' + req.id + ', \'Approved\')">Approve</button>';
                html += '<button class="btn btn-danger" onclick="updateRequestStatus(' + req.id + ', \'Rejected\')">Reject</button>';
                html += '</td>';
            }
            
            html += '</tr>';
        }
        
        html += '</tbody></table>';
    }
    
    content.innerHTML = html;
}

function showAddRequestForm() {
    const formDiv = document.getElementById('request-form');
    if (!formDiv) return;
    
    formDiv.innerHTML = 
        '<div class="form-card">' +
        '<h5>New Request</h5>' +
        '<select id="req-type">' +
        '<option value="Equipment">Equipment</option>' +
        '<option value="Leave">Leave</option>' +
        '<option value="Resources">Resources</option>' +
        '</select>' +
        '<div id="items-container">' +
        '<div class="item-row" style="display: flex; gap: 10px; margin: 10px 0;">' +
        '<input type="text" placeholder="Item name" style="flex: 2;">' +
        '<input type="number" value="1" min="1" placeholder="Qty" style="flex: 1;">' +
        '<button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>' +
        '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-secondary" onclick="addItemRow()">+ Add Item</button><br><br>' +
        '<button class="btn btn-success" onclick="saveRequest()">Submit Request</button>' +
        '<button class="btn btn-secondary" onclick="renderRequestsList()">Cancel</button>' +
        '</div>';
}

function addItemRow() {
    const container = document.getElementById('items-container');
    if (!container) return;
    
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    newRow.style.cssText = 'display: flex; gap: 10px; margin: 10px 0;';
    newRow.innerHTML = 
        '<input type="text" placeholder="Item name" style="flex: 2;">' +
        '<input type="number" value="1" min="1" placeholder="Qty" style="flex: 1;">' +
        '<button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>';
    
    container.appendChild(newRow);
}

function saveRequest() {
    if (!currentUser) return;
    
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    
    for (let i = 0; i < itemRows.length; i++) {
        const inputs = itemRows[i].querySelectorAll('input');
        if (inputs[0].value) {
            items.push({
                name: inputs[0].value,
                quantity: parseInt(inputs[1].value)
            });
        }
    }
    
    if (items.length === 0) {
        showToast('Please add at least one item', 'error');
        return;
    }
    
    const newReq = {
        id: window.db.requests.length + 1,
        type: document.getElementById('req-type').value,
        items: items,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        employeeEmail: currentUser.email
    };
    
    window.db.requests.push(newReq);
    saveToStorage();
    showToast('Request submitted successfully!', 'success');
    renderRequestsList();
}

function updateRequestStatus(id, status) {
    const req = window.db.requests.find(function(r) { return r.id === id; });
    if (!req) return;
    
    req.status = status;
    saveToStorage();
    
    const toastType = status === 'Approved' ? 'success' : 'warning';
    showToast('Request ' + status.toLowerCase() + '!', toastType);
    renderRequestsList();
}


function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {
    const hash = window.location.hash || '#/';
    const route = hash.replace('#/', '');
    
 
    const pages = document.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    
    const isAuth = document.body.classList.contains('authenticated');
    const isAdmin = document.body.classList.contains('is-admin');
    
    let pageId = null;
    
    if (route === '' || route === 'home') {
        pageId = 'home-page';
    } else if (route === 'login') {
        if (isAuth) {
            navigateTo('#/profile');
            return;
        }
        pageId = 'login-page';
    } else if (route === 'register') {
        if (isAuth) {
            navigateTo('#/profile');
            return;
        }
        pageId = 'register-page';
    } else if (route === 'verify-email') {
        const email = localStorage.getItem('unverified_email');
        if (email) {
            const emailEl = document.getElementById('verification-email');
            if (emailEl) emailEl.textContent = email;
        }
        pageId = 'verify-email-page';
    } else if (route === 'profile') {
        if (!isAuth) {
            showToast('Please login first', 'warning');
            navigateTo('#/login');
            return;
        }
        renderProfile();
        pageId = 'profile-page';
    } else if (route === 'accounts') {
        if (!isAuth || !isAdmin) {
            showToast('Admin access required', 'error');
            navigateTo('#/');
            return;
        }
        renderAccountsList();
        pageId = 'accounts-page';
    } else if (route === 'departments') {
        if (!isAuth || !isAdmin) {
            showToast('Admin access required', 'error');
            navigateTo('#/');
            return;
        }
        renderDepartmentsList();
        pageId = 'departments-page';
    } else if (route === 'employees') {
        if (!isAuth || !isAdmin) {
            showToast('Admin access required', 'error');
            navigateTo('#/');
            return;
        }
        renderEmployeesList();
        pageId = 'employees-page';
    } else if (route === 'requests') {
        if (!isAuth) {
            showToast('Please login first', 'warning');
            navigateTo('#/login');
            return;
        }
        renderRequestsList();
        pageId = 'requests-page';
    } else {
        navigateTo('#/');
        return;
    }
    
    if (pageId) {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
    }
}

window.addEventListener('hashchange', handleRouting);


document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Rallos App Ready - All Phases Complete!');
    console.log('📧 Admin Login: admin@example.com');
    console.log('🔑 Password: Password123!');
    
    loadFromStorage();
    checkAuthState();
    
    if (!window.location.hash) {
        window.location.hash = '#/';
    }
    
    handleRouting();
    

    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', handleRegister);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerify);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
