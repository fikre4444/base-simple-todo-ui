export const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!accessToken || !refreshToken) {
    console.error("Attempted to save undefined tokens");
    return;
  }
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};