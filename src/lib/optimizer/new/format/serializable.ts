/**
 * A Serializable knows how to serialize/deserialize instances of itself.
 * Provides the implementation for this type and register it in `format.ts` to
 * get it automatically serializable/deserializable.
 */

export type Serializable<K extends object, T extends object = K> = {
  serialize(): K
  /**
   * Construct a new instance of ```T``` from a ```K```. Remember that K is an
   * object literal, there is no prototype (class) bounded for ```K```. You
   * should construct an instance of ```K``` yourself. The shortest way is
   * ```Object.assign(Object.create(Clazz.prototype), json)```. Note that if
   * ```K``` contains a class property, it is already created (through that
   * class ```__deserialize```), so you only have to deal with direct children
   * property.
   *
   * To implementation: This function will be called with the ```this```
   * parameter bound to ```undefined```. Never use ```this``` in this function.
   * @param json a parsed object.
   */
  __deserialize(this: undefined, json: K): T
}
