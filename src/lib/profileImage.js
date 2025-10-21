// src/lib/profileImage.js

export function getRandomProfileImage(userImage, username) {
  if (userImage) {
    return userImage;
  }
  const seed = username || "default";
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/100/100`;
}
