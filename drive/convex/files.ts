import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, query, mutation } from './_generated/server';
import { getUser } from './users';
import { fileTypes } from './schema';

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file!")
  }
return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  handler: async(ctx, args) => {
    
    const identity = await ctx.auth.getUserIdentity();

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
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type
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
  const hasAccess = user && (user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId));
    
  if (!hasAccess) {
      throw new ConvexError("you do not have access to this org")
  }
  return hasAccess;
}


export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async(ctx, args) => {
    
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("you must be logged in to upload a file!")
    }

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("this file does not exist")

    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError("you do not have access to delete this file")

    }

    await ctx.db.delete(args.fileId);
  }
});