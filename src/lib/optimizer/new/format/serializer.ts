import { Serializable } from './serializable'

/* eslint-disable @typescript-eslint/ban-types */
type Constructor = Function

type ClassInstance = {
  constructor: Constructor
}

type SerializationOptions = {
  /**
   * Making sure that this {@link ObjectMapper} can deserialize the result of
   * this {@link ObjectMapper.serialize serialization}
   */
  collectMetadata: boolean
}

type DeserializationOptions = {
  /**
   * Use ```eval(className)``` as a last resort when deserializing unknown class
   * name.
   *
   * IMPORTANT: If you need to use this, something is very wrong.
   */
  useEvalAsFallback: boolean
}

type Deserializable = {
  /**
   * An unique name that identify a Serializable. This value is used to map the
   * serialized representation to the corresponding class form. This should be
   * ```class.constructor.name```
   */
  __serializable_name: SerializableName
}

// A type hack so that a string is not mistakenly used in the wrong context
type SerializableName = string & { __ignored: undefined }

/**
 * The primary API for serialization and deserialization.
 */
export class ObjectMapper {
  private map: Map<SerializableName, Function> = new Map()
  /**
   * @param classes classes that are supported for deserialization
   */
  constructor(classes: Constructor[] = []) {
    classes.forEach((clazz) => populateMap(clazz, this.map))
  }

  /**
   * Serialize an instance of any type to a string that can be
   * ```JSON.parse()``` into a {@link Deserializable}.
   */
  serialize(instance: unknown, options?: Partial<SerializationOptions>): string {
    return JSON.stringify(instance, (_key, value) => {
      if (!isClassInstance(value)) {
        return value as unknown
      }
      if (options?.collectMetadata && !this.map.has(value.constructor.name as SerializableName)) {
        populateMap(value.constructor, this.map)
      }
      return Object.assign(isSerializable(value) ? value.serialize() : value, {
        __serializable_name: value.constructor.name,
      })
    })
  }

  deserialize<T>(json: string, options?: Partial<DeserializationOptions>): T {
    if (options?.useEvalAsFallback) {
      console.log(`
You are using eval() as a fallback option to find the deserializers for unknown classes.
If you don't understand the above warning (an end user), you are likely a victim of an attack.
I don't know how you ended up here as this is an internal library, but don't listen to whatever they told you. 

Even if it is intentional, this is a huge security risk, and probably dodgy programming. 
Are you sure this is neccessary? I bet it's not.
This feature is only useful for development.
Try to provide the full range of deserializable classes before deserialization.

I'll be honest with you, I did not even tested this feature. 
Whether this works or not is up to luck.`)
    }
    return JSON.parse(json, (_key, value) => {
      if (isDeserializable(value)) {
        return this.__deserialize(value, options?.useEvalAsFallback ?? false)
      }
      return value as unknown
    }) as T
  }

  private __deserialize(json: Deserializable, useEval: boolean): unknown {
    const deserializer = this.map.get(json.__serializable_name)
    if (!deserializer) {
      const errString = `
Can't locate deserializer in the map. Context:
__serializable_name (class name): ${json.__serializable_name}
Map: ${JSON.stringify(Array.from(this.map.entries()), null, 4)}
Can this ObjectMapper support this class?`
      if (!useEval) {
        throw new Error(errString)
      }

      return evalUnknownClass(json, errString)(json)
    }
    return deserializer(json)
  }

  /**
   * Making sure that this {@link ObjectMapper} can deserialize the value of the
   * given class.
   *
   * Note: it isn't aware of the nested properties' classes.
   * Javascript is a very dynamic language, thus at runtime there is no type
   * information for a specific property of a class. Can't be helped. You can
   * query that a class has a property with name ```fieldxxx```, but that field
   * can hold anything from a number, a string to a class instance.
   */
  supportClasses(...clazzes: Constructor[]) {
    // One such way to provide the type information at runtime is through the
    // stage 3 decorator proposal, which is what TypedJSON is doing.
    clazzes.forEach((clazz) => populateMap(clazz, this.map))
  }

  /**
   * Making sure that this {@link ObjectMapper} is aware of the given object
   * structure (for deserialization). There is very little reason to use this
   * method.
   */
  support(value: ClassInstance | object) {
    if (typeof value !== 'object') {
      console.log(`Can't support function: ${String(value)}`)
    }
    if (isClassInstance(value)) {
      if (this.map.has(value.constructor.name as SerializableName)) {
        return
      }
      console.log(`Supporting class ${value.constructor.name}`)

      populateMap(value.constructor, this.map)
    }
    // support all nested properties
    Object.values(value).filter((val): val is object => typeof val === 'object').forEach((val) => this.support(val))
  }

  isSupported(name: string) {
    return this.map.has(name as SerializableName)
  }
}

// ----------------
// HELPER FUNCTIONS
// ----------------
// Note: clazz is in fact the constructor function
export function populateMap(clazz: Constructor, map: Map<SerializableName, Function>) {
  let deserializer: Function
  if (isSerializable(clazz.prototype)) {
    deserializer = clazz.prototype.__deserialize.bind(undefined)
  } else {
    deserializer = function(json: unknown) {
      return Object.assign(Object.create(clazz.prototype as object), json) as unknown
    }
  }
  return map.set(
    clazz.name as SerializableName,
    deserializer,
  )
}

export function isClassInstance(value: unknown): value is ClassInstance {
  return value !== undefined
    && typeof value !== 'function'
    && value?.constructor?.name !== 'Object'
    && value?.constructor?.name !== 'Array'
}

export function isDeserializable(value: unknown): value is Deserializable {
  return (value as Deserializable)?.__serializable_name !== undefined
}

export function isSerializable(value: unknown): value is Serializable<object, object> {
  return (value as Serializable<object, object>)?.__deserialize !== undefined
}

// Least dodgy programming practice
export function evalUnknownClass(json: Deserializable, errString: string) {
  const clazz = eval(json.__serializable_name) as unknown
  if (typeof clazz !== 'function') {
    throw new Error(
      errString + `
Basically eval failed lmao. 
The environment (closures) doesn't have any class with the given name.
Web worker specific: Is the class referenced in your web worker? 
Vite would be smart enough to bundle that class into the web worker bundle if you do so.
If you indeed did so, it is likely that the class is shadowed in a closure.`,
    )
  }
  if (!clazz.toString().startsWith('class')) {
    throw new Error(
      errString + `
Eval results in a function, but it is not a class declaration.
Is the class declaration shadowed in a closure?`,
    )
  }
  // well, for better or worse, we did got a class constructor
  return function(json: unknown) {
    return Object.assign(Object.create(clazz.prototype as object), json) as unknown
  }
}
