document.addEventListener("DOMContentLoaded", function () {
  function validateField(field) {
    const input = field.querySelector("input, select, textarea");
    const valid = input.checkValidity();
    field.classList.toggle("is-invalid", !valid);
    field.classList.toggle("is-valid", valid);
    return valid;
  }

  // Without a backend endpoint in the form's action attribute, the enquiry is handed to the visitor's mail app.
  // `labels` lists the fields that go into the email body; `title` builds its subject line.
  function setupForm(form, note, labels, title) {
    const fields = Array.from(form.querySelectorAll(".s2-field")).filter((f) => f.querySelector("[required]"));

    fields.forEach((field) => {
      const input = field.querySelector("input, select, textarea");
      input.addEventListener("blur", () => validateField(field));
      input.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) validateField(field);
      });
    });
    form.querySelectorAll("select").forEach((select) =>
      select.addEventListener("change", () => select.closest(".s2-field").classList.add("has-value"))
    );

    function showNote(text, ok) {
      note.textContent = text;
      note.classList.toggle("is-success", ok);
      note.classList.toggle("is-error", !ok);
    }

    function sendByEmail(data) {
      const body = Object.keys(labels)
        .filter((key) => data.get(key))
        .map((key) => labels[key] + ": " + data.get(key))
        .join("\n");
      window.location.href = "mailto:" + form.dataset.mailto + "?subject=" + encodeURIComponent(title(data)) + "&body=" + encodeURIComponent(body);
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
        form.querySelectorAll(".s2-field").forEach((f) => f.classList.remove("is-valid", "is-invalid", "has-value"));
      } catch (err) {
        showNote("Sorry, your enquiry couldn't be sent. Please email us at " + form.dataset.mailto + ".", false);
      } finally {
        btn.classList.remove("is-loading");
        btn.disabled = false;
      }
    });
  }

  /* Links such as contact.html?subject=Datasheet%20Request: carry the subject into the email link,
     or jump straight to the distributor form for distributor enquiries. */
  const requested = new URLSearchParams(window.location.search).get("subject");
  const hqEmail = document.getElementById("s2HqEmail");
  if (requested && hqEmail) {
    hqEmail.href = "mailto:info@sams-mobile.com?subject=" + encodeURIComponent(requested);
    hqEmail.closest(".s2-ct-hqs__card")?.classList.add("has-subject");
  }
  if (requested === "Distributor Enquiry") {
    const dist = document.getElementById("distributors");
    if (dist) window.scrollTo({ top: dist.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
  }

  /* Distributor enquiry form */
  const distForm = document.getElementById("s2DistForm");
  const distNote = document.getElementById("s2DistNote");
  if (distForm && distNote) {
    setupForm(
      distForm,
      distNote,
      { name: "Name", company: "Company", email: "Email", phone: "Phone", market: "Country / territory", businessType: "Business type", message: "Message" },
      (data) => "Distributor Enquiry — " + data.get("company") + " (" + data.get("market") + ")"
    );
  }
});
