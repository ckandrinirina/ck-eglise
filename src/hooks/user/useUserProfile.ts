import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService } from "@/lib/services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { UpdateUserData } from "@/types/users/user";

export const useUserProfile = () => {
  const t = useTranslations("profile");
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user profile with detailed information
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      return UserService.getUser(authUser.id);
    },
    enabled: !!authUser?.id,
    staleTime: 300000, // 5 minutes
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (userData: UpdateUserData) => {
      if (!authUser?.id) {
        throw new Error("User not authenticated");
      }
      return UserService.updateUser(authUser.id, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      toast.success(t("profileUpdated"));
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(t("errorUpdating"));
    },
  });

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      if (!authUser?.id) {
        throw new Error("User not authenticated");
      }
      return UserService.updatePassword(authUser.id, data);
    },
    onSuccess: () => {
      toast.success(t("passwordUpdated"));
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating password:", error);
      toast.error(t("errorUpdatingPassword"));
    },
  });

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(
    (userData: UpdateUserData) => {
      updateProfile.mutate(userData);
    },
    [updateProfile],
  );

  const handlePasswordChange = useCallback(
    (data: { currentPassword: string; newPassword: string }) => {
      updatePassword.mutate(data);
    },
    [updatePassword],
  );

  return {
    profile,
    isLoading,
    isError,
    isEditing,
    handleEdit,
    handleCancel,
    handleSave,
    handlePasswordChange,
    refetch,
    isUpdating: updateProfile.isPending,
    isUpdatingPassword: updatePassword.isPending,
  };
};
