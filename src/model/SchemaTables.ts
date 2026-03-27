/**
 * Warning: SchemaRef is the reference tables name for other classes
 * It must not be depend on pg or other nodejs lib
 */
export enum SchemaTables {
    User = "user",
    Registry = "registry",
    Repository= "repository",
    UserRegistry = "user_registry",
    Trace = "trace",
}