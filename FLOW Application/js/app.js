

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
          form.submit(); 
      } else {
          console.log('Form has validation errors');
    
      }
  });
});
