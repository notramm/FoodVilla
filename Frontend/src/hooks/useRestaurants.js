import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { restaurantService } from "../services/restaurant.service.js";
import { selectFilters } from "../features/restaurant/restaurantSlice.js";

export const useRestaurants = () => {
  const filters = useSelector(selectFilters);

  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: () => restaurantService.getAll(filters),
    select: (data) => data.data.restaurants,
  });
};

export const useRestaurant = (id) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useRestaurantSlots = (id, date, guests) => {
  return useQuery({
    queryKey: ["slots", id, date, guests],
    queryFn: () => restaurantService.getSlots(id, date, guests),
    select: (data) => data.data.slots,
    enabled: !!id && !!date && !!guests,
  });
};