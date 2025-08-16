// This file defines the shape of the data for a registration request.

export class RegisterDto {
  email: string;
  password: string;
  username?: string; // The '?' makes the username optional
}
