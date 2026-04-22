import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";

export const loginParent = baseProcedure
  .input(z.object({
    phoneNumber: z.string(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Stub implementation - parent login not yet implemented
    // Return type matches what ParentLoginForm expects
    void input;
    return {
      authToken: "",
      parent: {
        id: 0,
        name: "",
        phoneNumber: "",
      },
    } as const;
  });
