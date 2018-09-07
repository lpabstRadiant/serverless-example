const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } = require('graphql');
const { graphqlLambda } = require('graphql-server-lambda');
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

// module.exports.query = ( event, context, callback ) => graphql(schema, event.queryStringParameters.query)
//     .then(
//         result => callback(null, {statusCode: 200, headers: {"x-custom-header" : "My Header Value", 'Access-Control-Allow-Origin': '*'}, body: JSON.stringify(result)}),
//         err => callback(err)
//     )


module.exports.query = ( event, context, callback ) => {
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));
    
    graphql(schema, event.queryStringParameters.query)
    .then(
        result => {
            console.log(result);
            const response = {
                statusCode: 200, 
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(result)
            }
            
            if (callback){
                console.log(JSON.stringify(callback));
                console.log('cb exists')
            }else{
                console.log('cb doesnt exist')
            }
            return callback(null, response);
        },
        err => callback(err)
    )
}

// module.exports.query = ( event, context, callback ) => {
//     let callbackFilter = (error, output) => {
//       output.headers = { "Access-Control-Allow-Origin": "*", "Content-Type":"application/json" };
//       callback(error, output);
//     };
  
//     let handler = graphqlLambda(() => ({
//       schema,
//       context: {
//         headers: event.headers
//       }
//     }));
  
//     handler(event, context, callbackFilter);
// }

// module.exports.query = ( event, context, callback ) => {
//     context.callbackWaitsForEmptyEventLoop = false;
//     function callbackFilter(error, output){
//         if (!output.headers) output.headers = {};
//         output.headers['Access-Control-Allow-Origin'] = '*';
//         callback(error, output);
//     }
    
//     const handler = graphqlLambda({schema});
//     return handler(event, context, callbackFilter);
// }
