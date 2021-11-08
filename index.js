const {ApolloServer} = require('apollo-server');
const {PubSub}  = require('graphql-subscriptions');
const mongoose = require('mongoose');
const {MONGODB} = require('./config.js');

const typeDefs = require('./graphql/typedefs');
const resolvers= require('./graphql/resolvers/index');

const PORT = process.env.port || 5000;

 const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs, resolvers,
    context: ({req}) => ({req})
});

mongoose.connect(MONGODB, {useNewurlParser: true})
.then(()=>{
    return server.listen({port: PORT})
})
.then(res=>{
    console.log(`server is running on port ${res.url}`)
})