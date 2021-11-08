const { GraphQLServer, PubSub } = require('graphql-yoga');

let defaultName = "Meow";

const pubsub = new PubSub();

const typeDefs = `
	type Query {
		hello(name: String): String!
		sayhi: String!
		meow(name: String): String!
	}

	type Mutation {
		changeDefaultName(name: String!): String!
	}

	type Subscription {
		updateName: String!
	}
`;

const resolvers = {
	Query: {
		hello: (root, { name }, ctx, info) => {
			if (!name)
				name = defaultName;
			return `Meow meow from ${name}!`;
		},
		sayhi: () => "Hi API from graphQL",
		meow: (root, { name }, ctx, info) => {
			if (!name)
				name = defaultName;
			return `Give ${name} a fish!`;
		}
	},
	Mutation: {
		changeDefaultName: (root, { name }, ctx, info) => {
			defaultName = name;
			pubsub.publish('update_name', {
				updateName: `Notify Update Default Name to ${name}`
			})
			return `Ok change the default name to ${defaultName}`;
		}
	},
	Subscription: {
		updateName: {
			subscribe(root, args, ctx, info) {
				return pubsub.asyncIterator('update_name');
			}
		}
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});

const options = {
	port: 4000,
	endpoint: '/graphql'
};

server.start(options, (args) => { 
	const { port } = args;
  console.log(`Server start on port: ${port}`)
});