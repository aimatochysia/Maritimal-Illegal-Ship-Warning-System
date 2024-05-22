document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById('regist-form');
    const registerPage = document.getElementById('register-page');
    const loginPage = document.getElementById('login-page');
    const toLoginLink = document.getElementById('to-login');
    const toRegisterLink = document.getElementById('to-register');
    const emailRegister = document.getElementById('email-regis');
    const passwordRegister = document.getElementById('pass-regis');
    const checkboxRegister = document.getElementById('validation-regis');
    const emailLogin = document.getElementById('email-login');
    const passwordLogin = document.getElementById('pass-login');

    // Function to show the login page
    function showLoginPage() {
        registerPage.style.display = 'none';
        loginPage.style.display = 'block';
    }

    // Function to show the register page
    function showRegisterPage() {
        loginPage.style.display = 'none';
        registerPage.style.display = 'block';
    }

    // Add event listener for the submit button on the register page
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (registerPage.style.display !== 'none') {
            if (!checkboxRegister.checked) {
                alert('You must agree to the terms first.');
                return false;
            }
            const registrationSuccess = saveUserData(emailRegister.value, passwordRegister.value);
            if (registrationSuccess) {
                showLoginPage();
            }
        } else {
            validateUserData(emailLogin.value, passwordLogin.value);
        }
    });

    // Add event listeners for the links
    toLoginLink.addEventListener('click', function(event) {
        event.preventDefault();
        showLoginPage();
    });

    toRegisterLink.addEventListener('click', function(event) {
        event.preventDefault();
        showRegisterPage();
    });
});
