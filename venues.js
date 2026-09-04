(() => {
  const VENUES_ENDPOINT =
    "https://meow-service-test.flutterclone.com/api/public/le-destin/venues/list?nopaginate=1";
  const LE_DESTIN_SECRET =
    "pld_2f7a9c1e6b3d4f8081ac5e9d0b6f7a3c4e2d1b8f9a0c3e5d";
  const venuesGrid = document.getElementById("venuesGrid");
  const venuesNote = document.getElementById("venuesNote");
  const venueFallbackImages = [
    {
      keywords: ["gardens by the bay", "marina gardens", "supertree"],
      image:
        "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1400&q=85",
    },
    {
      keywords: ["clarke quay", "river valley", "singapore river"],
      image:
        "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85",
    },
    {
      keywords: ["marina bay sands", "skypark", "bayfront"],
      image:
        "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=1400&q=85",
    },
    {
      keywords: ["sentosa", "beach"],
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    },
    {
      keywords: ["tiong bahru", "cafe", "bookstore"],
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85",
    },
    {
      keywords: ["botanic", "cluny", "orchid"],
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=85",
    },
  ];
  const defaultVenueImage =
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85";

  function getVenueList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.venues)) return payload.venues;
    if (Array.isArray(payload?.data?.venues)) return payload.data.venues;
    return [];
  }

  function creditText(value) {
    const credits = Number(value);
    if (!Number.isFinite(credits) || credits <= 0) return "No credit cost";
    return credits === 1 ? "1 credit" : `${credits} credits`;
  }

  function shortAddress(address) {
    if (!address) return null;
    return address.split(",")[0];
  }

  function makePill(text) {
    if (!text) return null;
    const pill = document.createElement("span");
    pill.className = "event-pill";
    pill.textContent = text;
    return pill;
  }

  function fallbackImageForVenue(venue) {
    const haystack = [venue.name, venue.address, venue.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      venueFallbackImages.find(({ keywords }) =>
        keywords.some((keyword) => haystack.includes(keyword)),
      )?.image || defaultVenueImage
    );
  }

  function renderVenues(venues) {
    const activeVenues = venues
      .filter((venue) => venue.is_active !== false)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .slice(0, 6);

    if (!venuesGrid || activeVenues.length === 0) return;

    venuesGrid.textContent = "";
    venuesGrid.dataset.fallback = "false";

    activeVenues.forEach((venue, index) => {
      const article = document.createElement("article");
      article.className = `moment event-card ${index === 0 ? "hero-moment" : "small"}`;
      article.style.backgroundImage = `url("${venue.image_url || fallbackImageForVenue(venue)}")`;

      const copy = document.createElement("div");
      copy.className = "event-copy";

      const kicker = document.createElement("div");
      kicker.className = "event-kicker";
      kicker.textContent = "Date venue";

      const title = document.createElement("h3");
      title.textContent = venue.name || "Le Destin venue";

      const description = document.createElement("p");
      description.textContent =
        venue.description ||
        "A curated Le Destin setting for thoughtful, easy conversation.";

      const meta = document.createElement("div");
      meta.className = "event-meta";
      [shortAddress(venue.address), creditText(venue.credit_cost)]
        .map(makePill)
        .filter(Boolean)
        .forEach((pill) => meta.append(pill));

      copy.append(kicker, title, description, meta);
      article.append(copy);
      venuesGrid.append(article);
    });

    if (venuesNote) {
      venuesNote.textContent =
        "Live Le Destin date venues. Availability and Match Credit costs update automatically.";
    }
  }

  async function loadVenues() {
    if (!venuesGrid) return;
    try {
      const response = await fetch(VENUES_ENDPOINT, {
        headers: {
          "X-Le-Destin-Secret": LE_DESTIN_SECRET,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      renderVenues(getVenueList(await response.json()));
    } catch (error) {
      console.warn("Unable to load Le Destin venues", error);
    }
  }

  loadVenues();
})();
