const API_BASE_URL = "https://ai-agents-marketplace-8z50.onrender.com/api/agents";

export const getAgents = async () => {
  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const result = await response.json();

    // Support both direct array response and wrapped object response.
    if (Array.isArray(result)) {
      return result;
    }

    return result.data || [];
  } catch (error) {
    console.error("Error fetching agents:", error.message);
    throw error;
  }
};

export const getAgentById = async (agentId) => {
  try {
    const response = await fetch(API_BASE_URL + "/" + agentId);

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching agent details:", error.message);
    throw error;
  }
};

export const createAgent = async (agentData) => {
  try {
    const response = await fetch(API_BASE_URL + "/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create agent");
    }

    return result;
  } catch (error) {
    console.error("Error creating agent:", error.message);
    throw error;
  }
};

export const updateAgentRating = async (agentId, rating) => {
  try {
    const response = await fetch(API_BASE_URL + "/" + agentId + "/rating", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update rating");
    }

    return result;
  } catch (error) {
    console.error("Error updating rating:", error.message);
    throw error;
  }
};