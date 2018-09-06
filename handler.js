const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } = require('graphql');
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
            UpdateExpression: `SET nickname = :nickname`,
            ExpressionAttributeValues: {
                ':nickname': nickname
            }
        }, cb)
    })
    .then(() => nickname)
}

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            greeting: {
                args: { 
                    firstName: {
                        name: 'firstName',
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                type: GraphQLString,
                resolve: ( parent, args ) => getGreeting(args.firstName)
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
            changeNickname: {
                args: {
                    firstName: {
                        name: 'firstName', 
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    nickname: {
                        name: 'nickname', 
                        type: new GraphQLNonNull(GraphQLString),
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
