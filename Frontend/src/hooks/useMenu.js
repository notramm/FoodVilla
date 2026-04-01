import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { menuService } from "../services/menu.service.js";

// Get full menu grouped by category
export const useMenu = (restaurantId) => {
  return useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => menuService.getGrouped(restaurantId),
    select: (data) => data.data,
    enabled: !!restaurantId, // Only fetch if restaurantId exists!
    staleTime: 1000 * 60 * 10, // Cache for 10 mins — menu doesnt change often!
  });
};

// Toggle item availability — admin/staff
export const useToggleItemAvailability = (restaurantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) =>
      menuService.toggleAvailability(restaurantId, itemId),
    onSuccess: () => {
      // Refetch menu after toggle
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Item availability updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update item");
    },
  });
};

// Add items to menu — admin only
export const useAddMenuItems = (restaurantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => menuService.addItems(restaurantId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Items added successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add items");
    },
  });
};

// Delete item — admin only
export const useDeleteMenuItem = (restaurantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => menuService.deleteItem(restaurantId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Item deleted!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete item");
    },
  });
};