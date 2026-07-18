import { auth } from "../firebase/firebaseConfig";

const API_BASE_URL = "https://lumora-x963.onrender.com/api";

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

export const checkUsernameAvailable = async (username) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/check-username/${username}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    return { success: true, available: data.available };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createUserProfile = async (profileData) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Not logged in" };

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (updates) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- UPLOAD PROFILE PHOTO (Protected) ----------
export const uploadProfilePhoto = async (file) => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, url: data.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- UPLOAD POST MEDIA (Protected) ----------
export const uploadPostMedia = async (file) => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("media", file);

    const res = await fetch(`${API_BASE_URL}/upload/post-media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, url: data.url, mediaType: data.mediaType };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- CREATE POST (Protected) ----------
export const createPost = async (postData) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/posts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, post: data.post };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET FEED (Public) ----------
export const getFeed = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/feed`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, posts: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET POSTS BY USER (Public) ----------
export const getUserPosts = async (firebaseUid) => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/user/${firebaseUid}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, posts: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- LIKE / UNLIKE POST (Protected) ----------
export const toggleLikePost = async (postId) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, likesCount: data.likesCount, liked: data.liked };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- GET USER PROFILE BY USERNAME (Public) ----------
export const getProfileByUsername = async (username) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile/${username}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- SEARCH USERS (Public) ----------
export const searchUsers = async (query) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/search/${query}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, users: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- FOLLOW / UNFOLLOW (Protected) ----------
export const toggleFollow = async (targetUid) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/follow/${targetUid}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, following: data.following, followersCount: data.followersCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- ADD COMMENT (Protected) ----------
export const addComment = async (postId, text) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, comment: data.comment };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET COMMENTS (Public) ----------
export const getComments = async (postId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${postId}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, comments: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- UPLOAD STORY MEDIA (Protected) ----------
export const uploadStoryMedia = async (file) => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("media", file);

    const res = await fetch(`${API_BASE_URL}/upload/story-media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, url: data.url, mediaType: data.mediaType };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- CREATE STORY (Protected) ----------
export const createStory = async (mediaUrl, mediaType) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/stories/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mediaUrl, mediaType }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, story: data.story };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET ACTIVE STORIES (Public) ----------
export const getActiveStories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/stories/active`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, storyGroups: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET MY STORIES (Protected) ----------
export const getMyStories = async () => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/stories/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, stories: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- MARK STORY VIEWED (Protected) ----------
export const markStoryViewed = async (storyId) => {
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE_URL}/stories/${storyId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- DELETE POST (Protected) ----------
export const deletePost = async (postId) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- GET MY CONVERSATIONS (Protected) ----------
export const getConversations = async () => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, conversations: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET OR CREATE CONVERSATION WITH USER (Protected) ----------
export const getOrCreateConversation = async (targetUid) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/messages/conversations/with/${targetUid}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, conversationId: data.conversationId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- GET MESSAGES (Protected) ----------
export const getMessages = async (conversationId) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, messages: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- SEND MESSAGE (Protected) ----------
export const sendMessage = async (conversationId, text) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ---------- UPLOAD CHAT MEDIA (Protected) ----------
export const uploadChatMedia = async (file) => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("media", file);

    const res = await fetch(`${API_BASE_URL}/upload/chat-media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, url: data.url, mediaType: data.mediaType };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ---------- SEND MESSAGE WITH MEDIA (Protected) ----------
export const sendMessageWithMedia = async (conversationId, text, mediaUrl, mediaType) => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, mediaUrl, mediaType }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
};