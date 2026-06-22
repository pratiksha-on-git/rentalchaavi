import axios from 'axios';

const ensureApiBasePath = (url) => {
  const trimmedUrl = String(url || '').replace(/\/+$/, '');
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

const isBrowserLocalhost = () => {
  if (typeof window === "undefined") return true;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const isLocalBackendUrl = (url) =>
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(String(url || ""));

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl && !(isLocalBackendUrl(configuredUrl) && !isBrowserLocalhost())) {
    return configuredUrl;
  }

  return isBrowserLocalhost()
    ? "http://localhost:8081"
    : "https://r1.rentalchaavi.com";
};

export const API_BASE_URL =
  ensureApiBasePath(
    resolveApiBaseUrl()
  );

export const CHAT_API_BASE_URL =
  ensureApiBasePath(import.meta.env.VITE_CHAT_API_BASE_URL || API_BASE_URL);

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'https://r1.rentalchaavi.com';
  }
})();

export const STATIC_BASE_URL =
  import.meta.env.VITE_STATIC_BASE_URL?.replace(/\/+$/, '') || API_ORIGIN;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const uploadApi = axios.create({
  baseURL: API_BASE_URL,
});

const chatRequestApi = axios.create({
  baseURL: CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const rootApi = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
});

const resolveAuthTokenForPath = (path = "") => {
  if (path.startsWith("/auth/") && !path.endsWith("/logout")) return null;
  if (path.startsWith("/owner/")) return localStorage.getItem("ownerToken");
  if (path.startsWith("/admin/")) return localStorage.getItem("adminToken");
  if (path.startsWith("/user/")) return localStorage.getItem("userToken");

  const adminToken = localStorage.getItem("adminToken");
  const ownerToken = localStorage.getItem("ownerToken");
  const userToken = localStorage.getItem("userToken");
  return adminToken || ownerToken || userToken || null;
};

const attachAuthHeader = (config) => {
  if (config?.headers?.Authorization) {
    return config;
  }
  const path = config?.url || "";
  const token = resolveAuthTokenForPath(path);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuthHeader);
uploadApi.interceptors.request.use(attachAuthHeader);
chatRequestApi.interceptors.request.use(attachAuthHeader);
rootApi.interceptors.request.use(attachAuthHeader);

const normalizeApiResponse = (response) => {
  const apiStatus = response?.data?.status;
  if (typeof apiStatus === "number" && apiStatus >= 400) {
    const error = new Error(response?.data?.message || "Request failed");
    error.response = response;
    throw error;
  }
  return response;
};

api.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

uploadApi.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

chatRequestApi.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

rootApi.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

const authConfigFor = (tokenKey) => {
  const tokenKeys = Array.isArray(tokenKey) ? tokenKey : [tokenKey];
  const token = tokenKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

const ownerAuthConfig = () => authConfigFor(["ownerToken", "token"]);

// Admin API calls
export const adminApi = {
  // Add property by owner
  addProperty: (ownerId, propertyData) => {
    return api.post(`/admin/addPropertyByOwner/${ownerId}`, propertyData);
  },

  // Get properties by owner (served on root /admin controller)
  getOwnerProperties: (ownerId) => {
    return rootApi.get(`/admin/owner/${ownerId}/properties`);
  },

  // Get property by ID
  getPropertyById: (id) => {
    return api.get(`/admin/getPropertyById/${id}`);
  },

  // Update property
  updateProperty: (id, propertyData) => {
    return api.put(`/admin/updatePropertyById/${id}`, propertyData);
  },

  // Delete property
  deleteProperty: (id) => {
    return api.delete(`/admin/deletePropertyById/${id}`);
  },

  // Upload property images
  uploadPropertyImages: (propertyId, formData) => {
    return uploadApi.post(`/admin/uploadPropertyImagesByPropertyId/${propertyId}`, formData);
  },

  // Buy premium
  buyPremium: (ownerId) => {
    return api.post(`/admin/buyPremiumByOwner/${ownerId}`);
  },
};

// Owner API calls (aligned with backend /api/owner controller)
export const ownerApi = {
  getAreasByCity: (city) =>
    api.get(`/owner/getAreasByCity/${encodeURIComponent(city)}`),
  getPincode: (city, area) =>
    api.get("/owner/getPincode", { params: { city, area } }),
  addProperty: (ownerId, propertyData) =>
    api.post(`/owner/addPropertyByOwner/${ownerId}`, propertyData, ownerAuthConfig()),
  getOwnerProperties: (ownerId) =>
    api.get(`/owner/getAllPropertiesByOwnerId/${ownerId}`, ownerAuthConfig()),
  getPropertyById: (id) => api.get(`/owner/getPropertyById/${id}`, ownerAuthConfig()),
  updateProperty: (id, propertyData) =>
    api.put(`/owner/updatePropertyById/${id}`, propertyData, ownerAuthConfig()),
  deleteProperty: (id) => api.delete(`/owner/deletePropertyById/${id}`, ownerAuthConfig()),
  uploadPropertyImages: (propertyId, formData) =>
    uploadApi.post(`/owner/uploadPropertyImagesByPropertyId/${propertyId}`, formData, ownerAuthConfig()),
  buyPremium: (ownerId, propertyId) =>
    api.post(`/owner/buyPremiumByOwner/${ownerId}`, null, {
      params: propertyId ? { propertyId } : {},
      ...ownerAuthConfig(),
    }),
  confirmPropertyPayment: (orderId, transactionId) =>
    api.post("/owner/property-payment-success", null, {
      params: { orderId, transactionId },
      ...authConfigFor("ownerToken"),
    }),
  saveFacilities: (ownerId, propertyId, facilities) =>
    api.post(`/owner/save-facilities`, { ownerId, propertyId, facilities }, ownerAuthConfig()),
  getFacilities: (ownerId, propertyId) =>
    api.get("/owner/get-facilities", {
      params: { ownerId, propertyId },
      ...ownerAuthConfig(),
    }),
};

export const propertyApi = {
  getAll: () => {
    const token = localStorage.getItem("userToken");

    let userId = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id; 
      } catch {
}
    }
return api.get(`/user/properties/${userId}`); // ✅ fixed
  },



 filter: (filterData, userId) => {
  if (!userId) {
return Promise.reject("UserId missing");
  }
return api.post(`/user/filter-properties/${userId}`, filterData);
},

  getById: (id) => {
  return api.get(`/owner/getPropertyById/${id}`);
  
},
  getNearbyProperties: (propertyId) => {
    return api.get(`/user/nearby-properties`, {
      params: { propertyId },
    });
  },

  toggleLikeProperty: (propertyId) =>
    api.post(`/user/likeProperty/${propertyId}`),

  getLikedProperties: () => api.get("/user/likedProperties"),

  getLikedPropertiesCount: () => api.get("/user/likedPropertiesCount"),

};
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  registerUser: (data) => api.post("/auth/register/user", data),
  registerAdmin: (data) => api.post("/auth/register/admin", data),
  registerOwner: (data) => api.post("/auth/register/POwner", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  sendRegisterOtp: (data) =>
    api.post("/auth/send-email-otp", data),
  verifyRegisterOtp: (data) =>
    api.post("/auth/verify-email-otp", data),
  logout: () => api.post("/auth/logout"),
};

export const userApi = {
  getProfile: (userId) => api.get(`/user/${userId}`),
  getProperties: (userId) => api.get(`/user/properties/${userId}`),
  filterProperties: (userId, filterData) => api.post(`/user/filter-properties/${userId}`, filterData),
};

const adminRootRequest = (path, method = "get", data) => {
  const rootPath = path.startsWith("/admin/") ? path : `/admin${path}`;
  if (method === "get") return rootApi.get(rootPath);
  return rootApi.post(rootPath, data);
};

export const adminModerationApi = {
  getPendingUsers: () => adminRootRequest("/pending-users"),
  getPendingOwners: () => adminRootRequest("/pending-owner"),
  getPendingPremiumProperties: () => rootApi.get("/admin/premium/pending"),
  approveUserPremium: (userId) =>
    adminRootRequest(`/approveUserPremium/${userId}`, "post"),
  rejectUserPremium: (userId) =>
    adminRootRequest(`/rejectUserPremium/${userId}`, "post"),
  approveOwnerPremium: (ownerId) =>
    adminRootRequest(`/approveOwnerPremium/${ownerId}`, "post"),
  rejectOwnerPremium: (ownerId) =>
    adminRootRequest(`/rejectOwnerPremium/${ownerId}`, "post"),
  getOwnerProperties: (ownerId) => rootApi.get(`/admin/owner/${ownerId}/properties`),
  getPropertyById: (propertyId) => api.get(`/admin/getPropertyById/${propertyId}`),
  approveProperty: (propertyId) =>
    rootApi.post(`/admin/approveProperty/${propertyId}`),
  rejectProperty: (propertyId) =>
    rootApi.post(`/admin/rejectProperty/${propertyId}`),
};

export const paymentApi = {
  buyUserPremium: (userId) =>
    api.post(`/user/buyPremium/${userId}`, {}, authConfigFor("userToken")),
  confirmUserPremiumPayment: (orderId, transactionId) =>
    api.post("/user/payment-success", null, {
      params: { orderId, transactionId },
      ...authConfigFor("userToken"),
    }),
  buyPropertyPremium: (propertyId) =>
    rootApi.post(`/premium/buy/${propertyId}`, {}, ownerAuthConfig()),
  getPropertyPremiumStatus: (propertyId) =>
    rootApi.get(`/premium/status/${propertyId}`, ownerAuthConfig()),
  mockPropertyPremiumCallback: ({ orderId, transactionId, status = "SUCCESS" }) =>
    rootApi.post("/premium/callback", { orderId, transactionId, status }, { skipAuth: true }),
  approvePropertyPremium: (propertyId) =>
    rootApi.put(`/admin/premium/approve/${propertyId}`, null, authConfigFor("adminToken")),
};

export const chatApi = {
  sendMessage: (payload) => chatRequestApi.post("/chat/send", payload),
  acceptChat: (payload) => chatRequestApi.post("/chat/accept", payload),
  rejectChat: (payload) => chatRequestApi.post("/chat/reject", payload),
  sendTyping: (payload) => chatRequestApi.post("/chat/typing", payload),
  updateStatus: (payload) => chatRequestApi.post("/chat/status", payload),
  getHistory: (roomId) => chatRequestApi.get(`/chat/history/${roomId}`),
  getPendingChats: (ownerId) => chatRequestApi.get(`/chat/pending/${ownerId}`),
  getAcceptedChats: (ownerId) => chatRequestApi.get(`/chat/accepted/${ownerId}`),
  getRejectedChats: (ownerId) => chatRequestApi.get(`/chat/rejected/${ownerId}`),
};

export default api;
