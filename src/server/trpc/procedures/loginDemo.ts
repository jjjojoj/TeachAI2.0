import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const loginDemo = baseProcedure
  .input(z.object({}))
  .mutation(async () => {
    try {
      // Find the demo teacher by phone number
      const teacher = await db.teacher.findUnique({
        where: {
          phoneNumber: "13800000001",
        },
      });

      if (!teacher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "演示账户尚未初始化，请联系管理员",
        });
      }

      // Generate JWT token
      const authToken = jwt.sign(
        { teacherId: teacher.id },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        authToken,
        teacher: {
          id: teacher.id,
          phoneNumber: teacher.phoneNumber,
          name: teacher.name,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "登录失败，请稍后重试",
      });
    }
  });
