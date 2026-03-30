import {
  getMenuGroupedByCategory,
  searchMenuItems,
  getVegItems,
} from "../../services/menu.service.js";

export const getMenuTool = {
  type: "function",
  function: {
    name: "getMenu",
    description: "Get menu items of a restaurant",
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "Restaurant ID",
        },
        vegOnly: {
          type: "boolean",
          description: "True to get only vegetarian items",
        },
        searchQuery: {
          type: "string",
          description: "Search specific dish or category",
        },
      },
      required: ["restaurantId"],
    },
  },
};

export const executeGetMenu = async (args) => {
  const { restaurantId, vegOnly, searchQuery } = args;

  // If search query provided — search specific items
  if (searchQuery) {
    const items = await searchMenuItems(restaurantId, searchQuery);
    return {
      success: true,
      searchQuery,
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isVeg: item.isVeg,
      })),
    };
  }

  // If veg only requested
  if (vegOnly) {
    const items = await getVegItems(restaurantId);
    return {
      success: true,
      vegOnly: true,
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
      })),
    };
  }

  // Otherwise return full menu grouped by category
  const grouped = await getMenuGroupedByCategory(restaurantId);

  return {
    success: true,
    menu: grouped,
  };
};