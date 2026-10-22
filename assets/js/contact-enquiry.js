/* Bitmint Lab enquiry — user-reviewed WhatsApp handoff, no fake submission state. */
(function () {
  "use strict";
  const form = document.getElementById("wm-contact-form");
  if (!form) return;
  document.querySelectorAll("[data-product-enquiry]").forEach(function (link) {
    link.addEventListener("click", function () {
      const select = form.querySelector('[name="requirementType"]');
      if (select) select.value = link.getAttribute("data-product-enquiry");
    });
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const get = (name) => String(new FormData(form).get(name) || "").trim();
    const name = get("name");
    const phone = get("phone");
    const email = get("email");
    const business = get("business");
    const requirement = form.querySelector('[name="requirementType"]');
    const selected = requirement && requirement.selectedOptions[0] ? requirement.selectedOptions[0].textContent.trim() : get("requirementType");
    const details = get("message");
    const lines = ["Hello Bitmint Lab, I have a project enquiry.", "", "Name: " + name,
      "Phone: " + phone, business ? "Organization: " + business : "",
      email ? "Email: " + email : "", "Requirement: " + selected,
      "Details: " + details].filter(Boolean);
    const url = "https://wa.me/918788680371?text=" + encodeURIComponent(lines.join("\n"));
    window.location.assign(url);
  });
})();
