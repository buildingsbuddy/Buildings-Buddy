// Temporary replacement for Base44 client

export const base44 = {
  async get() {
    console.log("GET request (mocked)");
    return [];
  },

  async post(data) {
    console.log("POST request (mocked):", data);
    return data;
  },

  async put(id, data) {
    console.log("PUT request (mocked):", id, data);
    return data;
  },

  async delete(id) {
    console.log("DELETE request (mocked):", id);
    return true;
  }
};
