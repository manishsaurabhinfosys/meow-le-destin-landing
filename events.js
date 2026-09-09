(() => {
  const EVENTS_ENDPOINT =
    "https://meow-service-test.flutterclone.com/api/public/le-destin/singles-events/list?nopaginate=1&status=upcoming";
  const LE_DESTIN_SECRET =
    "pld_2f7a9c1e6b3d4f8081ac5e9d0b6f7a3c4e2d1b8f9a0c3e5d";
  const APP_STORE_URL = "https://apps.apple.com/my/app/le-meow/id6763483119";
  const GOOGLE_PLAY_URL =
    "https://play.google.com/store/apps/details?id=com.meow.lemeow";
  const LE_DESTIN_FORM_URL = "https://forms.gle/tJCERFqTBprF7sJf7";
  const eventsGrid = document.getElementById("eventsGrid");
  const eventFallbackImages = [
    {
      keywords: ["picnic", "garden"],
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    },
    {
      keywords: ["board", "game", "café", "cafe"],
      image:
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=85",
    },
    {
      keywords: ["yoga", "coffee"],
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85",
    },
    {
      keywords: ["karaoke", "ktv", "music", "sing"],
      image:
        "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1200&q=85",
    },
    {
      keywords: ["cocktail", "bar", "wine", "dine"],
      image:
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=85",
    },
    {
      keywords: ["brunch", "cafe", "social"],
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85",
    },
  ];
  const defaultEventImage =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85";

  function getEventList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.events)) return payload.events;
    if (Array.isArray(payload?.data?.events)) return payload.data.events;
    return [];
  }

  function isUpcoming(event) {
    const eventTime = new Date(event.event_date).getTime();
    if (!Number.isFinite(eventTime)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventTime >= today.getTime();
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date to be announced";
    return new Intl.DateTimeFormat("en-SG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
    }).format(date);
  }

  function formatPrice(event) {
    const fee = Number(
      event.effective_non_member_fee ?? event.non_member_fee ?? 0,
    );
    if (event.is_free_for_me || fee <= 0) return "Free";
    return `${event.currency || "SGD"} ${Math.round(fee)}`;
  }

  function formatSpots(event) {
    const spots = Number(event.spots_left);
    if (!Number.isFinite(spots)) return null;
    return spots === 1 ? "1 spot left" : `${spots} spots left`;
  }

  function makePill(text) {
    if (!text) return null;
    const pill = document.createElement("span");
    pill.className = "card-pill";
    pill.textContent = text;
    return pill;
  }

  const APP_STORE_SVG = `<svg viewBox="-1 -2 26 28" fill="currentColor"><path d="M16.2 1.9c.1 1.1-.3 2.2-1 3-1 1.1-2.3 1.8-3.5 1.7-.1-1.1.4-2.2 1.1-3 1-1.1 2.4-1.8 3.4-1.7Zm3.7 16.8c-.6 1-1 1.5-1.8 2.4-1.1 1.2-2.6 2.7-4.5 2.7-1.7 0-2.1-.9-4.4-.9s-2.8.9-4.4 1c-1.8.1-3.1-1.3-4.2-2.5-2.3-2.5-4-7.2-1.7-10.4 1.1-1.6 3.1-2.6 5.3-2.6 1.7 0 3.2 1 4.3 1s2.9-1.2 4.9-1c.8 0 3.2.3 4.7 2.5-.1.1-2.8 1.6-2.8 4.9.1 3.9 3.5 5.2 3.6 5.2-.1.2-.4 1.1-1 2Z"/></svg>`;
  const GOOGLE_PLAY_SVG = `<svg viewBox="0 0 24 24"><path fill="#34A853" d="M3.6 2.4 14.7 12 3.6 21.6V2.4Z"/><path fill="#FBBC04" d="m14.7 12 3.1-2.7 3.7 2.1c.7.4.7 1.5 0 1.9l-3.7 2.1-3.1-3.4Z"/><path fill="#4285F4" d="m3.6 2.4 14.2 6.9-3.1 2.7L3.6 2.4Z"/><path fill="#EA4335" d="m3.6 21.6 11.1-9.6 3.1 3.4-14.2 6.2Z"/></svg>`;
  const FORM_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;

  function createActionButton(href, label, svg, className) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = className;
    a.innerHTML = svg + `<span>${label}</span>`;
    return a;
  }

  function createCardActions() {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const formLabel = document.createElement("p");
    formLabel.className = "card-actions-label card-actions-label-apply";
    formLabel.textContent = "Interested? Apply to join Le Destin";

    const formBtn = createActionButton(
      LE_DESTIN_FORM_URL,
      "Apply to join",
      FORM_SVG,
      "form-btn",
    );

    const bookLabel = document.createElement("p");
    bookLabel.className = "card-actions-label card-actions-label-book";
    bookLabel.textContent = "Book your slot via the Le Meow app";

    const storeBtns = document.createElement("div");
    storeBtns.className = "store-btns";
    storeBtns.append(
      createActionButton(
        APP_STORE_URL,
        "App Store",
        APP_STORE_SVG,
        "store-btn",
      ),
      createActionButton(
        GOOGLE_PLAY_URL,
        "Google Play",
        GOOGLE_PLAY_SVG,
        "store-btn",
      ),
    );

    actions.append(formLabel, formBtn, bookLabel, storeBtns);
    return actions;
  }

  function fallbackImageForEvent(event) {
    const haystack = [event.title, event.description, event.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      eventFallbackImages.find(({ keywords }) =>
        keywords.some((keyword) => haystack.includes(keyword)),
      )?.image || defaultEventImage
    );
  }

  function renderEvents(events) {
    const upcoming = events
      .filter(isUpcoming)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 5);

    if (!eventsGrid || upcoming.length === 0) return;

    eventsGrid.textContent = "";
    eventsGrid.dataset.fallback = "false";

    upcoming.forEach((event) => {
      const article = document.createElement("article");
      article.className = "card";

      const image = document.createElement("div");
      image.className = "card-img";
      image.style.backgroundImage = `url("${event.image_url || fallbackImageForEvent(event)}")`;

      const body = document.createElement("div");
      body.className = "card-body";

      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = formatDate(event.event_date);

      const title = document.createElement("h3");
      title.textContent = event.title || "Le Destin singles event";

      const description = document.createElement("p");
      description.textContent =
        event.description ||
        "A curated Le Destin gathering for easy conversation and real connection.";

      const meta = document.createElement("div");
      meta.className = "card-meta";
      [
        event.location || event.venue?.name,
        formatSpots(event),
        formatPrice(event),
      ]
        .map(makePill)
        .filter(Boolean)
        .forEach((pill) => meta.append(pill));

      body.append(tag, title, description, meta);
      article.append(image, body);
      article.append(createCardActions());
      eventsGrid.append(article);
    });
  }

  async function loadEvents() {
    if (!eventsGrid) return;
    try {
      const response = await fetch(EVENTS_ENDPOINT, {
        headers: {
          "X-Le-Destin-Secret": LE_DESTIN_SECRET,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      renderEvents(getEventList(await response.json()));
    } catch (error) {
      console.warn("Unable to load Le Destin events", error);
    }
  }

  loadEvents();
})();
