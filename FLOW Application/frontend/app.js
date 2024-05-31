document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
  
    // Cookie consent popup logic
    var consent = localStorage.getItem('cookieConsent');
    console.log("Cookie consent retrieved:", consent);
    if (consent !== 'given') {
      document.getElementById('cookieConsentPopup').style.display = 'block';
    }
  
    document.getElementById('acceptCookies').onclick = function() {
      localStorage.setItem('cookieConsent', 'given');
      document.getElementById('cookieConsentPopup').style.display = 'none';
      console.log("Cookies accepted");
    };
  
    document.getElementById('declineCookies').onclick = function() {
      localStorage.setItem('cookieConsent', 'declined');
      document.getElementById('cookieConsentPopup').style.display = 'none';
      console.log("Cookies declined");
    };
  
    // Login popup logic
    var loginPopup = document.getElementById('loginPopup');
    var loginLink = document.querySelector('a[href="#login"]');
    var closeBtn = document.querySelector('.login-popup .close');
  
    loginLink.addEventListener('click', function(event) {
      event.preventDefault();
      loginPopup.style.display = 'block';
      console.log("Login popup displayed");
    });
  
    closeBtn.addEventListener('click', function() {
      loginPopup.style.display = 'none';
      console.log("Login popup closed");
    });
  
    window.addEventListener('click', function(event) {
      if (event.target === loginPopup) {
        loginPopup.style.display = 'none';
        console.log("Login popup closed via outside click");
      }
    });
  
    // Login form submission logic
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', async function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        if (response.ok) {
          const result = await response.json();
          window.location.href = `/account?user_id=${result.user_id}`;
        } else {
          const result = await response.json();
          alert(result.message);
        }
      } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred. Please try again.');
      }
    });

    handleForgotPasswordForm();

  });
  
  
  function handleForgotPasswordForm() {
    const forgotPasswordLink = document.querySelector('.forgot-password');

    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();

        const email = prompt('Please enter your email:');
        if (email) {
            fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => {
                console.error('Error sending password reset email:', error);
                alert('An error occurred. Please try again.');
            });
        }
    });
}
  


document.addEventListener('DOMContentLoaded', function() {
    // Email verification popup logic
    const urlParams = new URLSearchParams(window.location.search);
    const isVerified = urlParams.get('verified');

    if (isVerified === 'true') {
        const verificationPopup = document.getElementById('verificationPopup');
        const loginLink = document.getElementById('loginLink');
        const loginPopup = document.getElementById('loginPopup');
        const closeBtn = verificationPopup.querySelector('.close');

        // Show the verification popup
        verificationPopup.style.display = 'block';
        console.log("Verification popup displayed");

        // When the user clicks on the login link, open the login popup
        loginLink.addEventListener('click', function(event) {
            event.preventDefault();
            verificationPopup.style.display = 'none';
            loginPopup.style.display = 'block';
        });

        // When the user clicks on close button, hide the verification popup
        closeBtn.addEventListener('click', function() {
            verificationPopup.style.display = 'none';
        });
    }
});




document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.registerForm');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.modal-content .close');
    
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission captured');
  
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms').checked;
  
            console.log('Form data:', { fullName, email, password, confirmPassword, termsAccepted });
  
            // Perform password match validation
            if (password !== confirmPassword) {
                document.getElementById('match-error').classList.remove('hidden');
                return;
            }
  
            document.getElementById('match-error').classList.add('hidden');
  
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ full_name: fullName, email, password }) // Use full_name instead of fullName
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                alert(data.message);
  
                // Show modal if registration is successful
                if (data.message === 'User registered successfully. Check your email for verification instructions.') {
                    const confirmationMessage = document.getElementById('confirmationMessage');
                    confirmationMessage.textContent = `We have sent you a confirmation link to ${email}. Proceed with the link to the log in page. Wait for your Client ID afterwards.`;
                    modal.classList.remove('hidden');
                    modal.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    } else {
        console.error('Form not found');
    }
  
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        });
    }
  });
  





document.addEventListener('DOMContentLoaded', function() {
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const conditionsList = document.getElementById('passwordConditions').getElementsByTagName('li');

  const updateRequirement = (condition, index) => {
      if (condition) {
          conditionsList[index].classList.add('complete');
      } else {
          conditionsList[index].classList.remove('complete');
      }
  };

  password.addEventListener('input', function() {
      const value = this.value;
      updateRequirement(/[A-Z]/.test(value), 0); // Uppercase
      updateRequirement(value.length >= 8, 1); // Length of 8
      updateRequirement(/[a-z]/.test(value), 2); // Lowercase
      updateRequirement(/\d/.test(value), 3); // Number
      updateRequirement(/[\W_]/.test(value), 4); // Special character
  });

  confirmPassword.addEventListener('input', function() {
      const passwordsMatch = password.value === this.value;
      const matchErrorElement = document.getElementById('match-error'); 
      if (passwordsMatch) {
          matchErrorElement.classList.add('hidden');
      } else {
          matchErrorElement.classList.remove('hidden');
      }
  });

  const form = document.querySelector('.register-form form');
  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent form from submitting if conditions are not met
      const conditionsMet = Array.from(conditionsList).every(li => li.classList.contains('complete'));
      const passwordsMatch = password.value === confirmPassword.value;

      if (conditionsMet && passwordsMatch) {
      
          console.log('Form is valid and ready to be submitted');
         //  form.submit(); 
      } else {
          console.log('Form has validation errors');
    
      }
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const infoContainers = document.querySelectorAll('.info');

  tabs.forEach(tab => {
      tab.addEventListener('click', () => {

          tabs.forEach(t => t.classList.remove('active'));

          tab.classList.add('active');

          infoContainers.forEach(container => container.classList.remove('active'));
          // Show the corresponding info container
          const activeTab = document.getElementById(tab.getAttribute('data-tab'));
          activeTab.classList.add('active');
      });
  });
});




document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.querySelector('.edit-all-button');
    const checkboxes = document.querySelectorAll('#notifications .switch input');

    editButton.addEventListener('click', () => {
        const isEditing = editButton.textContent === 'EDIT';
        editButton.textContent = isEditing ? 'DONE' : 'EDIT';

        // Toggle the disabled state of checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.disabled = !isEditing;
        });

   
        if (!isEditing) {
            console.log('Changes are being saved...');

        }
    });
});




document.addEventListener('DOMContentLoaded', function() {
  // Check if the S-PIN is set or not
  if (!localStorage.getItem('sPinSet')) {
      showSPINModal('create');
  }

  // Attach event listeners for all buttons that require S-PIN confirmation
  document.querySelectorAll('[data-require-pin="true"]').forEach(button => {
      button.addEventListener('click', function(event) {
          event.preventDefault();  // Prevent default action
          showSPINModal('confirm');  // Show the confirm S-PIN modal
      });
  });

  document.addEventListener('keydown', handleKeyPress);
});

function showSPINModal(type) {
  // Control the display of S-PIN modals
  document.getElementById('s-pin-overlay').style.display = 'flex';
  document.getElementById('create-s-pin-modal').style.display = (type === 'create') ? 'block' : 'none';
  document.getElementById('confirm-s-pin-modal').style.display = (type === 'confirm') ? 'block' : 'none';
}

function handleKeyPress(e) {
  // Handle keyboard inputs for S-PIN entry
  let activeModal = document.querySelector('.s-pin-modal:not([style*="display: none"])');
  if (!activeModal) return;

  let inputs = activeModal.querySelectorAll('.pin-inputs input');
  updateInputs(inputs, e.key);
}

function updateInputs(inputs, key) {
  // Update the input fields with key inputs
  let filledInputs = Array.from(inputs).filter(input => input.value !== '');
  if (key >= '0' && key <= '9' && filledInputs.length < inputs.length) {
      inputs[filledInputs.length].value = key;
  } else if (key === 'Backspace' && filledInputs.length > 0) {
      inputs[filledInputs.length - 1].value = '';
  }
}

function confirmSPIN() {
  // Confirm the entered S-PIN against the stored value
  let inputs = document.querySelectorAll('#confirm-s-pin-modal .pin-inputs input');
  let confirmedPin = Array.from(inputs).map(input => input.value).join('');
  if (confirmedPin === localStorage.getItem('sPin')) {
      document.getElementById('s-pin-overlay').style.display = 'none';
      alert('S-PIN confirmed successfully!');
      executeProtectedAction();
  } else {
      alert("S-PIN does not match. Please try again.");
      inputs.forEach(input => input.value = ''); // Clear inputs for retry
  }
}

function executeProtectedAction() {
  // Execute actions protected by S-PIN confirmation
  console.log("Protected action executed successfully.");
}

function moveToConfirmSPIN() {
  // Transition from setting S-PIN to confirming it
  let pin = Array.from(document.querySelectorAll('#create-s-pin-modal .pin-inputs input')).map(input => input.value).join('');
  if (pin.length === 4) {
      localStorage.setItem('sPin', pin); // Store the set S-PIN
      localStorage.setItem('sPinSet', true); // Mark the S-PIN as set
      showSPINModal('confirm');
  } else {
      alert("Please complete your 4-digit S-PIN.");
  }
}



document.getElementById('loans-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.settings').classList.add('hidden');
    document.getElementById('loans').classList.remove('hidden');
    document.body.style.backgroundImage = "url('media/servicesbckg.png')"; // Set the loans background
});

document.getElementById('settings-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.settings').classList.remove('hidden');
    document.getElementById('loans').classList.add('hidden');

});



document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.registerForm');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.modal-content .close');
    
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission captured');
  
            const full_name = document.getElementById('full-name').value; // Use full_name here
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms').checked;
  
            console.log('Form data:', { full_name, email, password, confirmPassword, termsAccepted });
  
            // Perform password match validation
            if (password !== confirmPassword) {
                document.getElementById('match-error').classList.remove('hidden');
                return;
            }
  
            document.getElementById('match-error').classList.add('hidden');
  
            const payload = { full_name, email, password }; // Use full_name here
            console.log('Payload to be sent:', payload);
  
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // Use full_name here
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                alert(data.message);
  
                // Show modal if registration is successful
                if (data.message === 'User registered successfully') {
                    const confirmationMessage = document.getElementById('confirmationMessage');
                    confirmationMessage.textContent = `We have sent you a confirmation link to ${email}. Proceed with the link to the log in page. Wait for your Client ID afterwards.`;
                    modal.classList.remove('hidden');
                    modal.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    } else {
        console.error('Form not found');
    }
  
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        });
    }
  });
  
  
