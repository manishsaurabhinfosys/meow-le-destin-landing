(function () {
  "use strict";
  const slug = document.currentScript?.dataset.brandSlug;
  const container = document.querySelector("[data-brand-contact-list]");
  if (!slug || !container) return;
  container.hidden = true;
  fetch("https://meow-service-test.flutterclone.com/api/user/brand", { headers: { Accept: "application/json" } })
    .then((response) => { if (!response.ok) throw new Error(`Brand request failed (${response.status})`); return response.json(); })
    .then((payload) => {
      const brand = payload?.data?.find((item) => item.slug?.toLowerCase() === slug.toLowerCase());
      if (!brand) return;
      const fields = [["Name", brand.name], ["Phone", brand.phone], ["Email", brand.email], ["Address", brand.address]].filter(([, value]) => Boolean(value));
      container.replaceChildren(...fields.map(([label, value]) => {
        const row = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        row.append(strong, document.createTextNode(value));
        return row;
      }));
      container.hidden = fields.length === 0;
    })
    .catch((error) => console.error("Unable to load brand contact information", error));
})();
