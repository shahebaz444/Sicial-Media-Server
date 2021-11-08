const Post = require('../../modules/Post')
const checkAuth = require('../../Util/check-auth');
const { UserInputError, AuthenticationError} = require('apollo-server');

module.exports = {
    Mutation:{
        createComment : async (_, {postId, body}, context)=>{
            let { username } = checkAuth(context);
            if(body.trim() === ""){
                throw new UserInputError('Empty Comment',{
                    errors: {
                        body: 'comment body should not be empty'
                    }
                })
            }

            const post =  await Post.findById(postId);
            if(post){
             post.comments.unshift({
                 body, username, 
                 createdAt: new Date().toISOString()
             });
             await post.save();
             return post;
            }
            throw new UserInputError('Post not found');
        },
        deleteComment : async (_, {postId, commentId}, context) => {
            let { username } = checkAuth(context);
            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(x => x.id === commentId);
                if(post.comments[commentIndex].username === username){
                    post.comments.splice(commentIndex, 1);
                    post.save();
                }
                else{
                    throw new AuthenticationError('Action not Allowed');
                }
            }
            else{
                throw new UserInputError('Post not found');
            }
            return post;
        },
        likePost : async (_, {postId}, context)=>{
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find(like => like.username === username)){
                   post.likes = post.likes.filter(like => like.username !== username);
                }
                else{
                    post.likes.push({
                        username, 
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            }
            else{
                throw new UserInputError('Post not found');
            }
        }
    }

}