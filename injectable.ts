import { FAKE_INJECTABLE_WATERMARK } from './common/const'

export default function Injectable() {
  return (target: any) => {
    Reflect.defineMetadata(FAKE_INJECTABLE_WATERMARK, true, target)
  }
}
