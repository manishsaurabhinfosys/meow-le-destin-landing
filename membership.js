(() => {
  const MEMBERSHIP_ENDPOINT =
    "https://meow-service-test.flutterclone.com/api/public/le-destin/membership-tiers/list";
  const LE_DESTIN_SECRET =
    "pld_2f7a9c1e6b3d4f8081ac5e9d0b6f7a3c4e2d1b8f9a0c3e5d";
  const membershipTiers = document.getElementById("membershipTiers");
  const preferredOrder = ["Essential", "Standard", "Premium", "Elite"];

  function getTierList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.tiers)) return payload.tiers;
    if (Array.isArray(payload?.data?.tiers)) return payload.data.tiers;
    return [];
  }

  function tierLabel(name) {
    const labels = {
      Essential: "Start thoughtfully",
      Standard: "Build momentum",
      Premium: "Most immersive",
      Elite: "Highly personalised",
    };
    return labels[name] || "Le Destin membership";
  }

  function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "SGD 0";
    return `SGD ${amount.toLocaleString("en-SG", {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function matchLimitText(value) {
    const limit = Number(value);
    if (!Number.isFinite(limit)) return "Daily matches included";
    return limit === 1 ? "1 daily match" : `${limit} daily matches`;
  }

  function bonusCreditsText(value) {
    const credits = Number(value);
    if (!Number.isFinite(credits) || credits <= 0) {
      return "Match Credit eligibility";
    }
    return `${credits} bonus Match Credits`;
  }

  function eventAccessText(hasAccess) {
    return hasAccess ? "Selected event access" : "Curated event invitations";
  }

  function sortTiers(a, b) {
    const orderA = preferredOrder.indexOf(a.name);
    const orderB = preferredOrder.indexOf(b.name);
    if (orderA !== -1 || orderB !== -1) {
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    }
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  }

  function renderTiers(tiers) {
    const activeTiers = tiers.filter((tier) => tier.is_active !== false).sort(sortTiers);
    if (!membershipTiers || activeTiers.length === 0) return;

    membershipTiers.textContent = "";
    membershipTiers.dataset.fallback = "false";

    activeTiers.forEach((tier) => {
      const article = document.createElement("article");
      article.className = `tier ${tier.name === "Premium" ? "featured" : ""}`;

      const label = document.createElement("span");
      label.className = "sub";
      label.textContent = tierLabel(tier.name);

      const title = document.createElement("h3");
      title.textContent = tier.name || "Membership";

      const price = document.createElement("div");
      price.className = "tier-price";
      const monthly = document.createElement("strong");
      monthly.textContent = formatMoney(tier.monthly_price);
      const period = document.createElement("span");
      period.textContent = "/ month";
      price.append(monthly, period);

      const yearly = document.createElement("div");
      yearly.className = "tier-yearly";
      yearly.textContent = `${formatMoney(tier.yearly_price)} yearly`;

      const features = document.createElement("ul");
      [
        matchLimitText(tier.daily_match_limit),
        bonusCreditsText(tier.bonus_match_credits),
        eventAccessText(tier.event_access),
        "Curated member profile",
      ].forEach((item) => {
        const feature = document.createElement("li");
        feature.textContent = item;
        features.append(feature);
      });

      article.append(label, title, price, yearly, features);
      membershipTiers.append(article);
    });
  }

  async function loadMembershipTiers() {
    if (!membershipTiers) return;
    try {
      const response = await fetch(MEMBERSHIP_ENDPOINT, {
        headers: {
          "X-Le-Destin-Secret": LE_DESTIN_SECRET,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      renderTiers(getTierList(await response.json()));
    } catch (error) {
      console.warn("Unable to load Le Destin membership tiers", error);
    }
  }

  loadMembershipTiers();
})();
