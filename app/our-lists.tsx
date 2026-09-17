"use client";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  BookOpen,
  Compass,
  Mountain,
  House,
  Utensils,
  Wine,
  Dumbbell,
  Camera,
  Heart,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Search,
  X,
  Check,
  MapPin,
  Bookmark,
  Wallet,
  Calendar,
  Download,
  Feather,
  Inbox,
  Menu,
  Mail,
  ImagePlus,
  Flag,
  ChevronRight,
  LogOut,
} from "lucide-react";
import type { Store, Item, Category, Visit } from "@/lib/types";
import world from "@/data/world.json";
import states from "@/data/states.json";
import parks from "@/data/parks.json";
const TokenContext = createContext("");
const categoryNames: Record<Category, string> = {
  inbox: "Inspiration inbox",
  hike: "Hike",
  summit: "Colorado 14er",
  stay: "Place to stay",
  recipe: "Recipe",
  wine: "Wine",
  experience: "Experience",
  trip: "Trip / collection",
  goal: "Fitness goal",
  savings: "Savings target",
  memory: "Memory",
};
const categories = Object.keys(categoryNames) as Category[];
const navigation = [
  ["home", "Our Story", BookOpen],
  ["atlas", "Our Atlas", Compass],
  ["trails", "Trails & Summits", Mountain],
  ["stays", "Places to Stay", House],
  ["table", "Our Table", Utensils],
  ["fitness", "Growing Together", Dumbbell],
  ["plans", "Our Plans", Calendar],
  ["savings", "Dream Fund", Wallet],
  ["scrapbook", "The Scrapbook", Camera],
  ["inbox", "Inspiration Inbox", Inbox],
] as const;
const pages: Record<
  string,
  {
    title: string;
    eyebrow: string;
    desc: string;
    cats: Category[];
    add: Category;
  }
> = {
  trails: {
    title: "A little closer to the sky.",
    eyebrow: "TRAILS & SUMMITS",
    desc: "The trails we’ll take. The views we’ll earn. Together.",
    cats: ["hike", "summit"],
    add: "hike",
  },
  stays: {
    title: "Somewhere to stay awhile.",
    eyebrow: "PLACES TO STAY",
    desc: "Little cabins, beautiful hotels, and places worth waking up in.",
    cats: ["stay"],
    add: "stay",
  },
  table: {
    title: "A table set for two.",
    eyebrow: "OUR TABLE",
    desc: "Recipes to make, bottles to open, evenings to remember.",
    cats: ["recipe", "wine"],
    add: "recipe",
  },
  fitness: {
    title: "A little stronger, together.",
    eyebrow: "GROWING TOGETHER",
    desc: "Your own journeys. Each other’s biggest cheerleader.",
    cats: ["goal"],
    add: "goal",
  },
  plans: {
    title: "Let’s make someday happen.",
    eyebrow: "OUR PLANS",
    desc: "Gather the places, little details, and big ideas into a plan.",
    cats: ["trip", "experience"],
    add: "trip",
  },
  savings: {
    title: "For everything ahead.",
    eyebrow: "THE DREAM FUND",
    desc: "A little saved today. A little closer to the next adventure.",
    cats: ["savings"],
    add: "savings",
  },
  scrapbook: {
    title: "Look at all we’ve lived.",
    eyebrow: "THE SCRAPBOOK",
    desc: "Before the vows, after the vows, and all the beautiful in-between.",
    cats: ["memory"],
    add: "memory",
  },
  inbox: {
    title: "“We should do this.”",
    eyebrow: "THE INSPIRATION INBOX",
    desc: "All those little ideas, kept in one place until we make them ours.",
    cats: ["inbox"],
    add: "inbox",
  },
};
function Photo({
  name,
  alt = "",
  className = "",
}: {
  name: string;
  alt?: string;
  className?: string;
}) {
  const token = useContext(TokenContext);
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    let u = "";
    fetch("/api/photos/" + name, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.blob();
      })
      .then((b) => {
        u = URL.createObjectURL(b);
        if (live) setSrc(u);
      })
      .catch(() => {});
    return () => {
      live = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [name, token]);
  return src ? (
    <img className={className} src={src} alt={alt} />
  ) : (
    <div className={"photo-placeholder " + className}>
      <Camera size={24} />
    </div>
  );
}
function Clock({
  wedding,
  large = false,
}: {
  wedding: string;
  large?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const delta =
    (now ?? new Date(wedding).getTime()) - new Date(wedding).getTime();
  const sec = Math.floor(Math.abs(delta) / 1000);
  return (
    <div className={"clock " + (large ? "large" : "")}>
      <div className="eyebrow">
        {delta < 0 ? "UNTIL WE SAY “I DO”" : "MARRIED, AND COUNTING"}
      </div>
      <div className="clock-digits">
        <span className="sign">{delta < 0 ? "−" : "+"}</span>
        {[
          Math.floor(sec / 86400),
          Math.floor(sec / 3600) % 24,
          Math.floor(sec / 60) % 60,
          sec % 60,
        ].map((n, i) => (
          <div key={i}>
            <strong>{now === null ? "—" : String(n).padStart(2, "0")}</strong>
            <span>{["days", "hours", "minutes", "seconds"][i]}</span>
          </div>
        ))}
      </div>
      <p>October 10, 2026 · 4:30 p.m. Central</p>
    </div>
  );
}
function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function OurLists() {
  const [store, setStore] = useState<Store | null>(null),
    [page, setPage] = useState("home"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [person, setPerson] = useState("All"),
    [era, setEra] = useState("All time"),
    [mode, setMode] = useState("local"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [editing, setEditing] = useState<Item | null>(null),
    [clockOpen, setClockOpen] = useState(false),
    [letterOpen, setLetterOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [token, setToken] = useState(""),
    [client, setClient] = useState<SupabaseClient | null>(null),
    [authNeeded, setAuthNeeded] = useState(false),
    [email, setEmail] = useState(""),
    [authMessage, setAuthMessage] = useState(""),
    [gallery, setGallery] = useState(false),
    [quick, setQuick] = useState<Item | null>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/store", {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
      const d = await r.json();
      if (r.status === 401) {
        setAuthNeeded(true);
        return;
      }
      if (!r.ok) throw Error(d.error);
      setStore(d.store);
      setMode(d.mode);
      setAuthNeeded(false);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load your scrapbook.",
      );
    }
  }, [token]);
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => {
        if (c.url && c.key) {
          const s = createClient(c.url, c.key);
          setClient(s);
          s.auth
            .getSession()
            .then(({ data }) => setToken(data.session?.access_token || ""));
          s.auth.onAuthStateChange((_event, session) =>
            setToken(session?.access_token || ""),
          );
        }
      })
      .catch(() => {});
    const hash = location.hash.slice(1);
    if (navigation.some((n) => n[0] === hash)) setPage(hash);
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function go(p: string) {
    setPage(p);
    location.hash = p;
    setQuery("");
    setFilter("All");
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setStore(d.store);
      setToast("Saved to our scrapbook");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function add(category: Category = "inbox") {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      category,
      status: category === "memory" ? "Experienced" : "Someday",
      owner: "Together",
      notes: "",
      logs: [],
    });
  }
  function download() {
    if (!store) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "our-lists-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast(
      "Your lists were exported. Original photos remain in your photo library.",
    );
  }
  if (authNeeded || (!store && error))
    return (
      <main className="welcome">
        <span className="crest">F</span>
        <h1>Our Lists</h1>
        <p>A scrapbook for our Adventures.</p>
        <div className="paper login">
          <h2>Just the two of us.</h2>
          {error && <p role="alert">{error}</p>}
          {client && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { error } = await client.auth.signInWithOtp({
                  email,
                  options: {
                    shouldCreateUser: false,
                    emailRedirectTo: location.origin,
                  },
                });
                setAuthMessage(
                  error?.message ||
                    "Check your email for your private sign-in link.",
                );
              }}
            >
              <label>
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button className="primary">
                Send sign-in link <Mail size={17} />
              </button>
              <p role="status">{authMessage}</p>
            </form>
          )}
        </div>
      </main>
    );
  if (!store)
    return (
      <main className="welcome">
        <span className="crest">F</span>
        <h1>Opening our scrapbook…</h1>
      </main>
    );
  const items = store.items;
  const trails = items.filter((i) => ["hike", "summit"].includes(i.category));
  const miles = trails.reduce(
    (sum, i) => sum + (i.logs?.reduce((s, l) => s + l.value, 0) || 0),
    0,
  );
  const upcoming = items
    .filter((i) => i.status === "Scheduled")
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const p = pages[page];
  let visible = p
    ? items.filter(
        (i) =>
          p.cats.includes(i.category) ||
          (page === "scrapbook" && i.status === "Experienced"),
      )
    : [];
  visible = visible.filter(
    (i) =>
      (filter === "All" || i.status === filter || i.category === filter) &&
      (person === "All" || i.owner === person) &&
      (!query ||
        (i.title + " " + i.notes + " " + i.location)
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (page !== "scrapbook" ||
        era === "All time" ||
        (i.date
          ? (era === "Since our wedding") === i.date >= "2026-10-10"
          : era === "Before our wedding" && i.beforeWedding)),
  );
  return (
    <TokenContext.Provider value={token}>
      <div className="app-shell">
        <aside className={menu ? "sidebar open" : "sidebar"}>
          <button className="brand" onClick={() => go("home")}>
            <span className="crest">F</span>
            <span>
              Our Lists<small>NICHOLAS & MAE FROST</small>
            </span>
          </button>
          <div className="sidebar-rule" />
          <span className="nav-label">THE LIFE WE’RE MAKING</span>
          <nav>
            {navigation.map(([id, label, Icon]) => (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => go(id)}
              >
                <Icon size={19} />
                {label}
                {id === "inbox" && (
                  <span className="nav-count">
                    {items.filter((i) => i.category === "inbox").length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <p className="handwritten">You, me & everywhere.</p>
            <div className="avatars">
              <Photo name="photo-0.jpg" alt="Nicholas and Mae" />
              <span>
                Nicholas & Mae
                <small>
                  {mode === "local"
                    ? "Saved on this computer"
                    : "Our private shared space"}
                </small>
              </span>
            </div>
            <button className="subtle" onClick={download}>
              <Download size={15} /> Export our lists
            </button>
            {client && (
              <button className="subtle" onClick={() => client.auth.signOut()}>
                <LogOut size={15} /> Sign out
              </button>
            )}
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle menu"
            >
              <Menu />
            </button>
            <div className="breadcrumb">
              OUR LISTS <span>/</span>{" "}
              {navigation.find((n) => n[0] === page)?.[1]}
            </div>
            <div className="top-actions">
              <button
                className="wedding-mini"
                onClick={() => setClockOpen(true)}
              >
                <Heart size={15} /> 10.10.2026
              </button>
              <button
                className="primary"
                onClick={() =>
                  setQuick({
                    id: crypto.randomUUID(),
                    title: "",
                    category: p?.add || "inbox",
                    status: "Someday",
                    owner: "Together",
                    notes: "",
                  })
                }
              >
                <Plus size={17} /> Save an idea
              </button>
            </div>
          </header>
          {error && (
            <div role="alert" className="error-banner">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          <main className="content">
            {page === "home" ? (
              <>
                <div className="section-top">
                  <span className="eyebrow">THE FROSTS · OUR NEXT CHAPTER</span>
                  <button
                    className="text-button"
                    onClick={() => setLetterOpen(true)}
                  >
                    <Mail size={16} /> A little note for Mae
                  </button>
                </div>
                <section className="home-hero">
                  <div className="hero-copy">
                    <span className="tiny-ornament">EST. TOGETHER</span>
                    <h1>
                      A lifetime of
                      <br />
                      <em>“remember when.”</em>
                    </h1>
                    <p>
                      A scrapbook for our Adventures.
                      <br />
                      The big dreams. The little things.
                      <br />
                      And everything we’ll do together.
                    </p>
                    <button className="primary" onClick={() => go("plans")}>
                      Let’s make a memory <ArrowRight size={17} />
                    </button>
                    <div className="hero-signature">
                      Nicholas & Mae <Heart size={18} />
                    </div>
                  </div>
                  <div className="hero-photo">
                    <Photo
                      name="photo-1.jpg"
                      alt="Nicholas and Mae’s engagement portrait"
                    />
                    <div className="photo-caption">
                      <span>Our favorite adventure is us.</span>
                      <small>THE BEGINNING OF ALWAYS</small>
                    </div>
                    <span className="photo-stamp">
                      N & M<br />
                      <small>10 · 10 · 26</small>
                    </span>
                  </div>
                </section>
                <section className="chapter-strip">
                  <button
                    className="clock-button"
                    onClick={() => setClockOpen(true)}
                  >
                    <Clock wedding={store.wedding} />
                  </button>
                  <div>
                    <strong>
                      {items.filter((i) => i.status === "Experienced").length}
                    </strong>
                    <span>chapters remembered</span>
                  </div>
                  <div>
                    <strong>
                      {
                        store.visits.filter(
                          (v) => v.status === "Visited" && v.kind === "state",
                        ).length
                      }
                      <em> / 50</em>
                    </strong>
                    <span>states, side by side</span>
                  </div>
                  <div>
                    <strong>{miles.toFixed(1)}</strong>
                    <span>miles walked together</span>
                  </div>
                </section>
                <div className="heading-row">
                  <div>
                    <span className="eyebrow">ROOM FOR ALL OUR SOMEDAYS</span>
                    <h2>Where shall we go next?</h2>
                  </div>
                  <button className="text-button" onClick={() => go("atlas")}>
                    Open our atlas <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="collection-grid">
                  <button
                    className="collection-card"
                    onClick={() => go("trails")}
                  >
                    <Photo
                      name="photo-14.jpg"
                      alt="Nicholas and Mae on a mountain"
                    />
                    <div>
                      <small>THE GREAT OUTDOORS</small>
                      <h3>Higher together.</h3>
                      <span>
                        Trails & summits <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </button>
                  <button
                    className="collection-card"
                    onClick={() => go("stays")}
                  >
                    <Photo name="photo-9.jpg" alt="A mountain town adventure" />
                    <div>
                      <small>A ROOM WITH A VIEW</small>
                      <h3>Stay a little longer.</h3>
                      <span>
                        Our places to stay <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </button>
                  <button
                    className="collection-card paper-card"
                    onClick={() => go("table")}
                  >
                    <Utensils size={38} />
                    <small>GOOD FOOD, BETTER COMPANY</small>
                    <h3>
                      Just us,
                      <br />
                      at our table.
                    </h3>
                    <span>
                      Recipes & bottles <ArrowUpRight size={18} />
                    </span>
                  </button>
                </div>
                <div className="home-bottom">
                  <section className="paper">
                    <div className="heading-row">
                      <h2>On the horizon</h2>
                      <Calendar size={20} />
                    </div>
                    {upcoming.length ? (
                      upcoming.slice(0, 3).map((i) => (
                        <button
                          className="list-row"
                          key={i.id}
                          onClick={() => setEditing(i)}
                        >
                          <span>
                            {i.title}
                            <small>{i.date}</small>
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ))
                    ) : (
                      <>
                        <p>Our next adventure is still a blank page.</p>
                        <button
                          className="text-button"
                          onClick={() => add("trip")}
                        >
                          Plan something together <Plus size={17} />
                        </button>
                      </>
                    )}
                  </section>
                  <section className="paper inbox-preview">
                    <Inbox size={27} />
                    <div>
                      <span className="eyebrow">SAVED FOR SOMEDAY</span>
                      <h2>
                        {items.filter((i) => i.category === "inbox").length}{" "}
                        little sparks of inspiration.
                      </h2>
                      <button
                        className="text-button"
                        onClick={() => go("inbox")}
                      >
                        Let’s look through them <ArrowRight size={17} />
                      </button>
                    </div>
                  </section>
                </div>
              </>
            ) : page === "atlas" ? (
              <Atlas store={store} save={save} />
            ) : (
              p && (
                <>
                  <div className="page-intro">
                    <span className="eyebrow">{p.eyebrow}</span>
                    <h1>{p.title}</h1>
                    <p>{p.desc}</p>
                  </div>
                  {page === "fitness" && (
                    <section className="belt-paper paper">
                      <div className="heading-row">
                        <div>
                          <span className="eyebrow">
                            NICHOLAS · BRAZILIAN JIU-JITSU
                          </span>
                          <h2>The journey to black belt.</h2>
                        </div>
                        <span className="pill">
                          {store.belts.filter((b) => b.earned).at(-1)?.name ||
                            "White"}{" "}
                          belt ·{" "}
                          {store.belts.find((b) => !b.earned)?.name ||
                            "your journey continues"}{" "}
                          up next
                        </span>
                      </div>
                      <div className="belts">
                        {store.belts.map((b, i) => (
                          <button
                            key={b.name}
                            disabled={busy}
                            onClick={() =>
                              save({
                                action: "belts",
                                belts: store.belts.map((x, j) =>
                                  j === i
                                    ? {
                                        ...x,
                                        earned: !x.earned,
                                        date: !x.earned
                                          ? new Date()
                                              .toISOString()
                                              .slice(0, 10)
                                          : undefined,
                                      }
                                    : x,
                                ),
                              })
                            }
                            aria-pressed={b.earned}
                          >
                            <span
                              className={"belt belt-" + b.name.toLowerCase()}
                            >
                              {b.earned && <Check size={20} />}
                            </span>
                            <strong>{b.name}</strong>
                            <small>
                              {b.earned ? b.date || "Earned" : "Still ahead"}
                            </small>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  {page === "trails" && (
                    <div className="summary-bar">
                      <span>
                        <Mountain />{" "}
                        {
                          trails.filter(
                            (i) =>
                              i.category === "summit" &&
                              i.status === "Experienced",
                          ).length
                        }{" "}
                        summits together
                      </span>
                      <span>{miles.toFixed(1)} miles logged</span>
                      <span>Every trail has a story.</span>
                    </div>
                  )}
                  {page === "savings" && (
                    <div className="summary-bar">
                      <span>
                        <Wallet /> $
                        {items
                          .filter((i) => i.category === "savings")
                          .reduce((s, i) => s + (i.current || 0), 0)
                          .toLocaleString()}{" "}
                        saved
                      </span>
                      <span>Dreams at your own pace.</span>
                    </div>
                  )}
                  {page === "scrapbook" && (
                    <>
                      <div className="scrapbook-banner">
                        <Photo
                          name="photo-22.jpg"
                          alt="Nicholas and Mae engagement photograph"
                        />
                        <div>
                          <span className="eyebrow">
                            THESE ARE THE GOOD OLD DAYS
                          </span>
                          <h2>
                            Every place.
                            <br />
                            Every version of us.
                          </h2>
                          <button
                            className="text-button"
                            onClick={() => setGallery(!gallery)}
                          >
                            {gallery
                              ? "Close photo collection"
                              : "Open our photo collection"}{" "}
                            <Camera size={18} />
                          </button>
                        </div>
                      </div>
                      {gallery && (
                        <div className="photo-gallery">
                          {Array.from({ length: 24 }, (_, i) => (
                            <button
                              key={i}
                              aria-label={
                                "Add photo " + (i + 1) + " to a memory"
                              }
                              onClick={() =>
                                setEditing({
                                  id: crypto.randomUUID(),
                                  title: "",
                                  category: "memory",
                                  owner: "Together",
                                  status: "Experienced",
                                  notes: "",
                                  photo: "photo-" + i + ".jpg",
                                })
                              }
                            >
                              <Photo
                                name={"photo-" + i + ".jpg"}
                                alt={"Nicholas and Mae, photo " + (i + 1)}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="toolbar">
                    <label className="search">
                      <Search size={17} />
                      <input
                        aria-label="Search our lists"
                        placeholder="Find a little something…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filter by status"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option>All</option>
                      {["Someday", "Planning", "Scheduled", "Experienced"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                      {p.cats.length > 1 &&
                        p.cats.map((c) => (
                          <option key={c} value={c}>
                            {categoryNames[c]}
                          </option>
                        ))}
                    </select>
                    {page === "fitness" && (
                      <select
                        aria-label="Whose goals"
                        value={person}
                        onChange={(e) => setPerson(e.target.value)}
                      >
                        <option>All</option>
                        <option>Nicholas</option>
                        <option>Mae</option>
                        <option>Together</option>
                      </select>
                    )}
                    {page === "scrapbook" && (
                      <select
                        aria-label="Memory period"
                        value={era}
                        onChange={(e) => setEra(e.target.value)}
                      >
                        <option>All time</option>
                        <option>Before our wedding</option>
                        <option>Since our wedding</option>
                      </select>
                    )}
                    <button className="text-button" onClick={() => add(p.add)}>
                      <Plus size={17} /> Add{" "}
                      {categoryNames[p.add].toLowerCase()}
                    </button>
                  </div>
                  {page === "inbox" && (
                    <p className="source-note">
                      48 unique Instagram ideas saved. Reviewed captions are
                      filed in their collections; unavailable posts stay here
                      until you give them a name and category.
                    </p>
                  )}
                  <div
                    className={
                      "item-grid " + (page === "inbox" ? "inbox-grid" : "")
                    }
                  >
                    {visible.map((i) => (
                      <ItemCard
                        key={i.id}
                        item={i}
                        onOpen={() => setEditing(i)}
                        onFavorite={() =>
                          save({
                            action: "item",
                            item: { ...i, favorite: !i.favorite },
                          })
                        }
                      />
                    ))}
                  </div>
                  {!visible.length && (
                    <div className="empty paper">
                      <Feather size={35} />
                      <h2>A page waiting to be filled.</h2>
                      <p>
                        {query
                          ? "Try a different search."
                          : page === "savings"
                            ? "Name a dream, set a target, and add to it whenever you can."
                            : "Save something you’d love to do together."}
                      </p>
                      <button className="primary" onClick={() => add(p.add)}>
                        <Plus size={16} /> Add the first one
                      </button>
                    </div>
                  )}
                </>
              )
            )}
            <footer>
              <span>OUR LISTS</span>
              <span>Made of little moments. Kept for a lifetime.</span>
              <Heart size={14} />
            </footer>
          </main>
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={17} />
            {toast}
          </div>
        )}
        {quick && (
          <QuickAdd
            item={quick}
            busy={busy}
            error={error}
            onClose={() => setQuick(null)}
            onDetails={(i) => {
              setQuick(null);
              setEditing(i);
            }}
            onSave={async (i) => {
              if (await save({ action: "item", item: i })) setQuick(null);
            }}
          />
        )}
        {editing && (
          <Editor
            saveError={error}
            item={editing}
            store={store}
            onClose={() => setEditing(null)}
            busy={busy}
            onSave={async (i) => {
              if (await save({ action: "item", item: i })) setEditing(null);
            }}
          />
        )}
        {clockOpen && (
          <Modal
            title="The beginning of always."
            onClose={() => setClockOpen(false)}
          >
            <div className="clock-modal">
              <Photo name="photo-23.jpg" alt="Nicholas and Mae" />
              <Clock wedding={store.wedding} large />
              <p className="handwritten">Nicholas & Mae Frost</p>
            </div>
          </Modal>
        )}
        {letterOpen && (
          <Letter
            text={store.letter}
            onClose={() => setLetterOpen(false)}
            onSave={async (letter) => {
              if (await save({ action: "letter", letter }))
                setLetterOpen(false);
            }}
          />
        )}
      </div>
    </TokenContext.Provider>
  );
}
function ItemCard({
  item: i,
  onOpen,
  onFavorite,
}: {
  item: Item;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  const Icon =
    i.category === "summit" || i.category === "hike"
      ? Mountain
      : i.category === "wine"
        ? Wine
        : i.category === "recipe"
          ? Utensils
          : i.category === "savings"
            ? Wallet
            : i.category === "goal"
              ? Dumbbell
              : i.category === "inbox"
                ? Bookmark
                : Compass;
  const numeric = ["goal", "savings"].includes(i.category);
  return (
    <article className={"item-card " + (numeric ? "numeric-card" : "")}>
      <button
        className="favorite icon-button"
        onClick={onFavorite}
        aria-label={(i.favorite ? "Unfavorite " : "Favorite ") + i.title}
      >
        <Heart size={17} fill={i.favorite ? "currentColor" : "none"} />
      </button>
      <button className="card-main" onClick={onOpen}>
        {i.photo ? (
          <Photo name={i.photo} alt={i.title} className="card-photo" />
        ) : (
          <div className={"card-symbol " + i.category}>
            <Icon size={i.category === "inbox" ? 24 : 36} />
            {i.category === "summit" && (
              <span>COLORADO · 14,000 FT & ABOVE</span>
            )}
          </div>
        )}
        <div className="card-body">
          <span className="eyebrow">
            {categoryNames[i.category]}{" "}
            {i.owner !== "Together" ? "· " + i.owner : ""}
          </span>
          <h3>{i.title}</h3>
          {numeric ? (
            <>
              <div className="goal-numbers">
                {i.category === "savings" ? "$" : ""}
                {i.current ?? 0}
                <small>
                  {" "}
                  / {i.target ?? "—"} {i.unit || ""}
                  {i.estimated ? " · estimated" : ""}
                </small>
              </div>
              <div className="progress">
                <span
                  style={{
                    width:
                      Math.min(
                        100,
                        ((i.current || 0) / (i.target || 1)) * 100,
                      ) + "%",
                  }}
                />
              </div>
            </>
          ) : (
            <p>{i.location || i.notes}</p>
          )}
          <div className="card-meta">
            <span
              className={"pill " + (i.status === "Experienced" ? "done" : "")}
            >
              {i.status === "Experienced" ? <Check size={12} /> : null}
              {i.status}
            </span>
            <small>
              {i.category === "summit" || i.category === "hike"
                ? `${i.distance || "—"} mi · ${i.gain?.toLocaleString() || "—"} ft`
                : i.review || i.date || "For the two of us"}
            </small>
          </div>
        </div>
      </button>
    </article>
  );
}
function Letter({
  text,
  onSave,
  onClose,
}: {
  text: string;
  onSave: (s: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(text);
  return (
    <Modal title="A little note for Mae" onClose={onClose}>
      <p className="handwritten letter-salutation">Dear Mae,</p>
      <label>
        Your words, kept here
        <textarea
          className="letter-text"
          rows={10}
          placeholder="Write the note you’d like Mae to find when she opens your scrapbook…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <p className="handwritten">Love, Nicholas</p>
      <button className="primary" onClick={() => onSave(value)}>
        Keep this note <Heart size={16} />
      </button>
    </Modal>
  );
}
function Editor({
  item,
  store,
  onClose,
  onSave,
  busy,
  saveError,
}: {
  saveError: string;
  item: Item;
  store: Store;
  onClose: () => void;
  onSave: (i: Item) => Promise<void>;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<Item>(structuredClone(item)),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState(""),
    [logValue, setLogValue] = useState(""),
    [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10)),
    [logNote, setLogNote] = useState(""),
    [showPhotos, setShowPhotos] = useState(false);
  const token = useContext(TokenContext);
  const numeric = ["goal", "savings"].includes(draft.category);
  const hiking = ["hike", "summit"].includes(draft.category);
  const set = (key: keyof Item, value: unknown) =>
    setDraft((d) => ({ ...d, [key]: value }));
  async function upload(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const f = new FormData();
      f.append("photo", file);
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: f,
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      set("photo", d.name);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add photo.");
    } finally {
      setUploading(false);
    }
  }
  function appendLog() {
    const n = Number(logValue);
    if (!Number.isFinite(n) || n <= 0) {
      setMessage("Enter a number greater than zero.");
      return;
    }
    const logs = [
      ...(draft.logs || []),
      { date: logDate, value: n, note: logNote },
    ];
    setDraft((d) => ({
      ...d,
      logs,
      ...(numeric
        ? {
            current: d.category === "savings" ? (d.current || 0) + n : n,
            estimated: false,
          }
        : {}),
      ...(hiking ? { status: "Experienced", date: logDate } : {}),
    }));
    setLogValue("");
    setLogNote("");
    setMessage("Entry added. Save this page to keep it.");
  }
  return (
    <Modal
      title={item.title ? "A page in our story" : "A new little someday"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            ...draft,
            review:
              draft.category !== "inbox" && draft.review === "Needs review"
                ? "Organized by us"
                : draft.review,
          });
        }}
      >
        <div className="editor-grid">
          <label className="full">
            What shall we call it?
            <input
              required
              autoFocus
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="A cabin in the mountains, a bottle for our anniversary…"
            />
          </label>
          <label>
            Collection
            <select
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryNames[c]}
                </option>
              ))}
            </select>
          </label>
          <label>
            For whom?
            <select
              value={draft.owner}
              onChange={(e) => set("owner", e.target.value)}
            >
              <option>Together</option>
              <option>Nicholas</option>
              <option>Mae</option>
            </select>
          </label>
          <label>
            Where are we with it?
            <select
              value={draft.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {["Someday", "Planning", "Scheduled", "Experienced"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            {draft.status === "Experienced"
              ? "Date experienced"
              : "Target date"}
            <input
              type="date"
              value={draft.date || ""}
              onChange={(e) => set("date", e.target.value)}
            />
          </label>
          <label className="full">
            {hiking ? "AllTrails or route link" : "Link to the idea"}
            <input
              type="url"
              placeholder="https://…"
              value={draft.url || ""}
              onChange={(e) => set("url", e.target.value)}
            />
            {draft.url && /^https?:\/\//.test(draft.url) && (
              <a
                href={draft.url}
                target="_blank"
                rel="noreferrer"
                className="source-link"
              >
                {hiking ? "Open trail / route map" : "Open original source"}{" "}
                <ArrowUpRight size={14} />
              </a>
            )}
          </label>
          <label>
            Location
            <input
              value={draft.location || ""}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Somewhere special"
            />
          </label>
          <label>
            Budget estimate ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.budget ?? ""}
              onChange={(e) =>
                set(
                  "budget",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          </label>
          <label className="full">
            Why this belongs in our story
            <textarea
              rows={4}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Why you want to go, what to remember, the little details…"
            />
          </label>
          {hiking && (
            <>
              <label>
                Route distance (miles)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.distance ?? ""}
                  onChange={(e) => set("distance", Number(e.target.value))}
                />
              </label>
              <label>
                Elevation gain (feet)
                <input
                  type="number"
                  min="0"
                  value={draft.gain ?? ""}
                  onChange={(e) => set("gain", Number(e.target.value))}
                />
              </label>
            </>
          )}
          {numeric && (
            <>
              <label>
                {draft.category === "savings"
                  ? "Already saved ($)"
                  : "Current best"}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.current ?? ""}
                  onChange={(e) =>
                    set(
                      "current",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </label>
              <label>
                {draft.category === "savings" ? "Savings target ($)" : "Goal"}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.target ?? ""}
                  onChange={(e) =>
                    set(
                      "target",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </label>
              {draft.category === "goal" && (
                <label>
                  Unit
                  <input
                    value={draft.unit || ""}
                    onChange={(e) => set("unit", e.target.value)}
                    placeholder="lb, miles, sessions…"
                  />
                </label>
              )}
              {draft.category === "savings" && draft.target && draft.date && (
                <p className="full savings-plan">
                  {new Date(draft.date).getTime() > Date.now()
                    ? `About $${Math.max(0, Math.ceil(((draft.target || 0) - (draft.current || 0)) / Math.max(1, (new Date(draft.date).getTime() - Date.now()) / 2629800000))).toLocaleString()} per month to reach this dream by ${draft.date}.`
                    : "Choose a future date to see a monthly savings target."}
                </p>
              )}
            </>
          )}
          {draft.category === "recipe" && (
            <>
              <label className="full">
                Ingredients
                <textarea
                  rows={4}
                  value={draft.ingredients || ""}
                  onChange={(e) => set("ingredients", e.target.value)}
                  placeholder="Add your ingredients here, or follow the original recipe link."
                />
              </label>
              <label className="full">
                Our cooking notes
                <textarea
                  rows={4}
                  value={draft.steps || ""}
                  onChange={(e) => set("steps", e.target.value)}
                />
              </label>
            </>
          )}
          <div className="full photo-picker">
            {draft.photo && <Photo name={draft.photo} alt="Selected photo" />}
            <div>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowPhotos(!showPhotos)}
              >
                <Camera size={16} /> Choose from our photos
              </button>
              <label className="upload-label">
                <ImagePlus size={16} />{" "}
                {uploading ? "Adding photo…" : "Upload a new photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  disabled={uploading}
                  onChange={(e) =>
                    e.target.files?.[0] && upload(e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>
          {showPhotos && (
            <div className="full photo-choices">
              {Array.from({ length: 24 }, (_, i) => (
                <button
                  type="button"
                  key={i}
                  aria-label={"Choose photo " + (i + 1)}
                  onClick={() => {
                    set("photo", "photo-" + i + ".jpg");
                    setShowPhotos(false);
                  }}
                >
                  <Photo
                    name={"photo-" + i + ".jpg"}
                    alt={"Photo " + (i + 1)}
                  />
                </button>
              ))}
            </div>
          )}
          <label className="full">
            Connect to another plan, recipe, wine or memory
            <select
              value=""
              onChange={(e) => {
                if (e.target.value)
                  set(
                    "related",
                    Array.from(
                      new Set([...(draft.related || []), e.target.value]),
                    ),
                  );
              }}
            >
              <option value="">Choose a page to connect…</option>
              {store.items
                .filter((i) => i.id !== draft.id)
                .map((i) => (
                  <option value={i.id} key={i.id}>
                    {i.title}
                  </option>
                ))}
            </select>
          </label>
          {!!draft.related?.length && (
            <div className="full connected">
              {draft.related.map((id) => (
                <button
                  type="button"
                  className="pill"
                  key={id}
                  onClick={() =>
                    set(
                      "related",
                      draft.related?.filter((x) => x !== id),
                    )
                  }
                >
                  {store.items.find((i) => i.id === id)?.title} <X size={13} />
                </button>
              ))}
            </div>
          )}
        </div>
        {(numeric || hiking) && (
          <section className="log-section">
            <h3>
              {draft.category === "savings"
                ? "Add a contribution"
                : hiking
                  ? "Log a hike together"
                  : "Record your progress"}
            </h3>
            <p>
              {hiking
                ? "Only logged miles count toward your total. Log each repeat visit here."
                : "Entries are dated so you can see how far you’ve come."}
            </p>
            <div className="log-form">
              <label>
                Date
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </label>
              <label>
                {draft.category === "savings"
                  ? "Contribution ($)"
                  : hiking
                    ? "Miles walked"
                    : "New best (" + (draft.unit || "units") + ")"}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                />
              </label>
              <label className="full">
                A little note
                <input
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                />
              </label>
              <button className="secondary" type="button" onClick={appendLog}>
                <Plus size={15} /> Add entry
              </button>
            </div>
            {draft.logs?.map((l, i) => (
              <div className="log-row" key={i}>
                <span>{l.date}</span>
                <strong>
                  {l.value}{" "}
                  {draft.category === "savings"
                    ? "USD"
                    : hiking
                      ? "mi"
                      : draft.unit}
                </strong>
                <small>{l.note}</small>
              </div>
            ))}
          </section>
        )}
        {message && <p role="status">{message}</p>}
        {saveError && (
          <p role="alert" className="form-error">
            {saveError}
          </p>
        )}
        <div className="modal-footer">
          <span>For all our somedays.</span>
          <button className="primary" disabled={busy || uploading}>
            {busy ? "Saving…" : "Save to our scrapbook"} <Check size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Atlas({
  store,
  save,
}: {
  store: Store;
  save: (b: Record<string, unknown>) => Promise<boolean>;
}) {
  const [view, setView] = useState<"country" | "state" | "park">("state"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Visit | null>(null),
    [hover, setHover] = useState(""),
    [period, setPeriod] = useState("All time");
  const shapes = view === "country" ? world : states;
  const dataset = view === "park" ? parks : shapes;
  const visits = store.visits.filter(
    (v) => period === "All time" || (v.date && v.date >= "2026-10-10"),
  );
  const find = (id: string) => visits.find((v) => v.id === view + "-" + id);
  function choose(id: string, name: string) {
    setSelected(
      store.visits.find((v) => v.id === view + "-" + id) || {
        id: view + "-" + id,
        kind: view,
        name,
        status: "Dreaming",
      },
    );
  }
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">OUR ATLAS</span>
        <h1>The world, with you.</h1>
        <p>
          Places we’ve loved. Places we’re dreaming of. A lifetime to explore.
        </p>
      </div>
      <div className="atlas-toolbar">
        <div className="tabs">
          {(["state", "country", "park"] as const).map((k) => (
            <button
              key={k}
              className={view === k ? "active" : ""}
              onClick={() => {
                setView(k);
                setQuery("");
              }}
            >
              {k === "state"
                ? "United States"
                : k === "country"
                  ? "The World"
                  : "National Parks"}
            </button>
          ))}
        </div>
        <select
          aria-label="Map period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>All time</option>
          <option>Since our wedding</option>
        </select>
      </div>
      <section className="map-paper">
        <div className="map-heading">
          <span className="eyebrow">NICHOLAS & MAE’S FIELD NOTES</span>
          <span>
            {
              visits.filter((v) => v.kind === view && v.status === "Visited")
                .length
            }{" "}
            {view === "state"
              ? "/ 50"
              : view === "park"
                ? "/ " + parks.length
                : ""}{" "}
            visited together
          </span>
        </div>
        {view !== "park" ? (
          <svg
            className="atlas-map"
            viewBox="0 0 960 490"
            role="group"
            aria-label={
              view === "state"
                ? "Interactive United States map"
                : "Interactive world map"
            }
          >
            {shapes.map((s) => (
              <path
                key={s.id}
                d={s.path || ""}
                tabIndex={0}
                role="button"
                aria-label={
                  s.name + ": " + (find(s.id)?.status || "Not marked")
                }
                className={
                  "map-region " +
                  (find(s.id)?.status || "unmarked").toLowerCase()
                }
                onMouseEnter={() => setHover(s.name)}
                onFocus={() => setHover(s.name)}
                onClick={() => choose(s.id, s.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(s.id, s.name);
                  }
                }}
              >
                <title>{s.name}</title>
              </path>
            ))}
          </svg>
        ) : (
          <div className="park-intro">
            <Mountain size={80} strokeWidth={1} />
            <h2>America’s 63 national parks.</h2>
            <p>
              From the first trail to the last sunset. Choose a park below to
              start its page.
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.nps.gov/aboutus/national-park-system.htm"
            >
              Explore the National Park Service <ArrowUpRight size={14} />
            </a>
          </div>
        )}
        <div className="map-legend">
          <span>
            <i className="visited" />
            Visited
          </span>
          <span>
            <i className="planning" />
            Planning
          </span>
          <span>
            <i className="dreaming" />
            Dreaming
          </span>
          <em>{hover || "Choose a place to add your story"}</em>
        </div>
      </section>
      <div className="heading-row">
        <h2>
          {view === "park"
            ? "Our national park checklist"
            : "Every place has a page."}
        </h2>
        <label className="search">
          <Search size={17} />
          <input
            placeholder="Find a place…"
            aria-label="Find a place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="place-grid">
        {dataset
          .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((s) => (
            <button
              className="place-row"
              key={s.id}
              onClick={() => choose(s.id, s.name)}
            >
              <span
                className={
                  "place-check " +
                  (find(s.id)?.status === "Visited" ? "checked" : "")
                }
              >
                {find(s.id)?.status === "Visited" ? (
                  <Check size={15} />
                ) : (
                  <MapPin size={15} />
                )}
              </span>
              <span>
                {s.name.replace(" National Park", "")}
                <small>
                  {find(s.id)?.status || "A page yet to be written"}
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))}
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await save({ action: "visit", visit: selected }))
                setSelected(null);
            }}
          >
            <label>
              Our story here
              <select
                value={selected.status}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    status: e.target.value as Visit["status"],
                  })
                }
              >
                <option>Dreaming</option>
                <option>Planning</option>
                <option>Visited</option>
              </select>
            </label>
            <label>
              Date together
              <input
                type="date"
                value={selected.date || ""}
                onChange={(e) =>
                  setSelected({ ...selected, date: e.target.value })
                }
              />
            </label>
            <label>
              Field notes
              <textarea
                rows={5}
                value={selected.notes || ""}
                onChange={(e) =>
                  setSelected({ ...selected, notes: e.target.value })
                }
                placeholder="What made it special, or what we want to see…"
              />
            </label>
            {view === "park" && (
              <a
                className="source-link"
                href={parks.find((p) => "park-" + p.id === selected.id)?.url}
                target="_blank"
                rel="noreferrer"
              >
                Official park page <ArrowUpRight size={15} />
              </a>
            )}
            <button className="primary">
              Save our place <Check size={16} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function QuickAdd({
  item,
  busy,
  error,
  onSave,
  onDetails,
  onClose,
}: {
  item: Item;
  busy: boolean;
  error: string;
  onSave: (i: Item) => Promise<void>;
  onDetails: (i: Item) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(item);
  return (
    <Modal title="Save a little someday." onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave(draft);
        }}
      >
        <label>
          What caught your eye?
          <input
            autoFocus
            required
            placeholder="An idea for the two of us…"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <label>
          Paste a link (optional)
          <input
            type="url"
            placeholder="Instagram, AllTrails, a hotel, a recipe…"
            value={draft.url || ""}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />
        </label>
        <div className="editor-grid">
          <label>
            Keep it in
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as Category })
              }
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryNames[c]}
                </option>
              ))}
            </select>
          </label>
          <label>
            For whom?
            <select
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            >
              <option>Together</option>
              <option>Nicholas</option>
              <option>Mae</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="text-button"
            onClick={() => onDetails(draft)}
          >
            Add more details <ArrowRight size={15} />
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save idea"} <Bookmark size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
