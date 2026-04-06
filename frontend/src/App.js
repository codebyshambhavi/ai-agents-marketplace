import { useEffect, useState } from "react";
import { createAgent, getAgents } from "./api";
import "./App.css";

function App() {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
      setError(fetchError.message || "Could not load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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
      await fetchAgents();
    } catch (submitError) {
      setAgents((prevAgents) =>
        prevAgents.filter((agent) => agent._id !== optimisticAgentId)
      );
      setError(submitError.message || "Could not create agent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    "All",
    ...Array.from(
      new Set(
        agents
          .map((agent) => (agent.category || "").trim())
          .filter((category) => category.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredAgents = agents.filter((agent) => {
    const agentName = (agent.name || "").toLowerCase();
    const matchesName = agentName.includes(searchQuery.toLowerCase());

    const agentCategory = (agent.category || "").trim();
    const matchesCategory =
      selectedCategory === "All" || agentCategory === selectedCategory;

    return matchesName && matchesCategory;
  });

  const averageRating =
    agents.length > 0
      ? (
          agents.reduce((sum, agent) => sum + Number(agent.rating || 0), 0) /
          agents.length
        ).toFixed(1)
      : "0.0";

  const getStars = (ratingValue) => {
    const roundedRating = Math.round(Number(ratingValue || 0));
    return "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);
  };

  return (
    <main className="app-container">
      <header className="page-header">
        <h1>AI Agents Marketplace</h1>
        <p className="page-subtitle">Discover, compare, and showcase practical AI agents.</p>
        <p className="avg-rating">Average Rating: {averageRating} / 5</p>
      </header>

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
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            className={formErrors.rating ? "input-error" : ""}
          >
            <option value="">Select rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
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
        <p className="status-text">No agents found</p>
      )}

      {!loading && !error && agents.length > 0 && filteredAgents.length === 0 && (
        <p className="status-text">No results found</p>
      )}

      {!loading && !error && filteredAgents.length > 0 && (
        <section className="agent-list">
          {filteredAgents.map((agent) => (
            <article className="agent-card" key={agent._id || agent.name}>
              <h2 className="agent-name">{agent.name}</h2>
              <p className="agent-description">{agent.description || "No description provided."}</p>
              <div className="card-footer">
                <span className="category-badge">{agent.category || "Uncategorized"}</span>
                <span className="agent-rating" title={"Rating: " + Number(agent.rating || 0)}>
                  {getStars(agent.rating)}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;
