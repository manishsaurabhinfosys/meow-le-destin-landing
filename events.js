(() => {
  const EVENTS_ENDPOINT =
    "https://meow-service-test.flutterclone.com/api/public/le-destin/singles-events/list?nopaginate=1&status=upcoming";
  const LE_DESTIN_SECRET =
    "pld_2f7a9c1e6b3d4f8081ac5e9d0b6f7a3c4e2d1b8f9a0c3e5d";
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
