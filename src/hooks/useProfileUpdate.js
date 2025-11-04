// Create this file: src/hooks/useProfileUpdate.js
"use client";

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useUser } from '@/context/UserContext';

export function useProfileUpdate() {
  const { update: updateSession } = useSession();
  const { updateUser, refreshUser } = useUser();

  const updateProfileImage = useCallback(async (newImageUrl) => {
    console.log("📸 Starting profile image update:", newImageUrl);

    try {
      // Step 1: Update global user context immediately (optimistic update)
      updateUser({ image: newImageUrl });
      console.log("✅ Context updated");

      // Step 2: Force NextAuth session to refresh with new image
      await updateSession({
        user: { image: newImageUrl }
      });
      console.log("✅ Session update triggered");

      // Step 3: Wait a bit for the session to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Refresh from database to confirm
      await refreshUser();
      console.log("✅ User refreshed from database");

      // Step 5: Force re-render by updating local storage timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastProfileUpdate', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }

      return true;
    } catch (error) {
      console.error("❌ Profile image update failed:", error);
      return false;
    }
  }, [updateSession, updateUser, refreshUser]);

  const updateProfileData = useCallback(async (newData) => {
    console.log("📝 Starting profile data update:", newData);

    try {
      // Update context immediately
      updateUser(newData);

      // Trigger session refresh
      await updateSession();

      // Refresh from database
      await refreshUser();

      return true;
    } catch (error) {
      console.error("❌ Profile data update failed:", error);
      return false;
    }
  }, [updateSession, updateUser, refreshUser]);

  return {
    updateProfileImage,
    updateProfileData,
  };
}