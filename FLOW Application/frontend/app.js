

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



  //modal
    var modal = document.getElementById('myModal');
  

    var form = document.querySelector('.register-form form');
  
    var nextStepBtn = document.getElementById('submitStep2');
  
    var closeBtn = document.querySelector('.close');
  

    form.onsubmit = function(event) {
      event.preventDefault();
      modal.classList.remove('hidden'); 
    };
  
   
    closeBtn.onclick = function() {
      modal.classList.add('hidden');
    };
  

    window.onclick = function(event) {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    };


  form.onsubmit = function(event) {
    event.preventDefault(); 
    console.log("Modal should show now."); 
    modal.classList.remove('hidden'); 
  };
  
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
