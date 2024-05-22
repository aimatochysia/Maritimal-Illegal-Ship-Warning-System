function saveUserData(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) {
        alert('User already exists!');
        return false;
    }
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful!');
    return true;
}

function validateUserData(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email] && users[email] === password) {
        alert('Login successful!');
        return true;
    } else {
        alert('Invalid email or password!');
        return false;
    }
}
