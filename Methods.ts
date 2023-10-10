import { FAKE_METHOD, FAKE_PATH, REQUEST_METHOD } from './common/const'

function Request(method: REQUEST_METHOD) {
  return (path: string) => {
    return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(FAKE_METHOD, method, target, propertyKey)
      Reflect.defineMetadata(FAKE_PATH, path, target, propertyKey)
    }
  }
}

export const Get = Request('Get')
export const Post = Request('Post')