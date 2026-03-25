import { Menu } from "../models/Menu.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getRestaurantById } from "./restaurant.service.js";

// Create menu for a restaurant
export const createMenu = async (restaurantId, items) => {
  // Check restaurant exists first
  await getRestaurantById(restaurantId);

  // Check if menu already exists for this restaurant
  const existingMenu = await Menu.findOne({ restaurant: restaurantId });
  if (existingMenu) {
    throw new ApiError(409, "Menu already exists for this restaurant. Use update instead.");
  }

  const menu = await Menu.create({
    restaurant: restaurantId,
    items,
  });

  return menu;
};

// Get full menu of a restaurant
export const getMenuByRestaurant = async (restaurantId) => {
  // Check restaurant exists
  await getRestaurantById(restaurantId);

  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found for this restaurant");
  }

  return menu;
};

// Get menu grouped by category
// Makes it easier for frontend to render
// { "Starters": [...], "Main Course": [...], "Desserts": [...] }
export const getMenuGroupedByCategory = async (restaurantId) => {
  const menu = await getMenuByRestaurant(restaurantId);

  // Filter only available items then group
  const availableItems = menu.items.filter((item) => item.isAvailable);

  const grouped = availableItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return grouped;
};

// Add new items to existing menu
export const addMenuItems = async (restaurantId, newItems) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found. Create a menu first.");
  }

  menu.items.push(...newItems);
  await menu.save();

  return menu;
};

// Update a specific menu item by its _id
export const updateMenuItem = async (restaurantId, itemId, updates) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  // Find the item inside items array
  const item = menu.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  // Update only provided fields
  Object.assign(item, updates);
  await menu.save();

  return menu;
};

// Toggle item availability
// Like if something runs out — mark as unavailable
export const toggleItemAvailability = async (restaurantId, itemId) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  item.isAvailable = !item.isAvailable;
  await menu.save();

  return item;
};

// Delete a menu item
export const deleteMenuItem = async (restaurantId, itemId) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  item.deleteOne();
  await menu.save();
};

// Search menu items by name or category
// Used by AI for upsell suggestions!
export const searchMenuItems = async (restaurantId, query) => {
  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const lowerQuery = query.toLowerCase();

  const results = menu.items.filter(
    (item) =>
      item.isAvailable &&
      (item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery))
  );

  return results;
};

// Get veg only items — useful for AI filtering
export const getVegItems = async (restaurantId) => {
  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  return menu.items.filter((item) => item.isVeg && item.isAvailable);
};