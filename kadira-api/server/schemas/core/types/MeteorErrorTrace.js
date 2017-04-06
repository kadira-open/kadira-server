import {
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import MeteorErrorClientInfo from './MeteorErrorClientInfo';
import MeteorServerTrace from './MeteorServerTrace';


export default new GraphQLObjectType({
  name: 'MeteorErrorTrace',
  description: 'TODO description',
  fields: () => ({
    id: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => root._id,
    },
    host: {
      type: GraphQLString,
      description: 'TODO description',
    },
    time: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.startTime,
    },
    message: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => root.name,
    },
    type: {
      type: GraphQLString,
      description: 'TODO description',
    },
    subType: {
      type: GraphQLString,
      description: 'TODO description',
    },
    info: {
      type: MeteorErrorClientInfo,
      description: 'TODO description'
    },
    stacks: {
      type: GraphQLString,
      description: 'TODO description',
    },
    trace: {
      type: MeteorServerTrace,
      description: 'TODO description',
    },
  }),
});
