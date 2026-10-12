const form = document.getElementById("registrationForm");
const successMessage = document.getElementById("successMessage");
const formSummary = document.getElementById("formSummary");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const resetButton = document.getElementById("resetButton");

const fields = Array.from(form.querySelectorAll("[data-required='true']"));

function errorElementFor(field) {
  return document.getElementById(`${field.id}Error`);
}

function showError(field, message) {
  field.classList.add("error");
  field.setAttribute("aria-invalid", "true");
  const errorElement = errorElementFor(field);
  if (errorElement) errorElement.textContent = message;
}

function clearError(field) {
  field.classList.remove("error");
  field.removeAttribute("aria-invalid");
  const errorElement = errorElementFor(field);
  if (errorElement) errorElement.textContent = "";
}

function cleanValue(field) {
  if (field.type === "checkbox") return field.checked;
  if (field.tagName === "SELECT") return field.value;
  const cleaned = field.value.trim();
  if (field.value !== cleaned) field.value = cleaned;
  return cleaned;
}

function validateField(field) {
  const value = cleanValue(field);
  const label = field.dataset.label || "This field";

  if (field.type === "checkbox") {
    if (!value) {
      showError(field, "Please accept the registration agreement to continue.");
      return false;
    }
    clearError(field);
    return true;
  }

  if (!value) {
    showError(field, `${label} is required.`);
    return false;
  }

  if (field.id === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) {
      showError(field, "Enter a valid email address, such as name@example.com.");
      return false;
    }
  }

  if (field.id === "phone") {
    if (!/^09\d{9}$/.test(value)) {
      showError(field, "Enter an 11-digit mobile number starting with 09.");
      return false;
    }
  }

  if (field.id === "dob") {
    const chosenDate = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosenDate.getTime()) || chosenDate > today) {
      showError(field, "Date of birth cannot be in the future.");
      return false;
    }
  }

  if (field.id === "password") {
    if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      showError(field, "Use at least 8 characters with at least one letter and one number.");
      return false;
    }
  }

  if (field.id === "confirmPassword" && value !== passwordInput.value.trim()) {
    showError(field, "Passwords do not match.");
    return false;
  }

  clearError(field);
  return true;
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  let isFormValid = true;
  fields.forEach((field) => {
    if (!validateField(field)) isFormValid = false;
  });

  if (!isFormValid) {
    formSummary.hidden = false;
    successMessage.hidden = true;
    const firstInvalid = form.querySelector(".error");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  formSummary.hidden = true;
  successMessage.textContent = `Registration successful! Welcome, ${document.getElementById("fullName").value.trim()}. Your information passed all validation checks.`;
  successMessage.hidden = false;
  successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

fields.forEach((field) => {
  const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur";
  field.addEventListener(eventName, () => {
    if (field.classList.contains("error")) validateField(field);
    if (field.id === "password" && document.getElementById("confirmPassword").value) {
      validateField(document.getElementById("confirmPassword"));
    }
  });
  field.addEventListener("input", () => {
    if (field.classList.contains("error")) validateField(field);
    if (field.id === "password" && document.getElementById("confirmPassword").value) {
      validateField(document.getElementById("confirmPassword"));
    }
  });
});

// classList.toggle() controls the password visibility and updates the button label.
togglePassword.addEventListener("click", function() {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  passwordInput.classList.toggle("password-visible", !isVisible);
  togglePassword.textContent = isVisible ? "Show" : "Hide";
  togglePassword.setAttribute("aria-pressed", String(!isVisible));
  togglePassword.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
});

// Attribute manipulation: the date field's maximum is set dynamically to today's date.
const dobInput = document.getElementById("dob");
const todayString = new Date();
const localToday = `${todayString.getFullYear()}-${String(todayString.getMonth() + 1).padStart(2, "0")}-${String(todayString.getDate()).padStart(2, "0")}`;
dobInput.setAttribute("max", localToday);

form.addEventListener("reset", function() {
  // Wait until the browser has restored the default values.
  window.setTimeout(() => {
    fields.forEach(clearError);
    successMessage.hidden = true;
    successMessage.textContent = "";
    formSummary.hidden = true;
    passwordInput.type = "password";
    passwordInput.classList.toggle("password-visible", false);
    togglePassword.textContent = "Show";
    togglePassword.setAttribute("aria-pressed", "false");
    togglePassword.setAttribute("aria-label", "Show password");
    dobInput.setAttribute("max", localToday);
  }, 0);
});
