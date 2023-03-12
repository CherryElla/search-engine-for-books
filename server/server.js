const express = require("express");
const path = require("path");
const db = require("./config/connection");
const { ApolloServer } = require("@apollo/server");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const { json } = require("body-parser");
const http = require("http");
const {
    ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;
// Create an Apollo server and apply it to Express middleware
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: authMiddleware,
// })
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

app.use("/graphql", cors(), json());

app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startServer = async () => {
    await server.start();
    app.use(
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token }),
        })
    );
    await new Promise((resolve) => {
        db.once("open", () => {
            httpServer.listen({ port: PORT }, resolve);
        });
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
};

startServer();

// // Create a new instance of an Apollo server with the GraphQL schema
// const startApolloServer = async (typeDefs, resolvers) => {
//   await server.start();
//   expressMiddleware({ app });

//   db.once('open', () => {
//     app.listen(PORT, () => {
//       console.log(`API server running on port ${PORT}!`);
//       console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
//     })
//   })
//   };

// // Call the async function to start the server
//   startApolloServer(typeDefs, resolvers);
