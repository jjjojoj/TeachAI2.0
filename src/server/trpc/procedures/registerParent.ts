import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";

export const registerParent = baseProcedure
  .input(z.object({
    name: z.string(),
    phoneNumber: z.string(),
    password: z.string(),
    childInfo: z.object({
      name: z.string(),
      schoolName: z.string(),
      grade: z.string(),
      className: z.string(),
    }),
    invitationCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Stub implementation - parent registration not yet implemented
    throw new Error("Not implemented");
    void input;
  });
