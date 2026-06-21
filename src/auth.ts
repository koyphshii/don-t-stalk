import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const prisma = await getPrisma();
        const discordId = profile.id as string;
        const discordUsername = (profile.username as string) || (user.name as string);
        const discordAvatar = user.image || null;
        const discordEmail = (profile.email as string) || null;

        let existingUser = await prisma.user.findUnique({
          where: { discordId },
        });

        if (!existingUser) {
          let finalUsername = discordUsername;
          const taken = await prisma.user.findUnique({
            where: { username: finalUsername },
          });
          if (taken) {
            finalUsername = `${discordUsername}_${discordId.slice(-4)}`;
          }

          existingUser = await prisma.user.create({
            data: {
              username: finalUsername,
              discordId,
              avatarUrl: discordAvatar,
              email: discordEmail,
            },
          });
        } else {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              avatarUrl: discordAvatar || existingUser.avatarUrl,
              email: discordEmail || existingUser.email,
            },
          });
        }

        user.id = existingUser.id;
        user.name = existingUser.username;
        user.image = existingUser.avatarUrl;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
        token.avatarUrl = user.image;
      }
      if (account?.provider === "discord") {
        token.provider = "discord";
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = (token.avatarUrl as string) || null;
        session.user.discordId = (token.discordId as string) ?? "";
      }
      return session;
    },
  },
});
