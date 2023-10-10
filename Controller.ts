import { FAKE_BASE_PATH } from './common/const'

export default function Controller(path: string) {
  return (target: any) => {
    Reflect.defineMetadata(FAKE_BASE_PATH, path, target)
  }
}
