const { DynamoDB } = require('aws-sdk');

import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const ddb = new DynamoDB();

const getUserPerms = async (user: any): Promise<string[]> => {
  const result = await ddb.scan({TableName:'users' }) .promise();
  return result.Items?result.Items.map((e: any) => e.userPermissions.S as string) : [];
};

const authenticateUser = async(token: any): Promise<string> => {
  const parsed = jwt.decode(token);
  if (!parsed)
    throw new Error('Unauthorized');

  return parsed.sub;
};

// Validate that there's a permission 'catName:1' in the permissions for the user.
const testPerm = async (perm: any, catName: any): Promise<any> =>{
  return [...perm.matchAll(`/(${catName}):(\d)/g`)].map((e) => e[2]).filter((p) => p > 0).length > 0;
};

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  var authHeader = req.headers['authentication'];
  if (!authHeader) {
    return res.status(404);
  }

  var token = authenticateUser(authHeader as string);
  if (!token) { return res.status(404); }

  var perms = await getUserPerms(req.params.user);
  for (var i = 0; i < perms.length; i++) {
    if (testPerm(perms[i], req.params.catName))
      return next();
  }

  return res.status(404);
};

export { authorize };
