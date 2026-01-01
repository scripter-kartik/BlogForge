"use client";

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useUser } from '@/context/UserContext';

export function useProfileUpdate() {
  const { update: updateSession } = useSession();
  const { updateUser, refreshUser } = useUser();

  const updateProfileImage = useCallback(async (newImageUrl) => {
    console.log("Starting profile image update:", newImageUrl);

    try {
      updateUser({ image: newImageUrl });
      console.log("Context updated");

      await updateSession({
        user: { image: newImageUrl }
      });
      console.log("Session update triggered");

      await new Promise(resolve => setTimeout(resolve, 500));

      await refreshUser();
      console.log("User refreshed from database");

      if (typeof window !== 'undefined') {
        localStorage.setItem('lastProfileUpdate', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }

      return true;
    } catch (error) {
      console.error("Profile image update failed:", error);
      return false;
    }
  }, [updateSession, updateUser, refreshUser]);

  const updateProfileData = useCallback(async (newData) => {
    console.log("Starting profile data update:", newData);

    try {
      updateUser(newData);

      await updateSession();

      await refreshUser();

      return true;
    } catch (error) {
      console.error("Profile data update failed:", error);
      return false;
    }
  }, [updateSession, updateUser, refreshUser]);

  return {
    updateProfileImage,
    updateProfileData,
  };
}