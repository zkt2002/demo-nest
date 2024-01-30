import 'reflect-metadata'
import express from 'express'
import { FAKE_BASE_PATH, FAKE_INJECTABLE_WATERMARK, FAKE_METHOD, FAKE_PATH } from './common/const'

class _FakeFactory {
  private app: any
  private types: Record<string, any>

  constructor() {
    this.app = express()
    this.types = {}
  }

  // 调用该方法以注册所需信息至Express实例并返回
  create(module: any) {
    if (!module) return

    const Controllers = Reflect.getMetadata('controllers', module)

    this.initControllers(Controllers)
    return this.app
  }

  // 初始化所有Controllers
  initControllers(Controllers: any) {
    Controllers.map((Controller: any) => {
      // 获取constructor所需provider
      const paramtypes = Reflect.getMetadata('design:paramtypes', Controller)

      // provider 需要是 inject 注入的才能使用, 
      const args = paramtypes.map((Type: any) => {
        if (!Reflect.getMetadata(FAKE_INJECTABLE_WATERMARK, Type)) {
          throw new Error(`${Type.name} is not injectable!`)
        }
        // 返回缓存的type或新建type（只初始化一个Type实例）
        return this.types[Type.name] ? this.types[Type.name] : (this.types[Type.name] = new Type())
      })
      const controller = new Controller(...args)
      const bastPath = Reflect.getMetadata(FAKE_BASE_PATH, Controller)
      this.initRoute(controller, bastPath)
    })
  }

  // 初始化一个controller实例上所有的监听方法
  initRoute(controller: any, basePath: string) {
    const proto = Reflect.getPrototypeOf(controller)
    
    if (!proto) {
      return
    }
    const methodsNames = Object.getOwnPropertyNames(proto).filter(
      item => item !== 'constructor' && typeof proto[item] === 'function'
    )
    

    methodsNames.forEach(methodName => {
      const fn = proto[methodName]
      // 取出定义的 metadata
      const method = Reflect.getMetadata(FAKE_METHOD, controller, methodName)
      const path = Reflect.getMetadata(FAKE_PATH, controller, methodName)
      
      // 忽略未装饰方法
      if (!method || !path) {
        return
      }
      // 构造并注册路由
      const route = {
        path: basePath + path,
        method: method.toLowerCase(),
        fn: fn.bind(controller)
      }
      
      this.registerRoute(route)
    })
  }

  // 将Http监听方法注册至Express实例之中
  registerRoute(route: { path: string; method: string; fn: Function }) {
    const { path, method, fn } = route
    // Express实例上注册路由
    this.app[method](path, (req: any, res: any) => {
      res.send(fn(req))
    })
  }
}

export const FakeFactory = new _FakeFactory()
