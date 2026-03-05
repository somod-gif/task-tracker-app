import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    avatar?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    avatar?: string | null;
  }
}
