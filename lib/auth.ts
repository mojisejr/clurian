import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["line"],
    },
  },
  socialProviders: {
    line: {
      clientId: process.env.LINE_CHANNEL_ID as string,
      clientSecret: process.env.LINE_CHANNEL_SECRET as string,
      scopes: ["profile", "openid", "email"],
      mapProfileToUser: (profile) => {
        return {
          name: profile.name || 'LINE User',
          image: profile.picture,
          email: profile.email || `${profile.sub || 'unknown'}@line.placeholder`,
          emailVerified: false,
        };
      },
    },
  },
});
