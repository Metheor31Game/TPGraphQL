const { ApolloServer } = require('@apollo/server');
const { MongoClient } = require('mongodb');
const { startStandaloneServer } = require('@apollo/server/standalone');

const mongoURL = 'mongodb://localhost:27017';

 
// Définition du schéma
const typeDefs = `
  type Client {
    id: ID!
    name: String!
    email: String!
    numTel: String!
}
 
  type Query {
    clients: [Client]
    client(id: ID!) : Client
  }
  type Mutation {
    addClient(name: String!, email: String!, numTel: String!): Client
  }
`;
 
// Récupérer les données depuis la base de donnée
async function getCollection(db, paramCollection) {
    try {
        const client = new MongoClient(mongoURL);
        await client.connect();
    
        const collection = client.db(db).collection(paramCollection);
    
        const list = await collection.find().toArray();
        await client.close();
        return list;
    } catch (error) {
        console.error("Erreur de récupération de la collection", error);
    }

}

async function ajoutClient( { name, email, numTel } ) {
    try {
        const client = new MongoClient(mongoURL);
        await client.connect();
        
        const collection = client.db('magasin').collection('client');
        const list = collection.find().toArray();
        const newClient = {
            id: String((await list).length + 1),
            name: name,
            email: email,
            numTel: numTel
        }
        
        collection.insertOne(newClient);
        await client.close();
    
        return newClient;
    } catch (error) {
        console.error("Erreur de récupération de la collection", error);
    }
}


// Resolvers pour fournir les données
const resolvers = {
  Query: {
    clients: () => getCollection("magasin","client"),
    client: (_, { id }) => clients.find(client => client.id === id),
  },
  Mutation: {
    addClient: (_, {name, email, numTel}) => ajoutClient({name, email, numTel})
  }
};
 
// Création du serveur
const server = new ApolloServer({ typeDefs, resolvers })

// Démarrage du serveur
startStandaloneServer(server, {
    listen: { port: 4000 },
  }).then(({ url }) => {
    console.log(`🚀 Serveur GraphQL prêt à l'adresse : ${url}`);
  });