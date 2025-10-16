import axios from "axios";

const cartApi = axios.create({
  baseURL: "http://localhost:4000/api/cart",
});

export const getCart = (email) => cartApi.get(`/${email}`);

export const addItemToCart = (email, itemData) =>
  cartApi.post(`/${email}/items`, itemData);

export const updateCartItem = (email, itemData) =>
  cartApi.put(`/${email}/items`, itemData);

export const removeItemFromCart = (email, itemId) =>
  cartApi.delete(`/${email}/items/${itemId}`);

export const clearCart = (email) => cartApi.delete(`/${email}`);
