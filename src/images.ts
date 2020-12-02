import DynamoDB from 'aws-sdk/clients/dynamodb';

const ddb = new DynamoDB();

const getImage = async (catname: string): Promise<string | undefined> => {
  const result = await ddb
    .query({
      TableName: 'images',
      ExpressionAttributeValues: { ':catname': { S: catname } },
      KeyConditionExpression: 'catname = :catname',
      ProjectionExpression: 'catImageUrl',
    })
    .promise();
  return result.Items ? (result.Items[0].catImageUrl.S as string) : undefined;
};

export { getImage };
