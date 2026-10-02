// src/api/client.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";

export const baseApi = axios.create({
  baseURL: "https://fakestoreapi.com",
  timeout: 2900,
});

baseApi.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    // Transform or format data globally if needed
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Redirecting...");
    } else if (error.response && error.response.status === 404) {
      alert("Endpoint does not exist");
    }
    return Promise.reject(error); // Pass the error along to your catch block
  },
);

//1. create api
export const rtkApi = createApi({
  // 2. set the path
  reducerPath: "baseApi", // where the cache lives in the store
  //3. set the base query. Rtk Provides a fetchBaseQuery function and this is what handles your requests, and response, and you can pass your base url to it.
  baseQuery: fetchBaseQuery({ baseUrl: "https://fakestoreapi.com" }),

  //4. You can define your endpoints here..., or leave it bare for inject endpoints to handle it. to make it more modular, and easier to maintain.
  endpoints: () => ({}),
  tagTypes: ["Products"],
});
