import "next-auth";
import "next-auth/jwt";

import type { Role } from "@/types/domain";

declare module "next-auth" {
  interface User {
    role: Role;
    companyId?: string | null;
    departmentId?: string | null;
    companyName?: string | null;
    departmentName?: string | null;
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      companyId?: string | null;
      departmentId?: string | null;
      companyName?: string | null;
      departmentName?: string | null;
      mustChangePassword?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    companyId?: string | null;
    departmentId?: string | null;
    companyName?: string | null;
    departmentName?: string | null;
    mustChangePassword?: boolean;
  }
}
