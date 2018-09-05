const { graphql, GraphQlSchema, GraphQlObjectType, GraphQlString, GraphQlNonNull } = require('graphql');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getGreeting = (firstName) => {
    return promisify( cb => {
        dynamoDb.get({
            TableName: process.env.DYNAMODB_TABLE,
            Key: { 
                firstName: firstName 
            },
        }, cb)
    })
    .then( res => {
        if (!res.Item) return firstName;
        return res.Item.nickname;
    })
    .then(name => `Hello, ${name}.`)
    .catch(err => console.log(err));
}

const changeNickname = (firstName, nickname) => {
    return promisify(cb => {
        dynamoDb.update({
            TableName: process.env.DYNAMODB_TABLE,
            Key: { firstName },
            UpdateExpression: 'SET nickname = :nickname',
            ExpressionAttributeValues: {
                ':nickname': nickname
            }
        }, cb)
    })
    .then(() => nickname)
}

const schema = new GraphQlSchema({
    query: new GraphQlObjectType({
        name: 'RootQueryType',
        fields: {
            greeting: {
                args: { 
                    firstname: {
                        name: 'firstName',
                        type: new GraphQlNonNull(GraphQlString)
                    }
                },
                type: GraphQlString,
                resolve: ( parent, args ) => getGreeting(args.firstName)
            }
        }
    }),
    mutation: new GraphQlObjectType({
        name: 'RootMutationType',
        fields: {
            changeNickname: {
                args: {
                    firstName: {
                        name: 'firstName', 
                        type: new GraphQlNonNull(GraphQlString),
                    },
                    nickname: {
                        name: 'nickname', 
                        type: new GraphQlNonNull(GraphQlString),
                    }
                },
                type: GraphQLString,
                resolve: (parent, args) => {
                    return changeNickname(args.firstName, args.nickname);
                }
            }
        }
    }),
})

const promisify = (cb) => {
    const promiseCB = (resolve, reject) => {
        cb((error, result) => {
            if (error) reject(error);
            else resolve(result);
        })
    }
    return new Promise(promiseCB);
}

module.exports.query = ( event, context, callback ) => graphql(schema, event.queryStringParameters.query)
.then(
    result => callback(null, {statusCode: 200, body: JSON.stringify(result)}),
    err => callback(err)
)
