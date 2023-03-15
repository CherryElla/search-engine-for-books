const { AuthenticationError } = require("@apollo/server");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const usersData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                .populate('books');
                return usersData
            }
            throw new AuthenticationError("You must be logged in!");
        },
    },

    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError(
                    "No user found with this email address"
                );
            }
            const correctPassword = await user.isCorrectPassword(password);
            if (!correctPassword) {
                throw new AuthenticationError("Credentials are invalid");
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return{token, user}
        },
        saveBook: async(parent, {book},context) => {
            return await User.findOneAndUpdate(
                {_id: context.user._id},
                {$addToSet: {savedBooks: book}},
                {new: true}
            );
        },
        removeBook: async(parent, {bookId}, context)=> {
            return await User.findByIdAndUpdate(
            {_id: context.user._id},
            {$pull: {savedBooks: bookId}},
            {new: true} 
            );
        }

    },
};

module.exports = resolvers;
