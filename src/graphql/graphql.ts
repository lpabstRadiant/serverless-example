import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
    uri: 'https://20n4h1kewa.execute-api.us-east-1.amazonaws.com/dev/query'
});

const mutate = (mutation, options) => {
    let body = {
        mutation,
        ...options
    };

    console.log('mutation: ' + body);

    return client.mutate(body)
    .then(res => res)
    .catch(err => err);
}

const fetch = (query, options) => {
    let body = {
        query,
        ...options 
    };

    console.log('query: ' + body);

    client.query(body)
    .then(res => res)
    .catch(err => err);
}

export { client, fetch, mutate };