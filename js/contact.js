document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("s2ContactForm");
  const note = document.getElementById("s2ContactNote");
  if (!form || !note) return;

  const subject = document.getElementById("ctSubject");
  const firstName = document.getElementById("ctFirst");
  const fields = Array.from(form.querySelectorAll(".s2-field")).filter((f) => f.querySelector("[required]"));

  function validateField(field) {
    const input = field.querySelector("input, select, textarea");
    const valid = input.checkValidity();
    field.classList.toggle("is-invalid", !valid);
    field.classList.toggle("is-valid", valid);
    return valid;
  }

  fields.forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    input.addEventListener("blur", () => validateField(field));
    input.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) validateField(field);
    });
  });

  function setSubject(value) {
    subject.value = value;
    subject.closest(".s2-field").classList.add("has-value");
    if (subject.closest(".s2-field").classList.contains("is-invalid")) validateField(subject.closest(".s2-field"));
  }

  subject.addEventListener("change", () => subject.closest(".s2-field").classList.add("has-value"));

  const requested = new URLSearchParams(window.location.search).get("subject");
  if (requested && Array.from(subject.options).some((o) => o.value === requested)) setSubject(requested);

  document.querySelectorAll("[data-subject]").forEach((el) =>
    el.addEventListener("click", (e) => {
      setSubject(el.dataset.subject);
      if (el.tagName === "BUTTON") {
        e.preventDefault();
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      firstName.focus({ preventScroll: true });
    })
  );

  function showNote(text, ok) {
    note.textContent = text;
    note.classList.toggle("is-success", ok);
    note.classList.toggle("is-error", !ok);
  }

  // Without a backend endpoint in the form's action attribute, the enquiry is handed to the visitor's mail app.
  function sendByEmail(data) {
    const labels = { firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone", company: "Company", subject: "Subject", message: "Message" };
    const body = Object.keys(labels)
      .filter((key) => data.get(key))
      .map((key) => labels[key] + ": " + data.get(key))
      .join("\n");
    const title = data.get("subject") + " — " + data.get("firstName") + " " + data.get("lastName");
    window.location.href = "mailto:" + form.dataset.mailto + "?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!fields.map(validateField).every(Boolean)) {
      showNote("Please complete the highlighted fields before submitting.", false);
      return;
    }

    const data = new FormData(form);
    const endpoint = form.getAttribute("action");

    if (!endpoint) {
      sendByEmail(data);
      showNote("Your email app should open with your enquiry filled in — just press send. Or email us at " + form.dataset.mailto + ".", true);
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.classList.add("is-loading");
    btn.disabled = true;
    note.textContent = "";

    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      showNote("Thanks — your enquiry has been sent. Our team will be in touch shortly.", true);
      form.reset();
      fields.forEach((f) => f.classList.remove("is-valid", "is-invalid", "has-value"));
    } catch (err) {
      showNote("Sorry, your enquiry couldn't be sent. Please email us at " + form.dataset.mailto + ".", false);
    } finally {
      btn.classList.remove("is-loading");
      btn.disabled = false;
    }
  });
});
