import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.accessToken;
      console.log("API Header - Token exists:", !!token);
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "CheckInStatus",
    "Dashboard",
    "Profile",
    "User",
    "PerformanceReport",
    "ChatHistory",
  ],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
    }),
  }),
});

export const { useGetUsersQuery } = api;
