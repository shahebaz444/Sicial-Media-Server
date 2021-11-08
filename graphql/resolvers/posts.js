const Post = require('../../modules/Post');
const checkAuth = require('../../Util/check-auth');
const { AuthenticationError, UserInputError } = require('apollo-server');
const { subscribe } = require('graphql');


module.exports = {
    Query:{
         getPosts :async ()=>{
            try {
                const posts = await Post.find();
                return posts;
                
            } catch (error) {
                console.log(error);
            }
        },

        getPost : async (_, {postId})=>{
            try {
                const post = await Post.findById(postId);
                if(post)
                    return post;
                throw new Error('post not found')
                
            } catch (error) {
                throw new Error(error)
                console.log(error);
            }
        }
    },
    Mutation:{
        createPost: async (_, {body}, context)=>{
            if(body.trim() === "")
                throw new UserInputError('Body should not be empty')

            const user = checkAuth(context);
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt : new Date().toISOString()
            });
            const post = await newPost.save();
            // context.pubsub.publish('NEW_POST',{
            //     newPost: post
            // })
            return post;
        },

        deletePost: async (_,{postId}, context) =>{
            const user = checkAuth(context);
            let res = "";
            try {
                const post = await Post.findById(postId);
                if(user.username === post.username){
                    await post.delete();
                    res =  'Post deleted Successfully';
                }
                else{
                    throw new AuthenticationError('Action not allowed');
                }
            } catch (error) {
                throw new Error(error);
            }
            return res;
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, {pubsub}) => pubsub.asyncIterator('NEW_POST')
        }
    }
}