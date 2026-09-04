(() => {
  const siteSlug = "httpledestinmeowadvancedintelligencecom-1788513931";
  const HELPERS_Head =
    "site_ecb8ededa4649b0d3c0081a3605884d2fcc794a59f13a29d";
  const reviewsGrid = document.getElementById("reviewsGrid");

  function getReviewList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.reviews)) return payload.reviews;
    if (Array.isArray(payload?.data?.reviews)) return payload.data.reviews;
    return [];
  }

  function getReviewImage(review) {
    return (
      review.image_url ||
      review.avatar_url ||
      review.photo_url ||
      review.media?.[0]?.path_url ||
      review.media_list?.[0]?.path_url ||
      ""
    );
  }

  function getReviewCopy(review) {
    return (
      review.description ||
      review.review ||
      review.comment ||
      review.content ||
      "A thoughtful Le Destin connection shared by our community."
    );
  }

  function getReviewName(review) {
    return review.name || review.customer_name || review.author || "Le Destin member";
  }

  function getReviewLabel(review) {
    return (
      review.location ||
      review.city ||
      review.category_name ||
      review.brand_name ||
      "Singapore"
    );
  }

  function getReviewRating(review) {
    const rating = Number(review.rating || review.stars || 5);
    return Math.max(1, Math.min(5, Number.isFinite(rating) ? rating : 5));
  }

  function renderReviews(reviews) {
    if (!reviewsGrid || reviews.length === 0) return;
    reviewsGrid.textContent = "";
    reviewsGrid.dataset.fallback = "false";
    reviews.forEach((review) => {
      const article = document.createElement("article");
      article.className = "review";

      const photo = document.createElement("div");
      photo.className = "review-photo";
      const image = getReviewImage(review);
      if (image) photo.style.backgroundImage = `url("${image}")`;
      photo.setAttribute("role", "img");
      photo.setAttribute("aria-label", getReviewName(review));

      const copy = document.createElement("div");
      copy.className = "review-copy";

      const stars = document.createElement("div");
      stars.className = "stars";
      stars.setAttribute("aria-label", `${getReviewRating(review)} out of 5 stars`);
      stars.textContent = "★★★★★".slice(0, getReviewRating(review));

      const quote = document.createElement("p");
      quote.className = "quote";
      quote.textContent = `“${getReviewCopy(review)}”`;

      const names = document.createElement("div");
      names.className = "names";
      names.textContent = `${getReviewName(review)} · ${getReviewLabel(review)}`;

      const verified = document.createElement("span");
      verified.className = "verified";
      verified.textContent = "Le Destin review";

      copy.append(stars, quote, names, verified);
      article.append(photo, copy);
      reviewsGrid.append(article);
    });
  }

  async function loadReviews() {
    if (!reviewsGrid) return;
    try {
      const response = await fetch(
        `https://meow-service-test.flutterclone.com/api/sites/${siteSlug}/reviews?nopaginate=1`,
        {
          headers: {
            "x-site-api-key": HELPERS_Head,
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) return;
      renderReviews(getReviewList(await response.json()));
    } catch (error) {
      console.warn("Unable to load Le Destin reviews", error);
    }
  }

  loadReviews();
})();
