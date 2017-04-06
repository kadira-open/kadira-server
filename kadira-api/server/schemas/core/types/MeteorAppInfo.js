import {
  GraphQLFloat,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const PackageVersion = new GraphQLObjectType({
  name: 'PackageVersion',
  description: 'TODO: description',
  fields: {
    name: {
      type: GraphQLString,
      description: 'TODO description',
    },
    version: {
      type: GraphQLString,
      description: 'TODO description',
    },
  },
});

export const MeteorVersions = new GraphQLObjectType({
  name: 'MeteorVersions',
  description: 'TODO: description',
  fields: {
    cordova: {
      type: GraphQLString,
      description: 'TODO description',
    },
    refreshable: {
      type: GraphQLString,
      description: 'TODO description',
    },
    webapp: {
      type: GraphQLString,
      description: 'TODO description',
    },
  },
});

export default new GraphQLObjectType({
  name: 'MeteorAppInfo',
  description: 'TODO description',
  fields: () => ({
    id: {
      type: GraphQLString,
      description: 'TODO description',
      resolve(root) {
        return root._id;
      },
    },
    appId: {
      type: GraphQLString,
      description: 'TODO description',
      resolve(root) {
        return root.value.appId;
      },
    },
    host: {
      type: GraphQLString,
      description: 'TODO description',
      resolve(root) {
        return root.value.host;
      },
    },
    time: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve(root) {
        return root.value.startTime.getTime();
      },
    },
    release: {
      type: GraphQLString,
      description: 'TODO description',
      resolve(root) {
        return root.value.release;
      },
    },
    versions: {
      type: MeteorVersions,
      description: 'TODO description',
      resolve(root) {
        return root.value.appVersions;
      },
    },
    packages: {
      type: new GraphQLList(PackageVersion),
      description: 'TODO description',
      resolve(root) {
        return root.value.packageVersions;
      },
    },
  }),
});
