import client from "./client";
import type { LoginRequest, AuthResponse, UserProfileDto, UpdateProfileDto } from "../types";

export const authApi = {
    login: (data: LoginRequest) =>
        client.post<AuthResponse>("/users/login", data).then((r) => r.data),

    getProfile: () =>
        client.get<UserProfileDto>("/users/profile").then((r) => r.data),

    updateProfile: (data: UpdateProfileDto) =>
        client.put("/users/profile", data).then((r) => r.data),
};
