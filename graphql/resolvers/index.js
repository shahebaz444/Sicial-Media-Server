const postResolvers = require('./posts')
const usersResolvers = require('./users')
const commentsResolvers = require('./comments');
const { parseConstValue } = require('graphql');

module.exports = {
    Post:{
        likeCount: (parent) =>{
            return parent.likes.length;
        },
        commentCount: (parent) => parent.comments.length
    },
    Query:{
        ...postResolvers.Query
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentsResolvers.Mutation
    }
}