import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { createAgent, getAgentById, getAgents, updateAgentRating } from "./api";
import "./App.css";

const STAR_VALUES = [1, 2, 3, 4, 5];
const FAVORITES_STORAGE_KEY = "favoriteAgentIds";
const THEME_STORAGE_KEY = "themePreference";

const getInitialTheme = () => {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (error) {
    console.error("Failed to read theme preference:", error.message);
  }

  return "light";
};

const getStars = (ratingValue) => {
  const roundedRating = Math.round(Number(ratingValue || 0));
  return "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);
};

function MarketplacePage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeView, setActiveView] = useState("all");
  const [favoriteAgentIds, setFavoriteAgentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({
    text: "",
    type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingRatingId, setUpdatingRatingId] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    category: "",
    rating: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    rating: "5",
  });

  const validateForm = (data) => {
    const errors = {
      name: "",
      description: "",
      category: "",
      rating: "",
    };

    if (!data.name) {
      errors.name = "Name is required.";
    }

    if (!data.description || data.description.length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (!data.category) {
      errors.category = "Category is required.";
    }

    const parsedRating = Number(data.rating);
    if (!data.rating || Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      errors.rating = "Rating must be between 1 and 5.";
    }

    return errors;
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAgents();
      setAgents(data);
    } catch (fetchError) {
      const errorText = fetchError.message || "Could not load agents. Please try again.";
      setError(errorText);
      setToast({ text: errorText, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast.text) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToast({ text: "", type: "" });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

      if (!storedFavorites) {
        return;
      }

      const parsedFavorites = JSON.parse(storedFavorites);
      if (Array.isArray(parsedFavorites)) {
        setFavoriteAgentIds(parsedFavorites);
      }
    } catch (storageError) {
      console.error("Failed to load favorites:", storageError.message);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteAgentIds));
    } catch (storageError) {
      console.error("Failed to save favorites:", storageError.message);
    }
  }, [favoriteAgentIds]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleFormRatingClick = (ratingValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rating: String(ratingValue),
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      rating: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const newAgentPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      rating: Number(formData.rating),
    };

    const validationErrors = validateForm(newAgentPayload);
    const hasValidationErrors = Object.values(validationErrors).some(
      (fieldError) => fieldError.length > 0
    );

    if (hasValidationErrors) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({
      name: "",
      description: "",
      category: "",
      rating: "",
    });

    const optimisticAgentId = "temp-" + Date.now();
    const optimisticAgent = {
      _id: optimisticAgentId,
      ...newAgentPayload,
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      setAgents((prevAgents) => [optimisticAgent, ...prevAgents]);

      setFormData({
        name: "",
        description: "",
        category: "",
        rating: "5",
      });

      const createdResponse = await createAgent(newAgentPayload);

      if (createdResponse && createdResponse.data) {
        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            agent._id === optimisticAgentId ? createdResponse.data : agent
          )
        );
      }

      setMessage("Agent created successfully.");
      setToast({ text: "Agent created", type: "success" });
    } catch (submitError) {
      setAgents((prevAgents) =>
        prevAgents.filter((agent) => agent._id !== optimisticAgentId)
      );
      const errorText = submitError.message || "Could not create agent. Please try again.";
      setError(errorText);
      setToast({ text: errorText, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAgentRatingClick = async (agentId, newRating) => {
    if (!agentId || String(agentId).startsWith("temp-")) {
      return;
    }

    const previousAgent = agents.find((agent) => agent._id === agentId);
    if (!previousAgent) {
      return;
    }

    setUpdatingRatingId(agentId);
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent._id === agentId ? { ...agent, rating: newRating } : agent
      )
    );

    try {
      const response = await updateAgentRating(agentId, newRating);

      if (response && response.data) {
        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            agent._id === agentId ? response.data : agent
          )
        );
      }
    } catch (ratingError) {
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === agentId ? previousAgent : agent
        )
      );
      setToast({
        text: ratingError.message || "Could not update rating",
        type: "error",
      });
    } finally {
      setUpdatingRatingId("");
    }
  };

  const toggleFavorite = (agentId) => {
    setFavoriteAgentIds((prevFavorites) => {
      if (prevFavorites.includes(agentId)) {
        return prevFavorites.filter((id) => id !== agentId);
      }

      return [...prevFavorites, agentId];
    });
  };

  const categoryOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          agents
            .map((agent) => (agent.category || "").trim())
            .filter((category) => category.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [agents]
  );

  const filteredAgents = useMemo(
    () =>
      agents.filter((agent) => {
        const agentName = (agent.name || "").toLowerCase();
        const matchesName = agentName.includes(debouncedSearchQuery);

        const agentCategory = (agent.category || "").trim();
        const matchesCategory =
          selectedCategory === "All" || agentCategory === selectedCategory;

        return matchesName && matchesCategory;
      }),
    [agents, debouncedSearchQuery, selectedCategory]
  );

  const averageRating = useMemo(() => {
    if (agents.length === 0) {
      return "0.0";
    }

    return (
      agents.reduce((sum, agent) => sum + Number(agent.rating || 0), 0) / agents.length
    ).toFixed(1);
  }, [agents]);

  const roundedAverageRating = useMemo(
    () => Math.round(Number(averageRating)),
    [averageRating]
  );

  const goToAgentDetails = (agentId) => {
    if (!agentId || String(agentId).startsWith("temp-")) {
      return;
    }

    navigate("/agent/" + agentId);
  };

  const favoriteIdSet = useMemo(() => new Set(favoriteAgentIds), [favoriteAgentIds]);

  const visibleAgents = useMemo(() => {
    if (activeView === "favorites") {
      return filteredAgents.filter((agent) => favoriteIdSet.has(agent._id));
    }

    return filteredAgents;
  }, [activeView, filteredAgents, favoriteIdSet]);

  const favoriteCount = useMemo(
    () => agents.filter((agent) => favoriteIdSet.has(agent._id)).length,
    [agents, favoriteIdSet]
  );

  return (
    <main className="app-container">
      {toast.text && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      )}

      <nav className="top-nav">
        <div className="nav-brand">AI Agents Marketplace</div>
        <div className="nav-actions">
          <button type="button" className="theme-toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="nav-chip">SaaS Demo</div>
        </div>
      </nav>

      <div className="page-content">
        <header className="page-header">
          <h1>AI Agents Marketplace</h1>
          <p className="page-subtitle">Discover, compare, and showcase practical AI agents.</p>
          <p className="avg-rating" aria-label={"Average rating is " + averageRating + " out of 5"}>
            {getStars(roundedAverageRating)} {averageRating} / 5
          </p>
        </header>

        <section className="view-tabs" aria-label="Agent views">
          <button
            type="button"
            className={"tab-btn " + (activeView === "all" ? "active" : "")}
            onClick={() => setActiveView("all")}
          >
            All Agents
          </button>
          <button
            type="button"
            className={"tab-btn " + (activeView === "favorites" ? "active" : "")}
            onClick={() => setActiveView("favorites")}
          >
            Favorites ({favoriteCount})
          </button>
        </section>

        <section className="form-section">
          <h2>Add New Agent</h2>
          <form className="agent-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Code Reviewer Bot"
            className={formErrors.name ? "input-error" : ""}
          />
          {formErrors.name && <p className="field-error">{formErrors.name}</p>}

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="What does this agent do?"
            className={formErrors.description ? "input-error" : ""}
          />
          {formErrors.description && (
            <p className="field-error">{formErrors.description}</p>
          )}

          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="e.g. Productivity"
            className={formErrors.category ? "input-error" : ""}
          />
          {formErrors.category && (
            <p className="field-error">{formErrors.category}</p>
          )}

          <label htmlFor="rating">Rating (1 to 5)</label>
          <div className="star-picker" role="radiogroup" aria-label="Select rating">
            {STAR_VALUES.map((star) => (
              <button
                key={star}
                type="button"
                className={
                  "star-btn " +
                  (Number(formData.rating) >= star ? "active" : "") +
                  (formErrors.rating ? " input-error" : "")
                }
                onClick={() => handleFormRatingClick(star)}
                aria-label={"Set rating to " + star}
                aria-checked={Number(formData.rating) === star}
              >
                ★
              </button>
            ))}
          </div>
          {formErrors.rating && <p className="field-error">{formErrors.rating}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Create Agent"}
            </button>
          </form>
        </section>

        {message && <p className="status-text success-text">{message}</p>}

        <section className="search-section">
          <div className="search-controls">
            <div>
              <label htmlFor="search">Search Agents by Name</label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Type a name to filter..."
                className="search-input"
              />
            </div>

            <div>
              <label htmlFor="categoryFilter">Filter by Category</label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="search-input"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading && (
          <div className="loading-wrap" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true"></span>
            <p className="status-text">Loading agents...</p>
          </div>
        )}

        {!loading && error && <p className="status-text error-text">{error}</p>}

        {!loading && !error && agents.length === 0 && (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-illustration" aria-hidden="true">🤖</div>
            <p className="status-text empty-title">No agents yet — create one!</p>
          </div>
        )}

        {!loading && !error && agents.length > 0 && visibleAgents.length === 0 && (
          <p className="status-text">
            {activeView === "favorites" ? "No favorites yet" : "No results found"}
          </p>
        )}

        {!loading && !error && visibleAgents.length > 0 && (
          <section className="agent-list">
            {visibleAgents.map((agent) => (
              <article
                className="agent-card clickable-card"
                key={agent._id || agent.name}
                role="button"
                tabIndex={0}
                onClick={() => goToAgentDetails(agent._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToAgentDetails(agent._id);
                  }
                }}
              >
                <div className="card-head">
                  <h2 className="agent-name">{agent.name}</h2>
                  <button
                    type="button"
                    className={
                      "favorite-btn " +
                      (favoriteIdSet.has(agent._id) ? "active" : "")
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(agent._id);
                    }}
                    aria-label={
                      (favoriteIdSet.has(agent._id) ? "Remove " : "Add ") +
                      agent.name +
                      " favorite"
                    }
                  >
                    {favoriteIdSet.has(agent._id) ? "♥" : "♡"}
                  </button>
                </div>
                <p className="agent-description">
                  {agent.description || "No description provided."}
                </p>
                <div className="card-footer">
                  <span className="category-badge">{agent.category || "Uncategorized"}</span>
                  <div className="agent-rating" aria-label={"Rating: " + Number(agent.rating || 0)}>
                    {STAR_VALUES.map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          "star-btn compact " + (Number(agent.rating) >= star ? "active" : "")
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAgentRatingClick(agent._id, star);
                        }}
                        disabled={updatingRatingId === agent._id}
                        aria-label={"Rate " + agent.name + " " + star + " stars"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function AgentDetailsPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAgentById(id);
        setAgent(data);
      } catch (fetchError) {
        setError(fetchError.message || "Could not load agent details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  return (
    <main className="app-container">
      <nav className="top-nav">
        <div className="nav-brand">AI Agents Marketplace</div>
        <div className="nav-actions">
          <button type="button" className="theme-toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="nav-chip">Agent Details</div>
        </div>
      </nav>

      <div className="page-content">
        <section className="details-shell">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {loading && (
            <div className="loading-wrap" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true"></span>
              <p className="status-text">Loading agent details...</p>
            </div>
          )}

          {!loading && error && <p className="status-text error-text">{error}</p>}

          {!loading && !error && agent && (
            <article className="details-card">
              <h1>{agent.name}</h1>
              <p className="details-description">{agent.description || "No description provided."}</p>

              <div className="details-row">
                <span className="details-label">Category</span>
                <span className="category-badge">{agent.category || "Uncategorized"}</span>
              </div>

              <div className="details-row">
                <span className="details-label">Rating</span>
                <span className="details-rating">
                  {getStars(agent.rating)} ({Number(agent.rating || 0).toFixed(1)} / 5)
                </span>
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme preference:", error.message);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MarketplacePage theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/agent/:id"
          element={<AgentDetailsPage theme={theme} onToggleTheme={toggleTheme} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
