// This file defines the shape of the data for a login request.
// It's a good practice to have separate DTOs for different actions.

export class LoginDto {
  email: string;
  password: string;
}
