import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, query, mutation } from './_generated/server';
import { getUser } from './users';

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity);

    if (!identity) {
      throw new ConvexError("you must be logged in to upload a file!")
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    const newFileId = await ctx.db.insert('files', {
      name: args.name, 
      orgId: args.orgId
    });
    return newFileId;
  }
});

export const getFiles = query({
  args: { 
    orgId: v.string(),
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) {
      return [];
    }

    return await ctx.db.query('files').withIndex("by_orgId",q => 
      q.eq('orgId', args.orgId)).collect();
  }
}
);

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx, 
  tokenIdentifier: string, 
  orgId: string) {
  const user = await getUser(ctx, tokenIdentifier);
  const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
    
  if (!hasAccess) {
      throw new ConvexError("you do not have access to this org")
  }
  return hasAccess;
}
